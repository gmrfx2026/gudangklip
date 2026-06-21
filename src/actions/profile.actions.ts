"use server";

import { prisma } from "@/lib/prisma";
import { auth, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(imageUrl: string) {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl },
  });

  revalidatePath("/creator/profile");
}

export async function getBrandProfile() {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      companyName: true,
      industry: true,
      createdAt: true,
    },
  });
}

export async function updateBrandProfile(data: {
  name?: string;
  companyName?: string;
  industry?: string;
  image?: string;
}) {
  const session = await auth();
  const { id: userId } = getSessionUser(session);
  if (!userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.industry !== undefined && { industry: data.industry as any }),
      ...(data.image !== undefined && { image: data.image }),
    },
  });

  revalidatePath("/brand/settings");
  revalidatePath("/brand");
  return { success: true };
}
