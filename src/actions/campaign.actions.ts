"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { CampaignInput } from "@/lib/validations";

export async function createCampaign(data: CampaignInput) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "BRAND") {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.create({
    data: {
      brandId: (session.user as any).id,
      title: data.title,
      description: data.description,
      brief: data.brief || "",
      category: data.category,
      totalBudget: data.totalBudget,
      remainingBudget: data.totalBudget,
      cpmRate: data.cpmRate,
      minViewsToClaim: data.minViewsToClaim,
      maxViewsPerVideo: data.maxViewsPerVideo || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: "DRAFT",
    },
  });

  revalidatePath("/brand/campaigns");
  return campaign;
}

export async function getBrandCampaigns() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: (session.user as any).id },
    include: {
      _count: { select: { participants: true, submissions: true } },
      submissions: {
        include: {
          viewLogs: { select: { views: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return campaigns.map((c) => {
    const totalViews = c.submissions.reduce(
      (sum, sub) => sum + sub.viewLogs.reduce((s, v) => s + v.views, 0),
      0
    );
    const { submissions, ...rest } = c;
    return { ...rest, totalViews };
  });
}

export async function getBrandCampaignById(campaignId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId: (session.user as any).id },
    include: {
      _count: { select: { participants: true, submissions: true } },
      submissions: {
        include: {
          creator: { select: { id: true, name: true, image: true } },
          viewLogs: { select: { views: true } },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!campaign) throw new Error("Campaign not found");

  const totalViews = campaign.submissions.reduce(
    (sum, sub) => sum + sub.viewLogs.reduce((s, v) => s + v.views, 0),
    0
  );

  return { ...campaign, totalViews };
}

export async function getBrandOverview() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const brandId = (session.user as any).id;

  const campaigns = await prisma.campaign.findMany({
    where: { brandId },
    include: {
      _count: { select: { participants: true, submissions: true } },
      participants: { select: { creatorId: true } },
      submissions: {
        include: { viewLogs: { select: { views: true } } },
      },
    },
  });

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalViews = campaigns.reduce((sum, c) => {
    return sum + c.submissions.reduce((s, sub) => s + sub.viewLogs.reduce((v, vl) => v + vl.views, 0), 0);
  }, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.totalBudget, 0);
  const usedBudget = campaigns.reduce((sum, c) => sum + (c.totalBudget - c.remainingBudget), 0);
  const uniqueCreators = new Set(campaigns.flatMap((c) => c.participants.map((p) => p.creatorId))).size;

  const recentSubmissions = await prisma.submission.findMany({
    where: { campaign: { brandId } },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      campaign: { select: { id: true, title: true } },
      viewLogs: { select: { views: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  return {
    activeCount,
    totalViews,
    totalBudget,
    usedBudget,
    uniqueCreators,
    recentSubmissions: recentSubmissions.map((s) => ({
      id: s.id,
      creatorName: s.creator.name || s.creator.id,
      campaignTitle: s.campaign.title,
      views: s.viewLogs.reduce((sum, v) => sum + v.views, 0),
      status: s.status,
    })),
  };
}

export async function getActiveCampaigns() {
  return prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    include: {
      brand: { select: { id: true, name: true, image: true } },
      _count: { select: { participants: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
