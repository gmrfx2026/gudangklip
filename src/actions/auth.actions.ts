"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function connectSocialAccount(data: {
  platform: string;
  username: string;
}) {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  await prisma.socialAccount.create({
    data: {
      userId,
      platform: data.platform as any,
      username: data.username,
      verified: true,
    },
  });

  revalidatePath("/creator/profile");
}

export async function getSocialAccounts() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  return prisma.socialAccount.findMany({
    where: { userId },
  });
}

export async function joinCampaign(campaignId: string) {
  const session = await auth();
  const { id: userId, role } = getSessionUser(session);
  if (!userId || role !== "CREATOR") {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.campaignParticipant.findUnique({
    where: { campaignId_creatorId: { campaignId, creatorId: userId } },
  });

  if (existing) throw new Error("Already joined this campaign");

  await prisma.campaignParticipant.create({
    data: {
      campaignId,
      creatorId: userId,
    },
  });

  revalidatePath("/creator/campaigns");
}
