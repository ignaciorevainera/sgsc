import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateAstroSupabase = vi.fn();

vi.mock("../../../src/lib/supabase", () => ({
  createAstroSupabase: (...args: any[]) => mockCreateAstroSupabase(...args),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  })),
  parseCookieHeader: vi.fn(() => []),
}));

function createQueryMock(data: any[] | null, error: any = null) {
  const chain: any = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.then = (resolve: any) => Promise.resolve({ data, error }).then(resolve);
  return chain;
}

describe("GET /api/players contract", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_KEY", "anon-key");
    vi.resetModules();
    mockCreateAstroSupabase.mockReset();
  });

  it("exports GET handler", async () => {
    const mod = await import("../../../src/pages/api/players");
    expect(typeof mod.GET).toBe("function");
  });

  it("returns 401 when unauthenticated", async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
    mockCreateAstroSupabase.mockReturnValue({
      auth: { getUser: mockGetUser },
      from: vi.fn(),
    } as any);

    const mod = await import("../../../src/pages/api/players");
    const res = await mod.GET({ request: new Request("http://localhost/api/players"), cookies: { get: () => undefined, set: () => {} } } as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
    expect(res.headers.get("Content-Type")).toContain("application/json");
  });

  it("queries players with explicit columns, filters and ordering, returns no-store", async () => {
    const mockData = [{ id: "1", nickname: "Ana", is_guest: false }];
    const queryMock = createQueryMock(mockData, null);
    const mockFrom = vi.fn(() => queryMock);
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } });
    mockCreateAstroSupabase.mockReturnValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as any);

    const mod = await import("../../../src/pages/api/players");
    const res = await mod.GET({ request: new Request("http://localhost/api/players"), cookies: { get: () => undefined, set: () => {} } } as any);

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.json()).toEqual(mockData);

    expect(mockFrom).toHaveBeenCalledWith("players");
    expect(queryMock.select).toHaveBeenCalledWith("id, nickname, is_guest");
    expect(queryMock.eq).toHaveBeenCalledWith("is_active", true);
    expect(queryMock.order).toHaveBeenCalledWith("is_guest", { ascending: true });
    expect(queryMock.order).toHaveBeenCalledWith("nickname", { ascending: true });
  });
});
