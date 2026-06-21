"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function scoreSubmission(submissionId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { campaign: { select: { title: true, brief: true } } },
  });

  if (!submission) throw new Error("Submission not found");

  try {
    const prompt = `You are a content quality evaluator for a clipping marketplace platform.
Score this video submission on a scale of 1-100 based on the following criteria:
- Relevance to campaign brief (40 pts)
- Creative quality (30 pts)
- Engagement potential (30 pts)

Campaign Title: ${submission.campaign.title}
Campaign Brief: ${submission.campaign.brief || "No brief provided"}
Platform: ${submission.platform || "Unknown"}

Return ONLY a single number between 1 and 100, nothing else.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 5,
      temperature: 0.3,
    });

    const score = parseInt(response.choices[0]?.message?.content?.trim() || "0", 10);

    if (isNaN(score) || score < 1 || score > 100) {
      return { score: 50, notes: "AI score unavailable, default applied" };
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: { aiScore: score },
    });

    return { score };
  } catch {
    return { score: 0, notes: "AI scoring failed, API key may not be configured" };
  }
}

export async function batchScoreSubmissions() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const unscored = await prisma.submission.findMany({
    where: { aiScore: null, status: "PENDING" },
    take: 10,
  });

  let scored = 0;
  for (const sub of unscored) {
    await scoreSubmission(sub.id);
    scored++;
  }

  return { scored };
}
