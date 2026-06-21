import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const rateLimit = checkRateLimit(`upload:${userId}`, "upload");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Terlalu banyak upload. Coba lagi nanti." },
      { status: 429, headers: { "X-RateLimit-Reset": String(rateLimit.resetAt) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".bin";
    const fileName = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url, fileName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    console.error(`[Upload] ${message}`);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
