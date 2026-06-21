"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function detectBotPattern(
  newViews: number,
  previousTotal: number,
  previousLogCount: number,
  timeSinceLastLog: number | null
): boolean {
  const spikeThreshold = 1000000;
  if (newViews > spikeThreshold) return true;

  if (previousLogCount > 0 && timeSinceLastLog !== null) {
    const avgViews = previousTotal / previousLogCount;

    if (avgViews > 0 && newViews > avgViews * 20 && newViews > 500000) {
      return true;
    }

    if (timeSinceLastLog < 2 * 60000 && newViews > 50000) {
      return true;
    }
  }

  if (newViews > 100000 && previousTotal === 0) return true;

  return false;
}

export async function simulateViewTracking() {
  const approvedSubmissions = await prisma.submission.findMany({
    where: { status: "APPROVED" },
    include: {
      campaign: { select: { cpmRate: true, startDate: true, endDate: true, maxViewsPerVideo: true } },
      viewLogs: { orderBy: { date: "desc" }, take: 1, select: { views: true, date: true } },
    },
  });

  let created = 0;

  for (const sub of approvedSubmissions) {
    const existingTotal = await prisma.viewLog.aggregate({
      where: { submissionId: sub.id },
      _sum: { views: true },
      _count: true,
    });

    const currentViews = existingTotal._sum.views || 0;
    const logCount = existingTotal._count || 0;
    const lastLog = sub.viewLogs[0];
    const timeSinceLast = lastLog ? Date.now() - new Date(lastLog.date).getTime() : null;

    const newViews = Math.floor(Math.random() * 15000) + 1000;
    const cappedNewViews = sub.campaign.maxViewsPerVideo
      ? Math.min(newViews, sub.campaign.maxViewsPerVideo - currentViews)
      : newViews;

    if (cappedNewViews <= 0) continue;

    const isBot = detectBotPattern(cappedNewViews, currentViews, logCount, timeSinceLast);
    const payoutAmount = isBot ? 0 : Math.round(cappedNewViews * sub.campaign.cpmRate / 1000);

    await prisma.viewLog.create({
      data: {
        submissionId: sub.id,
        views: cappedNewViews,
        payoutAmount,
        isBotFiltered: isBot,
      },
    });

    if (!isBot) {
      await prisma.user.update({
        where: { id: sub.creatorId },
        data: {
          totalViews: { increment: cappedNewViews },
          totalEarnings: { increment: payoutAmount },
          walletBalance: { increment: payoutAmount },
          trustScore: { increment: Math.floor(cappedNewViews / 10000) },
        },
      });
    }

    created++;
  }

  revalidatePath("/creator");
  revalidatePath("/brand");

  return { tracked: created };
}

export async function getViewStats(submissionId: string) {
  const viewLogs = await prisma.viewLog.findMany({
    where: { submissionId },
    orderBy: { date: "asc" },
  });

  const totalViews = viewLogs.reduce((sum, vl) => sum + vl.views, 0);
  const legitViews = viewLogs.filter((vl) => !vl.isBotFiltered).reduce((sum, vl) => sum + vl.views, 0);
  const totalPayout = viewLogs.reduce((sum, vl) => sum + (vl.payoutAmount || 0), 0);
  const botViews = totalViews - legitViews;

  return { totalViews, legitViews, botViews, totalPayout, viewLogs };
}
