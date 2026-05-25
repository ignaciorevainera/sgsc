import { isSameOrigin } from "../../../src/lib/utils/csrf";

const createRequest = (headers: Record<string, string | null>) => {
  return {
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
  } as unknown as Request;
};

describe("isSameOrigin", () => {
  const origin = "https://sgsc.vercel.app";

  it("returns true when origin header matches", () => {
    const req = createRequest({ origin });
    expect(isSameOrigin(req, origin)).toBe(true);
  });

  it("returns false when origin header does not match", () => {
    const req = createRequest({ origin: "https://evil.com" });
    expect(isSameOrigin(req, origin)).toBe(false);
  });

  it("falls back to referer when origin is absent", () => {
    const req = createRequest({ referer: "https://sgsc.vercel.app/admin/matches" });
    expect(isSameOrigin(req, origin)).toBe(true);
  });

  it("returns false when referer origin does not match", () => {
    const req = createRequest({ referer: "https://evil.com/phishing" });
    expect(isSameOrigin(req, origin)).toBe(false);
  });

  it("returns false when both origin and referer are absent", () => {
    const req = createRequest({});
    expect(isSameOrigin(req, origin)).toBe(false);
  });

  it("returns false for malformed referer URL", () => {
    const req = createRequest({ referer: "not-a-valid-url" });
    expect(isSameOrigin(req, origin)).toBe(false);
  });

  it("returns true for referer with path and query params", () => {
    const req = createRequest({
      referer: "https://sgsc.vercel.app/admin/players?page=2",
    });
    expect(isSameOrigin(req, origin)).toBe(true);
  });
});
