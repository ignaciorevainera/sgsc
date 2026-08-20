export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  players: "Jugadores",
  ranking: "Clasificación",
  matches: "Partidos",
  compare: "Versus",
  versus: "Versus",
  teams: "Equipos",
  "teams-builder": "Armador de Equipos",
  fields: "Sedes",
  badges: "Medallas",
  "hall-of-fame": "Salón de la Fama",
  admin: "Admin",
};

export function buildBreadcrumbs(pathname: string, playerNickname?: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }];

  // Remove leading/trailing slashes and split
  const segments = pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);

  if (segments.length === 0) return crumbs;

  // Handle /players/[id] → Jugadores > Nickname
  if (segments[0] === "players" && segments.length === 2) {
    crumbs.push({ label: "Jugadores", href: "/players" });
    crumbs.push({ label: playerNickname || segments[1] });
    return crumbs;
  }

  // Handle admin sub-routes
  if (segments[0] === "admin") {
    crumbs.push({ label: "Admin", href: "/admin" });
    if (segments[1]) {
      const label = routeLabels[segments[1]] || segments[1];
      crumbs.push({ label });
    }
    return crumbs;
  }

  // Default: map first segment
  const firstLabel = routeLabels[segments[0]] || segments[0];
  crumbs.push({ label: firstLabel });
  return crumbs;
}
