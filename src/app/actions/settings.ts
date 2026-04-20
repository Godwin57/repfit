"use server";

import { prisma } from "@/lib/prisma";

export async function saveReviewLink(userId: string, link: string) {
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        googleReviewLink: link,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Database Error: Failed to save review link", error);
    return { success: false, error: "Failed to save link" };
  }
}
