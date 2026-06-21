"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getUnreadCount() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) return 0;

  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAllRead() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
}

export async function createNotification(userId: string, title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId, title, message, link },
  });
}
