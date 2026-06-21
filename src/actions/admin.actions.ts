"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notification.actions";

export async function getAdminStats() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [totalUsers, activeCampaigns, pendingSubmissions, payoutAgg] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.payout.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const pendingCampaigns = await prisma.campaign.findMany({
    where: { status: "DRAFT" },
    include: { brand: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    totalUsers,
    activeCampaigns,
    pendingSubmissions,
    totalPayout: payoutAgg._sum.amount ?? 0,
    recentUsers,
    pendingCampaigns,
  };
}

export async function getAllUsers() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trustScore: true,
      totalEarnings: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

const VALID_ROLES = ["BRAND", "CREATOR", "AGENCY", "ADMIN"] as const;

export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!VALID_ROLES.includes(role as any)) {
    throw new Error(`Role tidak valid: ${role}. Role yang diizinkan: ${VALID_ROLES.join(", ")}`);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
  });

  revalidatePath("/admin/users");
}

export async function approveCampaign(campaignId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "ACTIVE" },
    include: { brand: { select: { id: true, name: true } } },
  });

  await createNotification(
    campaign.brand.id,
    "Campaign Disetujui",
    `Campaign "${campaign.title}" telah disetujui dan sekarang aktif. Creator dapat mulai bergabung!`,
    `/brand/campaigns/${campaignId}`
  );

  revalidatePath("/admin");
}

export async function rejectCampaign(campaignId: string, reason?: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "ENDED" },
    include: { brand: { select: { id: true, name: true } } },
  });

  await createNotification(
    campaign.brand.id,
    "Campaign Ditolak",
    `Campaign "${campaign.title}" ditolak oleh admin.${reason ? ` Alasan: ${reason}` : ""} Silakan review dan ajukan kembali.`,
    `/brand/campaigns`
  );

  revalidatePath("/admin");
}

export async function getAllPayouts() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.payout.findMany({
    include: {
      creator: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function processPayout(payoutId: string, status: "PROCESSING" | "COMPLETED" | "FAILED") {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status,
      processedAt: new Date(),
    },
  });

  if (status === "FAILED") {
    const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
    if (payout) {
      await prisma.user.update({
        where: { id: payout.creatorId },
        data: { walletBalance: { increment: payout.amount } },
      });
    }
  }

  revalidatePath("/admin/payouts");
}
