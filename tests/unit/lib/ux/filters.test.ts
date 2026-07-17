import { describe, it, expect } from "vitest";
import { getFilters, setFilter, clearFilters } from "../../../../src/lib/ux/filters";

describe("getFilters", () => {
  it("reads all URL params into typed object", () => {
    const url = new URL("https://sgsc.vercel.app/players?search=juan&sort=points&active=true");
    const filters = getFilters<{ search: string; sort: string; active: boolean }>(url, {
      defaults: { search: "", sort: "name", active: false },
    });
    expect(filters).toEqual({ search: "juan", sort: "points", active: true });
  });

  it("uses defaults when params are missing", () => {
    const url = new URL("https://sgsc.vercel.app/players");
    const filters = getFilters<{ search: string; sort: string; active: boolean }>(url, {
      defaults: { search: "", sort: "name", active: false },
    });
    expect(filters).toEqual({ search: "", sort: "name", active: false });
  });
});

describe("setFilter", () => {
  it("sets a param on the URL", () => {
    const url = new URL("https://sgsc.vercel.app/players");
    const result = setFilter(url, "search", "juan");
    expect(result.searchParams.get("search")).toBe("juan");
  });

  it("removes param when value is undefined or empty string", () => {
    const url = new URL("https://sgsc.vercel.app/players?search=juan");
    const result = setFilter(url, "search", "");
    expect(result.searchParams.has("search")).toBe(false);
  });
});

describe("clearFilters", () => {
  it("removes multiple params at once", () => {
    const url = new URL("https://sgsc.vercel.app/players?search=juan&sort=points&active=true");
    const result = clearFilters(url, ["search", "sort", "active"]);
    expect(result.searchParams.has("search")).toBe(false);
    expect(result.searchParams.has("sort")).toBe(false);
    expect(result.searchParams.has("active")).toBe(false);
  });

  it("leaves non-cleared params intact", () => {
    const url = new URL("https://sgsc.vercel.app/players?search=juan&other=keep");
    const result = clearFilters(url, ["search"]);
    expect(result.searchParams.has("search")).toBe(false);
    expect(result.searchParams.get("other")).toBe("keep");
  });
});
