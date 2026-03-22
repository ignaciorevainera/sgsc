import {
  calculateAge,
  formatDate,
  getCurrentYear,
  getSafeDate,
  getYearFromDate,
} from "../../../src/lib/utils/dateUtils";

describe("dateUtils", () => {
  it("getSafeDate returns null when value is empty", () => {
    expect(getSafeDate(undefined)).toBeNull();
    expect(getSafeDate(null)).toBeNull();
    expect(getSafeDate("")).toBeNull();
  });

  it("getSafeDate appends noon time to avoid TZ drift", () => {
    const result = getSafeDate("2026-03-21");

    expect(result).not.toBeNull();
    expect(result?.getHours()).toBe(12);
  });

  it("formatDate returns N/A for invalid input", () => {
    expect(formatDate("")).toBe("N/A");
  });

  it("formatDate supports short style", () => {
    expect(formatDate("2026-03-21", "short")).toBe("21/03/2026");
  });

  it("formatDate supports medium style", () => {
    expect(formatDate("2026-03-21", "medium")).toContain("2026");
  });

  it("formatDate supports long style", () => {
    const formatted = formatDate("2026-03-21", "long");
    expect(formatted.length).toBeGreaterThan(3);
  });

  it("formatDate supports compact style", () => {
    const formatted = formatDate("2026-03-21", "compact");
    expect(formatted).toContain("2026");
  });

  it("getYearFromDate returns year and null for empty", () => {
    expect(getYearFromDate("2026-03-21")).toBe(2026);
    expect(getYearFromDate(null)).toBeNull();
  });

  it("getCurrentYear returns current system year", () => {
    expect(getCurrentYear()).toBe(new Date().getFullYear());
  });

  it("calculateAge returns non-negative integer", () => {
    const age = calculateAge("2000-01-01");
    expect(Number.isInteger(age)).toBe(true);
    expect(age).toBeGreaterThanOrEqual(0);
  });
});
