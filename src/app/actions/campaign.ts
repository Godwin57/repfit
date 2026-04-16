"use server";

import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface CustomerData {
  name: string;
  phone: string;
}

export interface CustomerMessage {
  customer: CustomerData;
  message: string;
}

/**
 * Accepts a base64 string or raw text of a CSV file.
 * Uses papaparse to extract Name and Phone columns.
 * Returns the parsed array of customers.
 */
export async function processCsvUpload(
  csvInput: string,
): Promise<CustomerData[]> {
  let csvText = csvInput;

  // Handle base64 encoded data URIs
  if (csvInput.includes(";base64,")) {
    const base64Content = csvInput.split(";base64,")[1];
    csvText = Buffer.from(base64Content, "base64").toString("utf-8");
  }

  return new Promise((resolve, reject) => {
    Papa.parse<{ [key: string]: string }>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const customers: CustomerData[] = [];

        for (const row of results.data) {
          // Normalize keys to lowercase for flexible matching
          const normalizedRow: { [key: string]: string } = {};
          for (const key in row) {
            normalizedRow[key.trim().toLowerCase()] = row[key];
          }

          const name = normalizedRow["name"] || "";
          const phone =
            normalizedRow["phone"] ||
            normalizedRow["phonenumber"] ||
            normalizedRow["phone number"] ||
            "";

          if (name && phone) {
            customers.push({ name: name.trim(), phone: phone.trim() });
          }
        }

        resolve(customers);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

/**
 * Accepts an array of customers (Name, Phone) and the "AI Message Context" string.
 * Prompts Gemini API to generate a personalized SMS including [REVIEW_LINK].
 * Returns the array mapped with their personalized messages.
 */
export async function generateAiMessages(
  customers: CustomerData[],
  context: string,
): Promise<CustomerMessage[]> {
  // Initialize the Gemini 2.5 Flash model and force it to return strictly formatted JSON
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  // We stringify the entire array of customers to send in ONE request
  const customerListJson = JSON.stringify(customers);

  const prompt = `
    You are an expert fitness marketer writing personalized SMS text messages for gym members.
    Overall Campaign Context: "${context}"
    
    Here is a JSON list of customers:
    ${customerListJson}

    Your task: Write a short, highly engaging, personalized SMS (under 150 characters) for EACH customer based on the context. Ensure you include the placeholder [REVIEW_LINK] if asking for a review.
    
    You MUST return a raw JSON array of objects. Each object must have the exact "phone" of the customer and the generated "message". 
    Example format:
    [
      { "phone": "555-0101", "message": "Hey John, coach Sarah here..." }
    ]
  `;

  try {
    // ONE single API call for the entire CSV
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse the AI's JSON string back into a JavaScript array
    const aiResponses = JSON.parse(text) as {
      phone: string;
      message: string;
    }[];

    // Map the AI messages back to our original customer data
    const finalMessages: CustomerMessage[] = customers.map((customer) => {
      // Find the matching AI generated message by phone number
      const match = aiResponses.find((r) => r.phone === customer.phone);

      return {
        customer,
        message: match
          ? match.message
          : `Hey ${customer.name}, checking in from RepFit! How are your workouts going? [REVIEW_LINK]`, // Fallback just in case
      };
    });

    return finalMessages;
  } catch (error) {
    console.error("AI Batch Generation Error:", error);
    throw new Error("Failed to generate batch messages. Check server logs.");
  }
}

/**
 * Accepts the final array of customers and messages, and saves everything using Prisma transactions.
 */
export async function saveCampaign(
  gymOwnerId: string,
  aiMessageContext: string,
  messagesData: CustomerMessage[],
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create a new Campaign
      const campaign = await tx.campaign.create({
        data: {
          gymOwnerId,
          totalRecipients: messagesData.length,
          aiMessageTemplate: aiMessageContext, // Storing the context used as template
          status: "COMPLETED", // Adjust if you want DRAFT and then a separate send step
        },
      });

      // 2. Upsert Customer records & Create Review Requests
      for (const data of messagesData) {
        // We look up the customer by phone for this gym owner
        let customer = await tx.customer.findFirst({
          where: {
            phoneNumber: data.customer.phone,
            gymOwnerId: gymOwnerId,
          },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: data.customer.name,
              phoneNumber: data.customer.phone,
              gymOwnerId: gymOwnerId,
            },
          });
        } else if (customer.name !== data.customer.name) {
          // Optional: update the customer's name if they exist but name differs
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: { name: data.customer.name },
          });
        }

        // 3. Create ReviewRequest linked to Campaign and Customer
        await tx.reviewRequest.create({
          data: {
            customerId: customer.id,
            campaignId: campaign.id,
            gymOwnerId: gymOwnerId,
            personalizedAiMessage: data.message,
            status: "PENDING",
          },
        });
      }

      return campaign;
    });

    return { success: true, campaign: result };
  } catch (error) {
    console.error("Transaction failed when saving campaign:", error);
    return { success: false, error: "Failed to save the campaign" };
  }
}
