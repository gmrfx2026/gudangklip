"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function connectSocialAccount(data: {
  platform: string;
  username: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.socialAccount.create({
    data: {
      userId: (session.user as any).id,
      platform: data.platform as any,
      username: data.username,
      verified: true,
    },
  });

  revalidatePath("/creator/profile");
}

export async function getSocialAccounts() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.socialAccount.findMany({
    where: { userId: (session.user as any).id },
  });
}

export async function joinCampaign(campaignId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "CREATOR") {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.campaignParticipant.findUnique({
    where: { campaignId_creatorId: { campaignId, creatorId: (session.user as any).id } },
  });

  if (existing) throw new Error("Already joined this campaign");

  await prisma.campaignParticipant.create({
    data: {
      campaignId,
      creatorId: (session.user as any).id,
    },
  });

  revalidatePath("/creator/campaigns");
}
