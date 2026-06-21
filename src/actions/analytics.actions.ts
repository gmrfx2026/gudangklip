"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";

export async function getBrandAnalytics() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: userId },
    include: {
      _count: { select: { participants: true } },
      submissions: {
        include: { viewLogs: { select: { views: true } } },
      },
    },
  });

  const totalViews = campaigns.reduce(
    (sum, c) =>
      sum + c.submissions.reduce((s, sub) => s + sub.viewLogs.reduce((v, vl) => v + vl.views, 0), 0),
    0
  );

  const totalBudget = campaigns.reduce((sum, c) => sum + c.totalBudget, 0);
  const usedBudget = campaigns.reduce((sum, c) => sum + (c.totalBudget - c.remainingBudget), 0);
  const remainingBudget = campaigns.reduce((sum, c) => sum + c.remainingBudget, 0);
  const budgetPercent = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0;

  const allSubmissions = campaigns.flatMap((c) => c.submissions);

  const uniqueCreators = new Set(
    allSubmissions.map((s) => s.creatorId)
  ).size;

  const costPerView = totalViews > 0 ? Math.round(usedBudget / totalViews) : 0;

  const totalSubmissions = allSubmissions.length;

  const engagementRate =
    totalSubmissions > 0 && uniqueCreators > 0
      ? Math.round((totalSubmissions / uniqueCreators) * 100) / 100
      : 0;

  const topCampaigns = campaigns
    .map((c) => {
      const views = c.submissions.reduce(
        (s, sub) => s + sub.viewLogs.reduce((v, vl) => v + vl.views, 0),
        0
      );
      const spent = c.totalBudget - c.remainingBudget;
      const roi = spent > 0 ? Math.round((views * (c.cpmRate / 1000)) / spent * 100) : 0;
      return {
        name: c.title,
        views,
        creators: c._count.participants,
        roi,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Status counts
  const statusCounts = {
    approved: allSubmissions.filter((s) => s.status === "APPROVED").length,
    pending: allSubmissions.filter((s) => s.status === "PENDING").length,
    rejected: allSubmissions.filter((s) => s.status === "REJECTED").length,
  };

  // Platform distribution
  const platformMap: Record<string, number> = {};
  for (const s of allSubmissions) {
    if (s.platform) {
      platformMap[s.platform] = (platformMap[s.platform] || 0) + 1;
    }
  }
  const platformDistribution = Object.entries(platformMap).map(([platform, count]) => ({
    platform,
    count,
    percent: allSubmissions.length > 0 ? Math.round((count / allSubmissions.length) * 100) : 0,
  }));

  // Average CPM original (from campaigns) vs effective (total spent / total views * 1000)
  const avgCpmOriginal = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + c.cpmRate, 0) / campaigns.length)
    : 0;
  const cpmEffective = totalViews > 0 ? Math.round((usedBudget / totalViews) * 1000) : 0;

  // Approved videos
  const approvedVideos = await prisma.submission.findMany({
    where: { campaign: { brandId: userId }, status: "APPROVED" },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      campaign: { select: { id: true, title: true } },
      viewLogs: { select: { views: true } },
    },
    orderBy: { reviewedAt: "desc" },
    take: 20,
  });

  return {
    totalViews,
    totalBudget,
    spent: usedBudget,
    remaining: remainingBudget,
    budgetPercent,
    costPerView,
    cpmEffective,
    cpmOriginal: avgCpmOriginal,
    totalReach: totalViews,
    engagementRate,
    activeCreators: uniqueCreators,
    totalSubmissions,
    topCampaigns,
    statusCounts,
    platformDistribution,
    approvedVideos: approvedVideos.map((s) => ({
      id: s.id,
      creatorName: s.creator.name || s.creator.id,
      campaignTitle: s.campaign.title,
      videoUrl: s.videoUrl,
      platformLink: s.platformLink,
      platform: s.platform,
      views: s.viewLogs.reduce((sum, v) => sum + v.views, 0),
      reviewedAt: s.reviewedAt?.toISOString() || null,
      status: s.status,
    })),
  };
}
