"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";

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
