"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notification.actions";

export async function submitVideo(data: {
  campaignId: string;
  videoUrl?: string;
  platformLink?: string;
  platform?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "CREATOR") {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.submission.create({
    data: {
      campaignId: data.campaignId,
      creatorId: (session.user as any).id,
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
      `${session.user.name} mengirim video untuk campaign "${campaign.title}"`,
      `/brand/campaigns/${data.campaignId}`
    );
  }

  revalidatePath("/creator/submissions");
  return submission;
}

export async function getCreatorSubmissions() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.submission.findMany({
    where: { creatorId: (session.user as any).id },
    include: {
      campaign: { select: { title: true, cpmRate: true } },
      viewLogs: { select: { views: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

const VALID_SUBMISSION_STATUSES = ["APPROVED", "REJECTED"] as const;

export async function reviewSubmission(submissionId: string, status: string, notes?: string) {
  if (!VALID_SUBMISSION_STATUSES.includes(status as any)) {
    throw new Error(`Status submission tidak valid: ${status}. Gunakan APPROVED atau REJECTED.`);
  }

  const session = await auth();
  if (!session?.user || !["BRAND", "ADMIN"].includes((session.user as any).role)) {
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
    "/creator/submissions"
  );

  revalidatePath("/brand/campaigns");
}
