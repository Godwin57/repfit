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

export async function generateAiMessages(
  customers: CustomerData[],
  context: string,
  gymOwnerId?: string,
): Promise<CustomerMessage[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  // 1. Securely fetch the Review Link
  let ownerId = gymOwnerId;
  if (!ownerId) {
    const user = await currentUser();
    if (user) ownerId = user.id;
  }

  let reviewLink = "";
  if (ownerId) {
    const owner = await prisma.gymOwner.findUnique({
      where: { id: ownerId },
      select: { googleReviewLink: true },
    });
    if (owner?.googleReviewLink) {
      reviewLink = owner.googleReviewLink;
    }
  }

  const finalLink =
    reviewLink || "https://search.google.com/local/writereview?placeid=YOUR_ID";
  const customerListJson = JSON.stringify(customers);

  const prompt = `
    You are an expert fitness marketer writing personalized messages for gym members.
    Overall Campaign Context: "${context}"
    
    Here is a JSON list of customers:
    ${customerListJson}

    Your task: Write a short, highly engaging, personalized message for EACH customer based on the context. 
    You MUST include this exact review link in your message: ${finalLink}
    Do NOT use placeholders like [REVIEW_LINK]. Inject the real link naturally into the message.
    
    You MUST return a raw JSON array of objects. Each object must have the exact "name" of the customer and the generated "message". 
  `;

  // --- NEW: THE EXPONENTIAL BACKOFF RETRY LOOP ---
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      const aiResponses = JSON.parse(text) as {
        name: string;
        message: string;
      }[];

      const finalMessages: CustomerMessage[] = customers.map((customer) => {
        const match = aiResponses.find((r) => r.name === customer.name);
        return {
          customer,
          message: match
            ? match.message
            : `Hey ${customer.name}, checking in from RepFit! How are your workouts going? ${finalLink}`,
        };
      });

      return finalMessages; // Success! Return the messages and exit the loop.
    } catch (error) {
      console.warn(`[GEMINI WARNING] Attempt ${attempt} failed:`, error);

      if (attempt === MAX_RETRIES) {
        console.error("[GEMINI ERROR] All retry attempts failed.");
        throw new Error(
          "Failed to generate batch messages after multiple attempts.",
        );
      }

      // Wait before retrying (1s, then 2s, then 4s)
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`Waiting ${waitTime}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  return []; // Fallback (should never technically hit this)
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

    const result = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
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
