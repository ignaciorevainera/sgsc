export interface SearchItem {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  type: "player" | "match" | "field" | "page";
  meta?: { winner?: "light" | "dark" | "draw"; date?: string };
}

export const RECENTS_KEY = "sgsc:recent-searches";
export const RECENTS_LIMIT = 3;

export const CURATED_SUGGESTIONS: SearchItem[] = [
  { id: "page-ranking", label: "Ranking", subtitle: "Tabla de posiciones", href: "/ranking", type: "page" },
  { id: "page-players", label: "Jugadores", subtitle: "Plantel completo", href: "/players", type: "page" },
  { id: "page-fields", label: "Canchas", subtitle: "Sedes y estadios", href: "/fields", type: "page" },
];

export function loadRecents(): SearchItem[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecent(item: SearchItem): void {
  try {
    if (typeof localStorage === "undefined") return;
    const recents = loadRecents().filter((r) => r.id !== item.id);
    recents.unshift(item);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, RECENTS_LIMIT)));
  } catch {
    /* storage lleno o bloqueado — ignorar */
  }
}

export function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true;
  if (query.length > target.length) return false;
  return target.toLowerCase().includes(query.toLowerCase());
}

interface PlayerData {
  id: string;
  nickname: string;
  matches_played: number;
}

interface MatchData {
  id: string;
  date: string;
  field?: string;
  result?: string;
}

interface FieldData {
  id: string;
  name: string;
  city?: string;
}

export function buildSearchIndex(
  players: PlayerData[],
  matches: MatchData[],
  fields: FieldData[],
): SearchItem[] {
  const items: SearchItem[] = [];

  for (const p of players) {
    items.push({
      id: p.id,
      label: p.nickname,
      subtitle: `${p.matches_played} partidos jugados`,
      href: `/players/${p.id}`,
      type: "player",
    });
  }

  for (const m of matches) {
    const [year, month, day] = m.date.split("-");
    const dateStr = `${day}/${month}/${year}`;
    const winner = m.result === "light" || m.result === "dark" || m.result === "draw" ? m.result : undefined;
    items.push({
      id: m.id,
      label: dateStr,
      subtitle: m.field || "",
      href: "/matches",
      type: "match",
      meta: { winner, date: m.date },
    });
  }

  for (const f of fields) {
    items.push({
      id: f.id,
      label: f.name,
      subtitle: f.city || "",
      href: "/fields",
      type: "field",
    });
  }

  return items;
}

export function search(items: SearchItem[], query: string): SearchItem[] {
  if (!query) return items;

  const grouped = new Map<string, SearchItem[]>();

  for (const item of items) {
    if (fuzzyMatch(query, item.label) || fuzzyMatch(query, item.subtitle)) {
      const group = grouped.get(item.type) || [];
      group.push(item);
      grouped.set(item.type, group);
    }
  }

  const result: SearchItem[] = [];
  for (const [, groupItems] of grouped) {
    for (const item of groupItems.slice(0, 5)) {
      result.push(item);
    }
  }

  return result;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function filterItems(items: SearchItem[], query: string): SearchItem[] {
  if (!query) return items;

  const q = query.toLowerCase();
  const qNorm = normalize(query);

  return items.filter((item) => {
    const haystack = `${item.label} ${item.subtitle} ${item.meta?.date ?? ""}`.toLowerCase();
    if (haystack.includes(q)) return true;
    return qNorm.length >= 3 && normalize(haystack).includes(qNorm);
  });
}
