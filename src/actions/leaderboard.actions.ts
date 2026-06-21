"use server";

import { prisma } from "@/lib/prisma";

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    where: { role: "CREATOR" },
    select: {
      id: true,
      name: true,
      trustScore: true,
      totalViews: true,
      totalEarnings: true,
    },
    orderBy: { totalEarnings: "desc" },
    take: 20,
  });

  return users;
}
