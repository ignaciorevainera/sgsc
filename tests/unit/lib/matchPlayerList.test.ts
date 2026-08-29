import { describe, it, expect } from "vitest";
import { normalizeQuery, filterPlayerIds, sortPlayers, mergePlayers } from "../../../src/lib/utils/matchPlayerList";

describe("normalizeQuery", () => {
  it("lowercase y sin diacríticos", () => {
    expect(normalizeQuery("José")).toBe("jose");
    expect(normalizeQuery("  NACHO ")).toBe("nacho");
  });
});

describe("filterPlayerIds", () => {
  it("filtra por substring case-insensitive", () => {
    const players = [
      { id: "1", nickname: "Juancho", is_guest: false },
      { id: "2", nickname: "Nacho", is_guest: false },
      { id: "3", nickname: "Pedro", is_guest: true },
    ];
    expect(filterPlayerIds(players, "nacho")).toEqual(new Set(["2"]));
    expect(filterPlayerIds(players, "JU")).toEqual(new Set(["1"]));
    expect(filterPlayerIds(players, "")).toEqual(new Set(["1","2","3"]));
  });
  it("filtra con diacríticos", () => {
    const players = [{ id: "1", nickname: "José", is_guest: false }];
    expect(filterPlayerIds(players, "jose")).toEqual(new Set(["1"]));
  });
  it("retorna vacío si no hay match", () => {
    const players = [{ id:"1", nickname:"Juan", is_guest:false }];
    expect(filterPlayerIds(players, "zzz")).toEqual(new Set());
  });
});

describe("sortPlayers", () => {
  it("ordena is_guest false primero luego nickname asc", () => {
    const input = [
      { id:"2", nickname:"Zeta", is_guest:true },
      { id:"1", nickname:"Ana", is_guest:false },
      { id:"3", nickname:"Beto", is_guest:false },
    ];
    expect(sortPlayers(input).map(p=>p.id)).toEqual(["1","3","2"]);
  });
});

describe("mergePlayers", () => {
  it("agrega solo nuevos ids sin duplicar", () => {
    const existing = [{id:"1", nickname:"A", is_guest:false}];
    const fresh = [
      {id:"1", nickname:"A", is_guest:false},
      {id:"2", nickname:"B", is_guest:false},
    ];
    const { merged, added } = mergePlayers(existing, fresh);
    expect(merged.map(p=>p.id)).toEqual(["1","2"]);
    expect(added.map(p=>p.id)).toEqual(["2"]);
  });
  it("respeta orden sorted", () => {
    const existing = [{id:"2", nickname:"Zeta", is_guest:true}];
    const fresh = [
      {id:"1", nickname:"Ana", is_guest:false},
      {id:"2", nickname:"Zeta", is_guest:true},
    ];
    expect(mergePlayers(existing,fresh).merged.map(p=>p.id)).toEqual(["1","2"]);
  });
  it("no pierde si fresh trae menos (no borra existentes)", () => {
    const existing = [
      {id:"1", nickname:"A", is_guest:false},
      {id:"2", nickname:"B", is_guest:false},
    ];
    const fresh = [{id:"1", nickname:"A", is_guest:false}];
    // política: merge es union, no deletion
    expect(mergePlayers(existing,fresh).merged.map(p=>p.id)).toEqual(["1","2"]);
    expect(mergePlayers(existing,fresh).added).toEqual([]);
  });
});
