"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(imageUrl: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { image: imageUrl },
  });

  revalidatePath("/creator/profile");
}

export async function updateProfile(data: { name?: string; phone?: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
  });

  revalidatePath("/creator/profile");
}
