import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAiMessages } from "@/app/actions/campaign";
import { sendSms, sendEmail } from "@/lib/delivery";

export const maxDuration = 60;

// THE SAFETY THROTTLE: Maximum messages a single gym can send per day
const DAILY_LIMIT_PER_GYM = 5;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.VERCEL_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const candidateCampaigns = await prisma.campaign.findMany({
      where: {
        reviewRequests: { some: { status: "PENDING" } },
      },
      include: { gymOwner: true },
      take: 10,
    });

    let targetCampaign = null;
    let availableSlots = 0;

    // LOOP THROUGH GYMS TO FIND ONE THAT IS AWAKE AND UNDER LIMIT
    for (const campaign of candidateCampaigns) {
      // 1. THE TIMEZONE CHECK: Convert server time to Gym Owner's local time
      const gymTz = campaign.gymOwner.timezone || "UTC";
      const localDateString = new Date().toLocaleString("en-US", {
        timeZone: gymTz,
      });
      const localHour = new Date(localDateString).getHours();

      // If it is before 9 AM or after 6 PM locally, SKIP THIS GYM.
      if (localHour < 9 || localHour >= 18) {
        console.log(
          `Skipping Gym ${campaign.gymOwnerId}: Outside local business hours (${localHour}:00 ${gymTz})`,
        );
        continue;
      }

      // 2. THE VELOCITY CHECK: Have they hit their daily limit?
      const sentTodayCount = await prisma.reviewRequest.count({
        where: {
          gymOwnerId: campaign.gymOwnerId,
          status: "SENT",
          updatedAt: { gte: startOfDay },
        },
      });

      if (sentTodayCount < DAILY_LIMIT_PER_GYM) {
        targetCampaign = campaign;
        availableSlots = DAILY_LIMIT_PER_GYM - sentTodayCount;
        break;
      }
    }

    if (!targetCampaign) {
      return NextResponse.json({
        message: "All active campaigns are sleeping or at daily limits.",
      });
    }

    // 4. Fetch the pending requests for our target campaign, limited by their remaining slots
    const requestsToProcess = await prisma.reviewRequest.findMany({
      where: {
        campaignId: targetCampaign.id,
        status: "PENDING",
      },
      take: Math.min(availableSlots, 10), // Never process more than available slots
      include: { customer: true },
    });

    if (requestsToProcess.length === 0) {
      return NextResponse.json({ message: "Queue is empty. Sleeping." });
    }

    // 5. Format data and trigger Gemini
    const customersToProcess = requestsToProcess.map((req: any) => ({
      name: req.customer.name,
      phone: req.customer.phone || undefined,
      email: req.customer.email || undefined,
    }));

    const aiMessages = await generateAiMessages(
      customersToProcess,
      targetCampaign.aiMessageTemplate,
      targetCampaign.gymOwnerId,
    );

    const fallbackLink = targetCampaign.gymOwner?.googleReviewLink || "";
    let processedCount = 0;

    // 6. Fire the Physical Delivery Layer
    for (const req of requestsToProcess) {
      const match = aiMessages.find(
        (ai) => ai.customer.name === req.customer.name,
      );

      const finalMessage = match
        ? match.message
        : `Hey ${req.customer.name}, checking in from RepFit! ${fallbackLink}`.trim();

      let deliverySuccess = false;

      // Prioritize SMS, fallback to Email
      if (req.customer.phone) {
        let cleanPhone = req.customer.phone.replace(/[\s\-\(\)]/g, "");

        if (!cleanPhone.startsWith("+")) {
          if (cleanPhone.startsWith("0")) {
            cleanPhone = "+234" + cleanPhone.substring(1);
          } else if (cleanPhone.startsWith("234")) {
            cleanPhone = "+" + cleanPhone;
          } else {
            cleanPhone = "+234" + cleanPhone;
          }
        }

        console.log(`[TWILIO ATTEMPT] Sending SMS to: ${cleanPhone}`);
        const result = await sendSms(cleanPhone, finalMessage);

        if (!result.success) {
          console.error(
            `[TWILIO ERROR] Failed for ${cleanPhone}:`,
            result.error,
          );
        }
        deliverySuccess = result.success;
      } else if (req.customer.email) {
        const result = await sendEmail(
          req.customer.email,
          "Checking in on your fitness goals!",
          finalMessage,
        );
        deliverySuccess = result.success;
      }

      // 7. Update database to SENT (which updates the 'updatedAt' timestamp for tomorrow's check)
      await prisma.reviewRequest.update({
        where: { id: req.id },
        data: {
          status: deliverySuccess ? "SENT" : "FAILED",
          personalizedAiMessage: finalMessage,
        },
      });

      if (deliverySuccess) processedCount++;
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
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
