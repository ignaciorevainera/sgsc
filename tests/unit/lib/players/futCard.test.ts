import { getInitials, getWinRate } from "../../../../src/lib/players/futCard";

describe("getInitials", () => {
  it("returns first two chars uppercased", () => {
    expect(getInitials("Messi")).toBe("ME");
  });

  it("uppercases lowercase nicknames", () => {
    expect(getInitials("pipita")).toBe("PI");
  });

  it("returns NN for empty string", () => {
    expect(getInitials("")).toBe("NN");
  });

  it("returns NN for null or undefined", () => {
    expect(getInitials(null)).toBe("NN");
    expect(getInitials(undefined)).toBe("NN");
  });
});

describe("getWinRate", () => {
  it("rounds to nearest integer percent", () => {
    expect(getWinRate(1, 3)).toBe(33);
    expect(getWinRate(2, 3)).toBe(67);
    expect(getWinRate(10, 20)).toBe(50);
  });

  it("returns 0 when no matches played", () => {
    expect(getWinRate(5, 0)).toBe(0);
  });

  it("returns 0 for negative matches (defensive)", () => {
    expect(getWinRate(5, -1)).toBe(0);
  });

  it("caps naturally at 100", () => {
    expect(getWinRate(7, 7)).toBe(100);
  });
});
