import type { FilterOptions } from "./types";

export function getFilters<T extends Record<string, unknown>>(
  url: URL,
  options: FilterOptions<T>,
): T {
  const result = { ...options.defaults };

  for (const key of Object.keys(options.defaults)) {
    const raw = url.searchParams.get(key);
    if (raw === null) continue;

    const defaultValue = options.defaults[key];
    if (typeof defaultValue === "number") {
      const num = Number(raw);
      if (!isNaN(num)) (result as Record<string, unknown>)[key] = num;
    } else if (typeof defaultValue === "boolean") {
      (result as Record<string, unknown>)[key] = raw === "true";
    } else {
      (result as Record<string, unknown>)[key] = raw;
    }
  }

  return result;
}

export function setFilter(
  url: URL,
  key: string,
  value: string | number | undefined,
): URL {
  const copy = new URL(url);
  if (value === undefined || value === "") {
    copy.searchParams.delete(key);
  } else {
    copy.searchParams.set(key, String(value));
  }
  return copy;
}

export function clearFilters(url: URL, keys: string[]): URL {
  const copy = new URL(url);
  for (const key of keys) {
    copy.searchParams.delete(key);
  }
  return copy;
}
