"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// NEW: Fetch existing settings so the UI isn't blank on reload
export async function getGymSettings(userId: string) {
  try {
    const owner = await prisma.gymOwner.findUnique({
      where: { id: userId },
    });
    return { success: true, settings: owner };
  } catch (error) {
    return { success: false, error: "Failed to fetch settings" };
  }
}

export async function saveGymSettings(
  userId: string,
  link: string,
  timezone: string,
  senderName: string,
  businessName: string,
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const primaryEmail =
      user.emailAddresses[0]?.emailAddress || "unknown@example.com";
    const fullName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Gym Owner";

    await prisma.gymOwner.upsert({
      where: { id: userId },
      update: {
        googleReviewLink: link,
        timezone: timezone,
        senderName: senderName,
        businessName: businessName,
      },
      create: {
        id: userId,
        name: fullName,
        email: primaryEmail,
        googleReviewLink: link,
        timezone: timezone,
        senderName: senderName,
        businessName: businessName,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to save settings" };
  }
}
