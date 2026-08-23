import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  fuzzyMatch,
  buildSearchIndex,
  search,
  loadRecents,
  saveRecent,
  filterItems,
  RECENTS_KEY,
  RECENTS_LIMIT,
  CURATED_SUGGESTIONS,
  type SearchItem,
} from "../../../../src/lib/ux/search";

describe("fuzzyMatch", () => {
  it("returns true when query is substring of target (case insensitive)", () => {
    expect(fuzzyMatch("juan", "JUAN PEREZ")).toBe(true);
    expect(fuzzyMatch("juan", "Juan Pérez")).toBe(true);
    expect(fuzzyMatch("JUAN", "juan perez")).toBe(true);
  });

  it("returns false when query is not in target", () => {
    expect(fuzzyMatch("juan", "Pedro López")).toBe(false);
  });

  it("returns true for empty query (matches everything)", () => {
    expect(fuzzyMatch("", "anything")).toBe(true);
  });

  it("returns false when query is longer than target", () => {
    expect(fuzzyMatch("juan perez largo", "Juan Perez")).toBe(false);
  });
});

describe("buildSearchIndex", () => {
  it("flattens players into search items", () => {
    const players = [
      { id: "1", nickname: "Juancho", matches_played: 10 },
      { id: "2", nickname: "Nacho", matches_played: 5 },
    ];
    const matches = [
      { id: "m1", date: "2025-06-15", field: "La Canchita" },
    ];
    const fields = [
      { id: "f1", name: "La Canchita", city: "Rosario" },
    ];

    const index = buildSearchIndex(players, matches, fields);

    expect(index).toHaveLength(4);
    expect(index[0]).toEqual({
      id: "1",
      label: "Juancho",
      subtitle: "10 partidos jugados",
      href: "/players/1",
      type: "player",
    });
    expect(index[2]).toEqual({
      id: "m1",
      label: "15/06/2025",
      subtitle: "La Canchita",
      href: "/matches",
      type: "match",
      meta: { winner: undefined, date: "2025-06-15" },
    });
    expect(index[3]).toEqual({
      id: "f1",
      label: "La Canchita",
      subtitle: "Rosario",
      href: "/fields",
      type: "field",
    });
  });
});

describe("search", () => {
  it("returns items grouped by type, max 5 per type", () => {
    const items = [
      { id: "1", label: "Juan", subtitle: "10 PJ", href: "/players/1", type: "player" as const },
      { id: "2", label: "Juanma", subtitle: "8 PJ", href: "/players/2", type: "player" as const },
      { id: "3", label: "Pedro", subtitle: "5 PJ", href: "/players/3", type: "player" as const },
      { id: "4", label: "Pablo", subtitle: "3 PJ", href: "/players/4", type: "player" as const },
      { id: "5", label: "Julián", subtitle: "2 PJ", href: "/players/5", type: "player" as const },
      { id: "6", label: "Lucas", subtitle: "1 PJ", href: "/players/6", type: "player" as const },
    ];

    const results = search(items, "juan");

    expect(results).toHaveLength(2);
    expect(results[0].type).toBe("player");
    expect(results[0].label).toBe("Juan");
    expect(results[1].label).toBe("Juanma");
  });

  it("returns empty array when nothing matches", () => {
    const items = [
      { id: "1", label: "Pedro", subtitle: "", href: "/players/1", type: "player" as const },
    ];
    expect(search(items, "juan")).toEqual([]);
  });

  it("returns all items for empty query", () => {
    const items = [
      { id: "1", label: "A", subtitle: "", href: "/p/1", type: "player" as const },
      { id: "2", label: "B", subtitle: "", href: "/p/2", type: "player" as const },
    ];
    expect(search(items, "")).toHaveLength(2);
  });

  it("groups results by type, 5 max per group", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      label: `Player ${i}`,
      subtitle: "",
      href: `/players/${i}`,
      type: "player" as const,
    }));

    const results = search(items, "player");
    expect(results.length).toBeLessThanOrEqual(5);
  });
});

describe("CURATED_SUGGESTIONS", () => {
  it("contains exactly 3 curated pages", () => {
    expect(CURATED_SUGGESTIONS).toHaveLength(3);
  });

  it("points to ranking, players and fields pages", () => {
    const hrefs = CURATED_SUGGESTIONS.map((s) => s.href);
    expect(hrefs).toEqual(["/ranking", "/players", "/fields"]);
    expect(CURATED_SUGGESTIONS.every((s) => s.type === "page")).toBe(true);
  });
});

