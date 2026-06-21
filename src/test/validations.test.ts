import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  campaignSchema,
  submissionSchema,
  payoutSchema,
  connectSocialSchema,
} from "@/lib/validations";

// --- loginSchema ---
describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "bad", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "123456" });
    expect(result.success).toBe(false);
  });
});

// --- registerSchema ---
describe("registerSchema", () => {
  const valid = { name: "AB", email: "a@b.com", password: "123456", role: "CREATOR" as const };

  it("accepts valid registration without referral", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts valid registration with referral", () => {
    expect(registerSchema.safeParse({ ...valid, referralCode: "ABC123" }).success).toBe(true);
  });

  it("rejects name under 2 chars", () => {
    expect(registerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });

  it("rejects invalid role", () => {
    expect(registerSchema.safeParse({ ...valid, role: "HACKER" }).success).toBe(false);
  });

  it("rejects referral code with lowercase", () => {
    expect(registerSchema.safeParse({ ...valid, referralCode: "abc123" }).success).toBe(false);
  });

  it("rejects referral code with special chars", () => {
    expect(registerSchema.safeParse({ ...valid, referralCode: "ABC-123" }).success).toBe(false);
  });

  it("accepts valid referral code with numbers only", () => {
    expect(registerSchema.safeParse({ ...valid, referralCode: "123456" }).success).toBe(true);
  });
});

// --- campaignSchema ---
describe("campaignSchema", () => {
  const validCampaign = {
    title: "Campaign Title",
    description: "This is a valid description with enough chars",
    category: "MUSIC" as const,
    totalBudget: 1_000_000,
    cpmRate: 5000,
    minViewsToClaim: 1000,
    startDate: "2026-01-01",
    endDate: "2026-02-01",
  };

  it("accepts valid campaign", () => {
    expect(campaignSchema.safeParse(validCampaign).success).toBe(true);
  });

  it("rejects title under 5 chars", () => {
    expect(campaignSchema.safeParse({ ...validCampaign, title: "Bad" }).success).toBe(false);
  });

  it("rejects description under 20 chars", () => {
    expect(campaignSchema.safeParse({ ...validCampaign, description: "Short" }).success).toBe(false);
  });

  it("rejects budget under 100k", () => {
    expect(campaignSchema.safeParse({ ...validCampaign, totalBudget: 50000 }).success).toBe(false);
  });

  it("rejects CPM under 100", () => {
    expect(campaignSchema.safeParse({ ...validCampaign, cpmRate: 50 }).success).toBe(false);
  });

  it("rejects invalid category", () => {
    expect(campaignSchema.safeParse({ ...validCampaign, category: "OTHER" }).success).toBe(false);
  });

  it("accepts optional brief", () => {
    expect(campaignSchema.safeParse({ ...validCampaign, brief: "Brief text" }).success).toBe(true);
  });
});

// --- submissionSchema ---
describe("submissionSchema", () => {
  it("accepts submission with videoUrl only", () => {
    const result = submissionSchema.safeParse({
      campaignId: "c1",
      videoUrl: "https://example.com/video.mp4",
    });
    expect(result.success).toBe(true);
  });

  it("accepts submission with platformLink only", () => {
    const result = submissionSchema.safeParse({
      campaignId: "c1",
      platformLink: "https://tiktok.com/@user/video/123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects submission with neither url", () => {
    const result = submissionSchema.safeParse({ campaignId: "c1" });
    expect(result.success).toBe(false);
  });

  it("accepts submission with both urls", () => {
    const result = submissionSchema.safeParse({
      campaignId: "c1",
      videoUrl: "https://example.com/v.mp4",
      platformLink: "https://tiktok.com/@u/v/1",
      platform: "TIKTOK" as const,
    });
    expect(result.success).toBe(true);
  });
});

// --- payoutSchema ---
describe("payoutSchema", () => {
  const validPayout = {
    amount: 100_000,
    payoutMethod: "BANK" as const,
    accountInfo: "BCA 1234567890 a.n. Example",
  };

  it("accepts valid payout", () => {
    expect(payoutSchema.safeParse(validPayout).success).toBe(true);
  });

  it("rejects amount under 50k", () => {
    expect(payoutSchema.safeParse({ ...validPayout, amount: 49_000 }).success).toBe(false);
  });

  it("rejects amount over 100M", () => {
    expect(payoutSchema.safeParse({ ...validPayout, amount: 200_000_000 }).success).toBe(false);
  });

  it("accepts all payout methods", () => {
    for (const method of ["BANK", "GOPAY", "OVO", "DANA"]) {
      expect(payoutSchema.safeParse({ ...validPayout, payoutMethod: method }).success).toBe(true);
    }
  });
});

// --- connectSocialSchema ---
describe("connectSocialSchema", () => {
  it("accepts valid social connection", () => {
    expect(connectSocialSchema.safeParse({ platform: "TIKTOK", username: "user123" }).success).toBe(true);
  });

  it("rejects username under 2 chars", () => {
    expect(connectSocialSchema.safeParse({ platform: "TIKTOK", username: "a" }).success).toBe(false);
  });

  it("rejects invalid platform", () => {
    expect(connectSocialSchema.safeParse({ platform: "X", username: "user" }).success).toBe(false);
  });

  it("accepts all platforms", () => {
    for (const platform of ["TIKTOK", "INSTAGRAM", "YOUTUBE"]) {
      expect(connectSocialSchema.safeParse({ platform, username: "user123" }).success).toBe(true);
    }
  });
});
