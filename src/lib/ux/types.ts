export interface FilterOptions<T> {
  defaults: T;
}

export interface PlayerFilters {
  search: string;
  sort: "name" | "points" | "wins" | "matches";
  active: boolean;
}

export interface MatchFilters {
  [key: string]: unknown;
  from: string;
  to: string;
  field_id: string;
  page: number;
}

export interface RankingFilters {
  min_matches: number;
}

export interface FieldFilters {
  city: string;
  sort: "matches" | "name";
}
