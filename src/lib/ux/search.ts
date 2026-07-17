export interface SearchItem {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  type: "player" | "match" | "field";
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
    items.push({
      id: m.id,
      label: dateStr,
      subtitle: m.field || "",
      href: "/matches",
      type: "match",
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
