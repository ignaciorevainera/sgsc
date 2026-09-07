export interface FilterOptions<T> {
  defaults: T;
}

export interface PlayerFilters {
  [key: string]: unknown;
  search: string;
  sort: "name" | "points" | "wins" | "matches";
  active: boolean;
}

export interface MatchFilters {
  [key: string]: unknown;
  year: string;
  from: string;
  to: string;
  field_id: string;
  video: string;
  result: string;
  page: number;
}

export interface RankingFilters {
  [key: string]: unknown;
  min_matches: number;
}

export interface FieldFilters {
  [key: string]: unknown;
  city: string;
  sort: "matches" | "name";
}
