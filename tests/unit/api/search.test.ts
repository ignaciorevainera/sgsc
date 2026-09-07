import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateAstroSupabase = vi.fn();

vi.mock("@/lib/supabase", () => ({
  createAstroSupabase: (...args: any[]) => mockCreateAstroSupabase(...args),
}));

function createChain(data: any = null, error: any = null) {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
  };
  chain.then = (resolve: any) => Promise.resolve({ data, error }).then(resolve);
  return chain;
}

describe("GET /api/search", () => {
  let playersChain: ReturnType<typeof createChain>;
  let matchesChain: ReturnType<typeof createChain>;
  let fieldsChain: ReturnType<typeof createChain>;

  const mockContext = {
    request: new Request("http://localhost:4321/api/search"),
    cookies: { get: vi.fn(), set: vi.fn() },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    playersChain = createChain([
      { player_id: "p1", nickname: "Goku", matches_played: 10 },
      { player_id: "p2", nickname: "Vegeta", matches_played: 8 },
    ]);
    matchesChain = createChain([
      { id: "m1", date: "2026-09-01", result: "light", fields: { name: "Cancha 1" } },
      { id: "m2", date: "2026-08-25", result: "dark", fields: [{ name: "Cancha 2" }] },
    ]);
    fieldsChain = createChain([
      { id: "f1", name: "Cancha 1", city: "Montevideo" },
    ]);

    mockCreateAstroSupabase.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "view_player_stats_all_time") return playersChain;
        if (table === "matches") return matchesChain;
        if (table === "fields") return fieldsChain;
        return createChain([], null);
      }),
    });
  });

  it("exports GET handler", async () => {
    const mod = await import("../../../src/pages/api/search");
    expect(typeof mod.GET).toBe("function");
  });

  it("returns 200 with SearchItem[] and cache headers when queries succeed", async () => {
    const { GET } = await import("../../../src/pages/api/search");
    const response = await GET(mockContext);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=120, s-maxage=300, stale-while-revalidate=600",
    );

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(5);
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "p1",
          label: "Goku",
          subtitle: "10 partidos jugados",
          href: "/players/p1",
          type: "player",
        }),
        expect.objectContaining({
          id: "m1",
          label: "01/09/2026",
          subtitle: "Cancha 1",
          href: "/matches",
          type: "match",
          meta: { winner: "light", date: "2026-09-01" },
        }),
        expect.objectContaining({
          id: "m2",
          label: "25/08/2026",
          subtitle: "Cancha 2",
          href: "/matches",
          type: "match",
          meta: { winner: "dark", date: "2026-08-25" },
        }),
        expect.objectContaining({
          id: "f1",
          label: "Cancha 1",
          subtitle: "Montevideo",
          href: "/fields",
          type: "field",
        }),
      ]),
    );
  });

  it("executes queries with expected tables, columns, filters and ordering", async () => {
    const { GET } = await import("../../../src/pages/api/search");
    await GET(mockContext);

    expect(mockCreateAstroSupabase).toHaveBeenCalledWith(mockContext);

    expect(playersChain.select).toHaveBeenCalledWith("player_id, nickname, matches_played");
    expect(playersChain.eq).toHaveBeenCalledWith("is_guest", false);
    expect(playersChain.order).toHaveBeenCalledWith("nickname");

    expect(matchesChain.select).toHaveBeenCalledWith("id, date, result, fields(name)");
    expect(matchesChain.order).toHaveBeenCalledWith("date", { ascending: false });
    expect(matchesChain.limit).toHaveBeenCalledWith(50);

    expect(fieldsChain.select).toHaveBeenCalledWith("id, name, city");
    expect(fieldsChain.order).toHaveBeenCalledWith("name");
  });

  it("returns 500 when player query fails", async () => {
    playersChain = createChain(null, { message: "Player table error" });
    const { GET } = await import("../../../src/pages/api/search");
    const response = await GET(mockContext);

    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    const body = await response.json();
    expect(body).toEqual({ error: "Player table error" });
  });

  it("returns 500 when matches query fails", async () => {
    matchesChain = createChain(null, { message: "Matches table error" });
    const { GET } = await import("../../../src/pages/api/search");
    const response = await GET(mockContext);

    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    const body = await response.json();
    expect(body).toEqual({ error: "Matches table error" });
  });

  it("returns 500 when fields query fails", async () => {
    fieldsChain = createChain(null, { message: "Fields table error" });
    const { GET } = await import("../../../src/pages/api/search");
    const response = await GET(mockContext);

    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    const body = await response.json();
    expect(body).toEqual({ error: "Fields table error" });
  });

  it("handles null query data gracefully without throwing", async () => {
    playersChain = createChain(null, null);
    matchesChain = createChain(null, null);
    fieldsChain = createChain(null, null);
    const { GET } = await import("../../../src/pages/api/search");
    const response = await GET(mockContext);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });
});