describe("filterItems (date + field matching)", () => {
  const matches: SearchItem[] = [
    {
      id: "m1",
      label: "15/06/2025",
      subtitle: "La Canchita",
      href: "/matches",
      type: "match",
      meta: { winner: "light", date: "2025-06-15" },
    },
    {
      id: "m2",
      label: "20/07/2025",
      subtitle: "Estadio Central",
      href: "/matches",
      type: "match",
      meta: { winner: "dark", date: "2025-07-20" },
    },
    { id: "p1", label: "Juan", subtitle: "10 PJ", href: "/players/1", type: "player" },
  ];

  it("finds match by formatted date", () => {
    expect(filterItems(matches, "15/06")).toHaveLength(1);
    expect(filterItems(matches, "15/06")[0].id).toBe("m1");
  });

  it("finds match by digits-only date query (normalized)", () => {
    expect(filterItems(matches, "15062025").map((i) => i.id)).toEqual(["m1"]);
    expect(filterItems(matches, "20072025").map((i) => i.id)).toEqual(["m2"]);
  });

  it("finds match by ISO date fragment", () => {
    expect(filterItems(matches, "2025-06").map((i) => i.id)).toEqual(["m1"]);
  });

  it("finds match by field name", () => {
    expect(filterItems(matches, "canchita").map((i) => i.id)).toEqual(["m1"]);
    expect(filterItems(matches, "central").map((i) => i.id)).toEqual(["m2"]);
  });

  it("matches plain substrings regardless of digit length", () => {
    expect(filterItems(matches, "10").map((i) => i.id)).toEqual(["p1"]);
    expect(filterItems(matches, "juan").map((i) => i.id)).toEqual(["p1"]);
  });

  it("returns all items for empty query", () => {
    expect(filterItems(matches, "")).toHaveLength(3);
  });
});

describe("buildSearchIndex match winners", () => {
  it("stores result as winner meta with raw date", () => {
    const index = buildSearchIndex(
      [],
      [{ id: "m9", date: "2025-03-10", field: "Norte", result: "draw" }],
      [],
    );
    expect(index[0].meta).toEqual({ winner: "draw", date: "2025-03-10" });
  });

  it("omits winner when result is unexpected", () => {
    const index = buildSearchIndex(
      [],
      [{ id: "m8", date: "2025-03-09", field: "Sur", result: "weird" }],
      [],
    );
    expect(index[0].meta).toEqual({ winner: undefined, date: "2025-03-09" });
  });
});

describe("recents (localStorage)", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal(
      "localStorage",
      {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const item = (id: string): SearchItem => ({
    id,
    label: `Item ${id}`,
    subtitle: "",
    href: `/players/${id}`,
    type: "player",
  });

  it("returns empty array when nothing stored or storage unavailable", () => {
    expect(loadRecents()).toEqual([]);
    vi.unstubAllGlobals();
    expect(loadRecents()).toEqual([]);
  });

  it("saves a recent item", () => {
    saveRecent(item("1"));
    expect(loadRecents()).toHaveLength(1);
    expect(loadRecents()[0].id).toBe("1");
  });

  it("dedupes by id keeping the newest first", () => {
    saveRecent(item("1"));
    saveRecent(item("2"));
    saveRecent(item("1"));
    const recents = loadRecents();
    expect(recents.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it(`caps at ${RECENTS_LIMIT} items (${RECENTS_KEY})`, () => {
    saveRecent(item("1"));
    saveRecent(item("2"));
    saveRecent(item("3"));
    saveRecent(item("4"));
    const recents = loadRecents();
    expect(recents).toHaveLength(RECENTS_LIMIT);
    expect(recents.map((r) => r.id)).toEqual(["4", "3", "2"]);
  });

  it("ignores corrupt JSON in storage", () => {
    store.set(RECENTS_KEY, "{not json");
    expect(loadRecents()).toEqual([]);
  });

  it("ignores non-array JSON in storage", () => {
    store.set(RECENTS_KEY, '{"id":"x"}');
    expect(loadRecents()).toEqual([]);
  });
});
