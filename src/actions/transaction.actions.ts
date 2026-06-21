"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { snap, generateOrderId } from "@/lib/midtrans";

export async function createTopUp(amount: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;
  const orderId = generateOrderId();

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: session.user.name || "User",
      email: session.user.email || "",
    },
  };

  const snapToken = await snap.createTransactionToken(parameter);

  await prisma.transaction.create({
    data: {
      userId,
      amount,
      midtransOrderId: orderId,
      status: "PENDING",
    },
  });

  return { snapToken, orderId };
}

export async function getTransactionHistory() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.transaction.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });
}
