"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";

export async function getBrandBudget() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  const [user, campaigns, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    }),
    prisma.campaign.findMany({
      where: { brandId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        totalBudget: true,
        remainingBudget: true,
        createdAt: true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    walletBalance: user?.walletBalance ?? 0,
    campaigns: campaigns.map((c) => ({
      ...c,
      createdAt: c.createdAt?.toISOString?.() ?? c.createdAt,
    })),
    transactions: transactions.map((tx) => ({
      ...tx,
      createdAt: tx.createdAt.toISOString(),
    })),
  };
}
