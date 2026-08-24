export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
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

const routeIcons: Record<string, string> = {
  players: "material-symbols:group",
  ranking: "material-symbols:leaderboard",
  matches: "material-symbols:sports-soccer",
  compare: "material-symbols:swords",
  versus: "material-symbols:swords",
  teams: "material-symbols:diversity-3",
  "teams-builder": "material-symbols:build",
  fields: "material-symbols:stadium",
  badges: "material-symbols:military-tech",
  "hall-of-fame": "material-symbols:workspace-premium",
  admin: "material-symbols:shield-person",
};

const homeIcon = "material-symbols:home";
const playerIcon = "material-symbols:person";

export function buildBreadcrumbs(pathname: string, playerNickname?: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: "Inicio", href: "/", icon: homeIcon }];

  const segments = pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);

  if (segments.length === 0) return crumbs;

  if (segments[0] === "players" && segments.length === 2) {
    crumbs.push({ label: "Jugadores", href: "/players", icon: routeIcons.players });
    crumbs.push({ label: playerNickname || segments[1], icon: playerIcon });
    return crumbs;
  }

  if (segments[0] === "admin") {
    crumbs.push({ label: "Admin", href: "/admin", icon: routeIcons.admin });
    if (segments[1]) {
      const label = routeLabels[segments[1]] || segments[1];
      const icon = routeIcons[segments[1]];
      crumbs.push(icon ? { label, icon } : { label });
    }
    return crumbs;
  }

  const firstLabel = routeLabels[segments[0]] || segments[0];
  const firstIcon = routeIcons[segments[0]];
  crumbs.push(firstIcon ? { label: firstLabel, icon: firstIcon } : { label: firstLabel });
  return crumbs;
}
