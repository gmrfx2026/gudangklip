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

  const uniqueCreators = new Set(
    campaigns.flatMap((c) =>
      c.submissions.map((s) => s.creatorId)
    )
  ).size;

  const costPerView = totalViews > 0 ? Math.round(usedBudget / totalViews) : 0;

  const totalSubmissions = campaigns.reduce((sum, c) => sum + c.submissions.length, 0);

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

  return {
    totalReach: totalViews,
    engagementRate,
    costPerView,
    activeCreators: uniqueCreators,
    topCampaigns,
  };
}
