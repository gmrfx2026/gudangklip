import { describe, it, expect, vi } from "vitest";

// Mock entire next-auth chain BEFORE module resolution
vi.mock("next-auth", () => ({
  default: () => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
    auth: vi.fn(),
  }),
}));
vi.mock("next-auth/providers/google", () => ({ default: () => ({}) }));
vi.mock("next-auth/providers/credentials", () => ({ default: () => ({}) }));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: vi.fn(() => ({})) }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn(), hash: vi.fn() } }));

import { getUserRole, getSessionUser } from "@/lib/auth";

function mockSession(overrides: Record<string, unknown> | null) {
  if (overrides === null) return null;
  return {
    user: overrides.user ?? undefined,
    expires: "2026-01-01",
    ...overrides,
  };
}

describe("getUserRole", () => {
  it("returns null for null session", () => {
    expect(getUserRole(null)).toBeNull();
  });

  it("returns null when user has no role", () => {
    const session = mockSession({ user: { id: "1" } });
    expect(getUserRole(session as any)).toBeNull();
  });

  it("returns null when user is undefined", () => {
    const session = mockSession({ user: undefined });
    expect(getUserRole(session as any)).toBeNull();
  });

  it("returns role for valid session", () => {
    const role = "BRAND" as const;
    const session = mockSession({ user: { id: "1", role } });
    expect(getUserRole(session as any)).toBe(role);
  });

  it("handles all role types", () => {
    for (const role of ["BRAND", "CREATOR", "AGENCY", "ADMIN"]) {
      const session = mockSession({ user: { id: "1", role } });
      expect(getUserRole(session as any)).toBe(role);
    }
  });
});

describe("getSessionUser", () => {
  it("returns null id and role for null session", () => {
    expect(getSessionUser(null)).toEqual({ id: null, role: null });
  });

  it("returns null id and role when user is undefined", () => {
    const session = mockSession({ user: undefined });
    expect(getSessionUser(session as any)).toEqual({ id: null, role: null });
  });

  it("returns null id and role when user has none", () => {
    const session = mockSession({ user: {} });
    expect(getSessionUser(session as any)).toEqual({ id: null, role: null });
  });

  it("returns id only when role missing", () => {
    const session = mockSession({ user: { id: "u1" } });
    expect(getSessionUser(session as any)).toEqual({ id: "u1", role: null });
  });

  it("returns role only when id missing", () => {
    const session = mockSession({ user: { role: "CREATOR" } });
    const result = getSessionUser(session as any);
    expect(result.id).toBeNull();
    expect(result.role).toBe("CREATOR");
  });

  it("returns id and role for valid session", () => {
    const session = mockSession({ user: { id: "u1", role: "ADMIN" } });
    expect(getSessionUser(session as any)).toEqual({ id: "u1", role: "ADMIN" });
  });
});
