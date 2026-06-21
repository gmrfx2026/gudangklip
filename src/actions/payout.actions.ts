"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function requestPayout(data: {
  amount: number;
  payoutMethod: string;
  accountInfo: string;
}) {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.walletBalance < data.amount) {
    throw new Error("Saldo tidak mencukupi");
  }

  if (data.amount < 50000) {
    throw new Error("Minimal penarikan Rp 50.000");
  }

  const payout = await prisma.payout.create({
    data: {
      creatorId: user.id,
      amount: data.amount,
      payoutMethod: data.payoutMethod,
      accountInfo: data.accountInfo,
      status: "PENDING",
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { walletBalance: { decrement: data.amount } },
  });

  revalidatePath("/creator/wallet");
  return payout;
}

export async function getPayoutHistory() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  return prisma.payout.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
  });
}
