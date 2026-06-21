import { describe, it, expect, beforeEach, vi } from "vitest";

// Reset module cache before each test to get fresh rateLimitMap
const moduleCache = { rateLimitMap: new Map() } as any;

describe("checkRateLimit", () => {
  let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit;

  beforeEach(async () => {
    // Re-import to reset module state
    vi.resetModules();
    const mod = await import("@/lib/rate-limit");
    checkRateLimit = mod.checkRateLimit;
  });

  it("allows first request", () => {
    const result = checkRateLimit("user-1", "auth");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4); // max 5, 1 used
  });

  it("tracks remaining count correctly", () => {
    const key = "user-2";

    // 5 auth requests should be allowed
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(key, "auth");
      if (i < 5) {
        expect(res.success).toBe(true);
        expect(res.remaining).toBe(4 - i);
      }
    }
  });

  it("blocks after exceeding max", () => {
    const key = "user-3";

    // Exhaust all requests
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, "auth");
    }

    const blocked = checkRateLimit(key, "auth");
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("treats different keys independently", () => {
    // Exhaust user-A
    for (let i = 0; i < 5; i++) {
      checkRateLimit("user-A", "auth");
    }

    // user-B should still work
    const result = checkRateLimit("user-B", "auth");
    expect(result.success).toBe(true);
  });

  it("treats different config keys independently", () => {
    // Exhaust auth limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit("user-4", "auth");
    }

    // Same key but different config (api) should still work
    const result = checkRateLimit("user-4", "api");
    expect(result.success).toBe(true);
  });

  it("has correct limits per config", () => {
    const configs = [
      { config: "auth", max: 5 },
      { config: "api", max: 30 },
      { config: "upload", max: 10 },
      { config: "webhook", max: 5 },
    ] as const;

    for (const { config, max } of configs) {
      const key = `test-${config}`;
      for (let i = 0; i < max; i++) {
        const res = checkRateLimit(key, config);
        expect(res.success).toBe(true);
      }
      // One more should fail
      expect(checkRateLimit(key, config).success).toBe(false);
    }
  });

  it("returns resetAt in the future", () => {
    const result = checkRateLimit("user-5", "auth");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
