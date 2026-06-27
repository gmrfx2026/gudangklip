"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notification.actions";

const PLATFORM_URL_PATTERNS: Record<string, RegExp> = {
  TIKTOK: /^https?:\/\/(www\.)?(tiktok\.com\/@[\w.-]+\/(video|photo)\/[\w]+|vt\.tiktok\.com\/[\w]+\/?)$/,
  INSTAGRAM: /^https?:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[\w-]+\/?(\?.*)?$/,
  YOUTUBE: /^https?:\/\/(www\.)?(youtube\.com\/shorts\/[\w-]+|youtu\.be\/[\w-]+)(\?.*)?$/,
};

function validatePlatformUrl(platform: string, url: string): void {
  const pattern = PLATFORM_URL_PATTERNS[platform];
  if (!pattern) {
    throw new Error(`Invalid platform: ${platform}`);
  }
  if (!url || !pattern.test(url.trim())) {
    const hints: Record<string, string> = {
      TIKTOK: "https://www.tiktok.com/@username/video/... or https://vt.tiktok.com/...",
      INSTAGRAM: "https://www.instagram.com/reel/... or https://www.instagram.com/p/...",
      YOUTUBE: "https://www.youtube.com/shorts/... or https://youtu.be/...",
    };
    throw new Error(`Invalid ${platform} URL. Expected format: ${hints[platform]}`);
  }
}

export async function submitVideo(data: {
  campaignId: string;
  videoUrl?: string;
  platformLink?: string;
  platform?: string;
}) {
  const session = await auth();
  const { id: userId, role } = getSessionUser(session);
  if (!userId || role !== "CREATOR") {
    throw new Error("Unauthorized");
  }

  const link = (data.platformLink || data.videoUrl || "").trim();

  // Platform validation
  if (data.platform) {
    validatePlatformUrl(data.platform, link);
  }

  // Duplicate check: same creator, same campaign, same URL
  const existing = await prisma.submission.findFirst({
    where: {
      creatorId: userId,
      campaignId: data.campaignId,
      OR: [
        { platformLink: link },
        { videoUrl: link },
      ],
    },
  });
  if (existing) {
    throw new Error("You have already submitted this video URL to this campaign.");
  }

  const submission = await prisma.submission.create({
    data: {
      campaignId: data.campaignId,
      creatorId: userId,
      videoUrl: data.videoUrl || null,
      platformLink: data.platformLink || null,
      platform: (data.platform as any) || null,
      status: "PENDING",
    },
  });

  const campaign = await prisma.campaign.findUnique({
    where: { id: data.campaignId },
    select: { brandId: true, title: true },
  });

  if (campaign) {
    await createNotification(
      campaign.brandId,
      "Submission Baru",
      `${session?.user?.name ?? "Creator"} mengirim video untuk campaign "${campaign.title}"`,
      `/brand/campaigns/${data.campaignId}`
    );
  }

  revalidatePath("/clipper/dashboard");
  return submission;
}

export async function getCreatorSubmissions() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  return prisma.submission.findMany({
    where: { creatorId: userId },
    include: {
      campaign: { select: { title: true, cpmRate: true } },
      viewLogs: { select: { views: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getDailyViewStats() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

  const logs = await prisma.viewLog.findMany({
    where: {
      submission: { creatorId: userId },
      date: { gte: twentyEightDaysAgo },
    },
    select: { views: true, date: true },
  });

  const dailyMap = new Map<string, number>();
  for (const log of logs) {
    const dayKey = log.date.toISOString().slice(0, 10);
    dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + log.views);
  }

  const result: { date: string; views: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    result.push({
      date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      views: dailyMap.get(dayKey) || 0,
    });
  }
  return result;
}

const VALID_SUBMISSION_STATUSES = ["APPROVED", "REJECTED"] as const;

export async function reviewSubmission(submissionId: string, status: string, notes?: string) {
  if (!VALID_SUBMISSION_STATUSES.includes(status as any)) {
    throw new Error(`Status submission tidak valid: ${status}. Gunakan APPROVED atau REJECTED.`);
  }

  const session = await auth();
  const { id: userId, role } = getSessionUser(session);
  if (!userId || !["BRAND", "ADMIN"].includes(role ?? "")) {
    throw new Error("Unauthorized");
  }

  const typedStatus = status as "APPROVED" | "REJECTED";

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: typedStatus,
      reviewNotes: notes || null,
      reviewedAt: new Date(),
    },
    include: {
      campaign: { select: { title: true } },
      creator: { select: { id: true, name: true } },
    },
  });

  await createNotification(
    submission.creatorId,
    typedStatus === "APPROVED" ? "Submission Disetujui" : "Submission Ditolak",
    `${typedStatus === "APPROVED" ? "Selamat! " : "Maaf, "}submission kamu untuk "${submission.campaign.title}" telah ${typedStatus === "APPROVED" ? "disetujui" : "ditolak"}${notes ? `. Catatan: ${notes}` : ""}`,
    "/clipper/dashboard"
  );

  revalidatePath("/brand/campaigns");
}
