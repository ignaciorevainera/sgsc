import { describe, it, expect } from "vitest";
import { fuzzyMatch, buildSearchIndex, search } from "../../../../src/lib/ux/search";

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
      href: "",
      type: "match",
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
