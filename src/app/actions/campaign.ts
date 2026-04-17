"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Papa from "papaparse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendSms, sendEmail } from "@/lib/delivery";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface CustomerData {
  name: string;
  phone?: string;
  email?: string;
}

export interface CustomerMessage {
  customer: CustomerData;
  message: string;
}

/**
 * Accepts a base64 string or raw text of a CSV file.
 * Uses papaparse to extract Name, Phone, and Email columns.
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
          const email =
            normalizedRow["email"] || normalizedRow["email address"] || "";

          // Require a name, and AT LEAST a phone or an email
          if (name && (phone || email)) {
            customers.push({
              name: name.trim(),
              phone: phone.trim() || undefined,
              email: email.trim() || undefined,
            });
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
 * Accepts an array of customers and the "AI Message Context" string.
 * Prompts Gemini API to generate a personalized message.
 */
export async function generateAiMessages(
  customers: CustomerData[],
  context: string,
): Promise<CustomerMessage[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const customerListJson = JSON.stringify(customers);

  const prompt = `
    You are an expert fitness marketer writing personalized messages for gym members.
    Overall Campaign Context: "${context}"
    
    Here is a JSON list of customers:
    ${customerListJson}

    Your task: Write a short, highly engaging, personalized message for EACH customer based on the context. Ensure you include the placeholder [REVIEW_LINK] if asking for a review.
    
    You MUST return a raw JSON array of objects. Each object must have the exact "name" of the customer and the generated "message". 
    Example format:
    [
      { "name": "John Doe", "message": "Hey John, coach Sarah here..." }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const aiResponses = JSON.parse(text) as {
      name: string;
      message: string;
    }[];

    const finalMessages: CustomerMessage[] = customers.map((customer) => {
      // Find the matching AI generated message by Name to accommodate email-only users
      const match = aiResponses.find((r) => r.name === customer.name);

      return {
        customer,
        message: match
          ? match.message
          : `Hey ${customer.name}, checking in from RepFit! How are your workouts going? [REVIEW_LINK]`,
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
    // 1. Securely fetch the real user details from Clerk
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized: No Clerk user found." };
    }

    // Extract their primary email and full name
    const primaryEmail =
      user.emailAddresses[0]?.emailAddress || "unknown@example.com";
    const fullName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Gym Owner";

    const result = await prisma.$transaction(async (tx) => {
      // 2. Upsert the GymOwner before doing anything else
      await tx.gymOwner.upsert({
        where: { id: gymOwnerId },
        update: {},
        create: {
          id: gymOwnerId,
          name: fullName,
          email: primaryEmail,
        },
      });

      // 3. Create a new Campaign
      const campaign = await tx.campaign.create({
        data: {
          gymOwnerId,
          totalRecipients: messagesData.length,
          aiMessageTemplate: aiMessageContext,
          status: "COMPLETED",
        },
      });

      // 4. Upsert Customer records & Create Review Requests
      for (const data of messagesData) {
        // FIXED: Using "phone" instead of "phoneNumber" to match your Prisma schema
        let customer = await tx.customer.findFirst({
          where: {
            gymOwnerId: gymOwnerId,
            OR: [
              { phone: data.customer.phone || "___NO_PHONE___" },
              { email: data.customer.email || "___NO_EMAIL___" },
            ],
          },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: data.customer.name,
              phone: data.customer.phone || null, // FIXED
              email: data.customer.email || null,
              gymOwnerId: gymOwnerId,
            },
          });
        } else if (
          customer.name !== data.customer.name ||
          (!customer.email && data.customer.email)
        ) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: data.customer.name,
              ...(data.customer.email && !customer.email
                ? { email: data.customer.email }
                : {}),
            },
          });
        }

        // 5. Create ReviewRequest linked to Campaign and Customer
        await tx.reviewRequest.create({
          data: {
            customerId: customer.id,
            campaignId: campaign.id,
            gymOwnerId: gymOwnerId,
            personalizedAiMessage: data.message,
            status: "PENDING",
          },
        });

        // 6. THE DELIVERY INJECTION: Actually send the message
        // Prioritize SMS if they have a phone number, fallback to Email
        if (data.customer.phone) {
          // Note: In a real production app, we wouldn't await this inside the DB transaction
          // to avoid slowing down the save, but for MVP strict reliability, this is perfect.
          await sendSms(data.customer.phone, data.message);
        } else if (data.customer.email) {
          await sendEmail(
            data.customer.email,
            "Checking in on your fitness goals!",
            data.message,
          );
        }
      }

      return campaign;
    });

    return { success: true, campaign: result };
  } catch (error) {
    console.error("Transaction failed when saving campaign:", error);
    return { success: false, error: "Failed to save the campaign" };
  }
}
