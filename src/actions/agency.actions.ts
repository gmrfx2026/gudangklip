"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getAgencyInviteLink() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "AGENCY") {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (!user?.referralCode) {
    const newCode = (await import("@/lib/utils")).generateReferralCode();
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: newCode },
    });
    return { inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${newCode}` };
  }

  return { inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user.referralCode}` };
}

export async function getAgencyOverview() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "AGENCY") {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  const agency = await prisma.agency.findFirst({
    where: { ownerId: userId },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          trustScore: true,
          totalViews: true,
          totalEarnings: true,
        },
      },
    },
  });

  if (!agency) throw new Error("Agency not found");

  const totalViews = agency.members.reduce((sum, m) => sum + m.totalViews, 0);
  const totalEarnings = agency.members.reduce((sum, m) => sum + m.totalEarnings, 0);
  const commission = Math.round(totalEarnings * agency.commissionRate / 100);

  return {
    agencyName: agency.name,
    commissionRate: agency.commissionRate,
    totalMembers: agency.members.length,
    totalViews,
    totalEarnings,
    commission,
    members: agency.members,
  };
}

export async function getAgencyMembers() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "AGENCY") {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  const agency = await prisma.agency.findFirst({
    where: { ownerId: userId },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          trustScore: true,
          totalViews: true,
          totalEarnings: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agency) throw new Error("Agency not found");

  return agency.members.map((m) => ({
    ...m,
    commission: Math.round(m.totalEarnings * agency.commissionRate / 100),
  }));
}
