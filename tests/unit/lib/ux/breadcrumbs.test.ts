import { describe, it, expect } from "vitest";
import { buildBreadcrumbs } from "../../../../src/lib/ux/breadcrumbs";

describe("buildBreadcrumbs", () => {
  it("returns single item for home", () => {
    expect(buildBreadcrumbs("/")).toEqual([{ label: "Inicio", href: "/", icon: "material-symbols:home" }]);
  });

  it("builds chain for players list", () => {
    expect(buildBreadcrumbs("/players")).toEqual([
      { label: "Inicio", href: "/", icon: "material-symbols:home" },
      { label: "Jugadores", icon: "material-symbols:group" },
    ]);
  });

  it("builds chain for player detail with nickname", () => {
    expect(buildBreadcrumbs("/players/abc-123", "Juancho")).toEqual([
      { label: "Inicio", href: "/", icon: "material-symbols:home" },
      { label: "Jugadores", href: "/players", icon: "material-symbols:group" },
      { label: "Juancho", icon: "material-symbols:person" },
    ]);
  });

  it("builds chain for ranking with custom label", () => {
    expect(buildBreadcrumbs("/ranking")).toEqual([
      { label: "Inicio", href: "/", icon: "material-symbols:home" },
      { label: "Clasificación", icon: "material-symbols:leaderboard" },
    ]);
  });

  it("builds chain for versus page", () => {
    expect(buildBreadcrumbs("/compare")).toEqual([
      { label: "Inicio", href: "/", icon: "material-symbols:home" },
      { label: "Versus", icon: "material-symbols:swords" },
    ]);
  });

  it("builds chain for fields", () => {
    expect(buildBreadcrumbs("/fields")).toEqual([
      { label: "Inicio", href: "/", icon: "material-symbols:home" },
      { label: "Sedes", icon: "material-symbols:stadium" },
    ]);
  });
});
