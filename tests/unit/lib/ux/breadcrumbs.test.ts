import { describe, it, expect } from "vitest";
import { buildBreadcrumbs } from "../../../../src/lib/ux/breadcrumbs";

describe("buildBreadcrumbs", () => {
  it("returns single item for home", () => {
    expect(buildBreadcrumbs("/")).toEqual([{ label: "Inicio", href: "/" }]);
  });

  it("builds chain for players list", () => {
    expect(buildBreadcrumbs("/players")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Jugadores" },
    ]);
  });

  it("builds chain for player detail with nickname", () => {
    expect(buildBreadcrumbs("/players/abc-123", "Juancho")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Jugadores", href: "/players" },
      { label: "Juancho" },
    ]);
  });

  it("builds chain for ranking with custom label", () => {
    expect(buildBreadcrumbs("/ranking")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Clasificación" },
    ]);
  });

  it("builds chain for versus page", () => {
    expect(buildBreadcrumbs("/compare")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Versus" },
    ]);
  });

  it("builds chain for fields", () => {
    expect(buildBreadcrumbs("/fields")).toEqual([
      { label: "Inicio", href: "/" },
      { label: "Sedes" },
    ]);
  });
});
