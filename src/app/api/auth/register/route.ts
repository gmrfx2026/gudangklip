import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, companyName, industry, referralCode } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
    }

    if (role === "BRAND" && (!companyName || !industry)) {
      return NextResponse.json({ message: "Nama perusahaan dan industri wajib diisi untuk Brand" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newReferralCode = generateReferralCode();
    const verificationToken = crypto.randomBytes(32).toString("hex");

    let referredBy: string | undefined;
    let agencyId: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
        include: { ownedAgency: { select: { id: true } } },
      });
      if (referrer) {
        referredBy = referrer.id;
        if (referrer.role === "AGENCY" && referrer.ownedAgency) {
          agencyId = referrer.ownedAgency.id;
        }
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        companyName: role === "BRAND" ? companyName : null,
        industry: role === "BRAND" ? industry : null,
        referralCode: newReferralCode,
        referredBy,
        agencyId,
      },
    });

    if (referredBy && role === "AGENCY") {
      await prisma.agency.create({
        data: {
          name: `${name}'s Agency`,
          ownerId: user.id,
        },
      });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: expiresAt,
      },
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch {
      console.warn("Failed to send verification email, token still created in DB");
    }

    return NextResponse.json({ message: "Registrasi berhasil! Cek email untuk verifikasi." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Terjadi kesalahan" }, { status: 500 });
  }
}
