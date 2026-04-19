import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAiMessages } from "@/app/actions/campaign";
import { sendSms, sendEmail } from "@/lib/delivery";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.VERCEL_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Find the oldest active campaign that has PENDING requests
    const targetCampaign = await prisma.campaign.findFirst({
      where: {
        reviewRequests: {
          // FIXED: Changed from 'requests'
          some: { status: "PENDING" },
        },
      },
      include: {
        reviewRequests: {
          // FIXED: Changed from 'requests'
          where: { status: "PENDING" },
          take: 10,
          include: { customer: true },
        },
      },
    });

    // If the queue is empty, go back to sleep
    if (!targetCampaign || targetCampaign.reviewRequests.length === 0) {
      return NextResponse.json({ message: "Queue is empty. Sleeping." });
    }

    // 3. Format the data to match our Gemini batch generator
    const customersToProcess = targetCampaign.reviewRequests.map((req) => ({
      name: req.customer.name,
      phone: req.customer.phone || undefined,
      email: req.customer.email || undefined,
    }));

    // 4. Trigger Gemini to write the messages in one shot
    const aiMessages = await generateAiMessages(
      customersToProcess,
      targetCampaign.aiMessageTemplate,
    );

    // 5. Fire the Physical Delivery Layer
    for (const req of targetCampaign.reviewRequests) {
      // FIXED: Changed from 'requests'
      const match = aiMessages.find(
        (ai) => ai.customer.name === req.customer.name,
      );
      const finalMessage = match
        ? match.message
        : `Hey ${req.customer.name}, checking in from RepFit! [REVIEW_LINK]`;

      let deliverySuccess = false;

      // Prioritize SMS, fallback to Email
      if (req.customer.phone) {
        // Sanitize the phone number: remove spaces, dashes, and parentheses
        let cleanPhone = req.customer.phone.replace(/[\s\-\(\)]/g, "");

        if (!cleanPhone.startsWith("+")) {
          if (cleanPhone.startsWith("0")) {
            // Drop the first zero and add +234
            cleanPhone = "+234" + cleanPhone.substring(1);
          } else if (cleanPhone.startsWith("234")) {
            // If they just forgot the plus sign
            cleanPhone = "+" + cleanPhone;
          } else {
            // Fallback assumption
            cleanPhone = "+234" + cleanPhone;
          }
        }

        console.log(`[TWILIO ATTEMPT] Trying to send SMS to: ${cleanPhone}`); // <--- ADD THIS LOG

        const result = await sendSms(cleanPhone, finalMessage);

        if (!result.success) {
          console.error(
            `[TWILIO ERROR] Failed for ${cleanPhone}:`,
            result.error,
          ); // <--- ADD THIS LOG
        }

        deliverySuccess = result.success;
      } else if (req.customer.email) {
        const result = await sendEmail(
          req.customer.email,
          "A quick question about your workouts",
          finalMessage,
        );
        deliverySuccess = result.success;
      }

      // 6. Update the database record
      await prisma.reviewRequest.update({
        where: { id: req.id },
        data: {
          status: deliverySuccess ? "SENT" : "FAILED",
          personalizedAiMessage: finalMessage,
        },
      });
    }

    return NextResponse.json({
      success: true,
      processed: targetCampaign.reviewRequests.length, // FIXED: Changed from 'requests'
      campaignId: targetCampaign.id,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { error: "Failed to process queue" },
      { status: 500 },
    );
  }
}
