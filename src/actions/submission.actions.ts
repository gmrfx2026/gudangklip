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

export async function reviewSubmission(submissionId: string, status: "APPROVED" | "REJECTED", notes?: string) {
  const session = await auth();
  if (!session?.user || !["BRAND", "ADMIN"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
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
    status === "APPROVED" ? "Submission Disetujui" : "Submission Ditolak",
    `${status === "APPROVED" ? "Selamat! " : "Maaf, "}submission kamu untuk "${submission.campaign.title}" telah ${status === "APPROVED" ? "disetujui" : "ditolak"}${notes ? `. Catatan: ${notes}` : ""}`,
    "/creator/submissions"
  );

  revalidatePath("/brand/campaigns");
}
