import { describe, it, expect } from "vitest";
import fs from "node:fs";
describe("PlayerSearchBar.astro exists", () => {
  it("file exists", () => {
    expect(fs.existsSync("src/components/admin/matches/PlayerSearchBar.astro")).toBe(true);
  });
});
