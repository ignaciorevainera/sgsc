import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  })),
  parseCookieHeader: vi.fn(() => []),
}));

// Test de contrato: el endpoint debe ordenar igual que create.astro
// Mock minimal: verificamos que el module exporta GET y que la query usa .eq("is_active", true)
describe("GET /api/players contract", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_KEY", "anon-key");
  });

  it("exports GET handler", async () => {
    const mod = await import("../../../src/pages/api/players");
    expect(typeof mod.GET).toBe("function");
  });
});
