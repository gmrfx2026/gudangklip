"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCreatorOverview() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true, trustScore: true, totalViews: true, totalEarnings: true },
  });

  const [submissionsCount, activeParticipations] = await Promise.all([
    prisma.submission.count({ where: { creatorId: userId } }),
    prisma.campaignParticipant.count({
      where: { creatorId: userId, campaign: { status: "ACTIVE" } },
    }),
  ]);

  return {
    walletBalance: user?.walletBalance ?? 0,
    totalViews: user?.totalViews ?? 0,
    totalEarnings: user?.totalEarnings ?? 0,
    trustScore: user?.trustScore ?? 0,
    submissionsCount,
    activeCampaigns: activeParticipations,
  };
}

export async function getCreatorCampaigns() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  const participations = await prisma.campaignParticipant.findMany({
    where: { creatorId: userId },
    include: {
      campaign: {
        include: {
          _count: { select: { participants: true, submissions: true } },
          submissions: {
            where: { creatorId: userId },
            include: { viewLogs: { select: { views: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return participations.map((p) => {
    const myViews = p.campaign.submissions.reduce(
      (sum, sub) => sum + sub.viewLogs.reduce((s, v) => s + v.views, 0),
      0
    );
    const earnings = Math.round(myViews * p.campaign.cpmRate / 1000);
    return {
      id: p.campaign.id,
      title: p.campaign.title,
      category: p.campaign.category,
      cpmRate: p.campaign.cpmRate,
      status: p.campaign.status,
      joinedAt: p.joinedAt,
      submissionsCount: p.campaign.submissions.length,
      totalViews: myViews,
      earnings,
    };
  });
}

export async function getCreatorJoinedCampaignIds() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  const participations = await prisma.campaignParticipant.findMany({
    where: { creatorId: userId },
    select: { campaignId: true },
  });

  return participations.map((p) => p.campaignId);
}

export async function getCreatorSocialAccounts() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  return prisma.socialAccount.findMany({
    where: { userId },
    select: { id: true, platform: true, username: true, verified: true, followersCount: true },
  });
}

export async function addSocialAccount(platform: string, username: string) {
  const session = await auth();
  const { id: userId, role } = getSessionUser(session);
  if (!userId || role !== "CREATOR") throw new Error("Unauthorized");

  const existing = await prisma.socialAccount.findUnique({
    where: { userId_platform: { userId, platform: platform as any } },
  });
  if (existing) throw new Error("Platform ini sudah terhubung");

  const account = await prisma.socialAccount.create({
    data: {
      userId,
      platform: platform as any,
      username,
      verified: false,
      verificationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    select: { id: true, platform: true, username: true, verified: true, followersCount: true },
  });

  revalidatePath("/clipper/settings");
  return account;
}

export async function disconnectSocialAccount(accountId: string) {
  const session = await auth();
  const { id: userId, role } = getSessionUser(session);
  if (!userId || role !== "CREATOR") throw new Error("Unauthorized");

  const account = await prisma.socialAccount.findUnique({
    where: { id: accountId },
    select: { userId: true },
  });
  if (!account || account.userId !== userId) throw new Error("Unauthorized");

  await prisma.socialAccount.delete({ where: { id: accountId } });
  revalidatePath("/clipper/settings");
  return { success: true };
}
