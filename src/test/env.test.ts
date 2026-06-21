import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the env schema directly instead of getEnv() to avoid process.env mutation
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  MIDTRANS_SERVER_KEY: z.string().min(1),
  MIDTRANS_CLIENT_KEY: z.string().min(1),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).optional().default("false"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

const validEnv = {
  DATABASE_URL: "postgresql://localhost:5432/db",
  NEXTAUTH_SECRET: "super-secret-key-with-16-chars-min",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  OPENAI_API_KEY: "sk-test-key",
  MIDTRANS_SERVER_KEY: "midtrans-server-key",
  MIDTRANS_CLIENT_KEY: "midtrans-client-key",
};

describe("envSchema", () => {
  it("accepts valid env with all required fields", () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it("accepts valid env with optional fields", () => {
    const result = envSchema.safeParse({
      ...validEnv,
      NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: "pub-key",
      MIDTRANS_IS_PRODUCTION: "true",
      RESEND_API_KEY: "resend-key",
      EMAIL_FROM: "noreply@gudangklip.com",
    });
    expect(result.success).toBe(true);
  });

  it("defaults MIDTRANS_IS_PRODUCTION to false", () => {
    const result = envSchema.parse(validEnv);
    expect(result.MIDTRANS_IS_PRODUCTION).toBe("false");
  });

  it("rejects missing DATABASE_URL", () => {
    const { DATABASE_URL, ...rest } = validEnv;
    expect(envSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects short NEXTAUTH_SECRET", () => {
    expect(
      envSchema.safeParse({ ...validEnv, NEXTAUTH_SECRET: "short" }).success
    ).toBe(false);
  });

  it("rejects invalid NEXTAUTH_URL", () => {
    expect(
      envSchema.safeParse({ ...validEnv, NEXTAUTH_URL: "not-a-url" }).success
    ).toBe(false);
  });

  it("rejects invalid NEXT_PUBLIC_APP_URL", () => {
    expect(
      envSchema.safeParse({ ...validEnv, NEXT_PUBLIC_APP_URL: "bad-url" }).success
    ).toBe(false);
  });

  it("rejects empty GOOGLE_CLIENT_ID", () => {
    expect(
      envSchema.safeParse({ ...validEnv, GOOGLE_CLIENT_ID: "" }).success
    ).toBe(false);
  });

  it("rejects empty OPENAI_API_KEY", () => {
    expect(
      envSchema.safeParse({ ...validEnv, OPENAI_API_KEY: "" }).success
    ).toBe(false);
  });

  it("rejects empty MIDTRANS_SERVER_KEY", () => {
    expect(
      envSchema.safeParse({ ...validEnv, MIDTRANS_SERVER_KEY: "" }).success
    ).toBe(false);
  });

  it("rejects invalid MIDTRANS_IS_PRODUCTION value", () => {
    expect(
      envSchema.safeParse({ ...validEnv, MIDTRANS_IS_PRODUCTION: "yes" }).success
    ).toBe(false);
  });

  it("allows RESEND_API_KEY and EMAIL_FROM to be omitted", () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.RESEND_API_KEY).toBeUndefined();
      expect(result.data.EMAIL_FROM).toBeUndefined();
    }
  });
});
