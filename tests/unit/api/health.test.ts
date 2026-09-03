const selectMock = vi.fn();
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase", () => ({
  createAstroSupabase: vi.fn(() => ({
    from: fromMock,
  })),
}));

import { GET } from "../../../src/pages/api/health";
import { createAstroSupabase } from "@/lib/supabase";

const mockContext = {
  request: {
    headers: {
      get: vi.fn(() => ""),
    },
  },
  cookies: {
    set: vi.fn(),
  },
} as unknown as Parameters<typeof GET>[0];

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with healthy status when query succeeds", async () => {
    selectMock.mockReturnValue({
      limit: vi.fn().mockResolvedValue({ error: null }),
    });

    const response = await GET(mockContext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(typeof body.latencyMs).toBe("number");
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 500 with error status when query fails", async () => {
    selectMock.mockReturnValue({
      limit: vi.fn().mockResolvedValue({
        error: { message: "connection refused" },
      }),
    });

    const response = await GET(mockContext);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.status).toBe("error");
    expect(body.message).toBe("connection refused");
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("calls createAstroSupabase with context", async () => {
    selectMock.mockReturnValue({
      limit: vi.fn().mockResolvedValue({ error: null }),
    });

    await GET(mockContext);

    expect(createAstroSupabase).toHaveBeenCalledWith(mockContext);
  });

  it("queries players table with only id column", async () => {
    selectMock.mockReturnValue({
      limit: vi.fn().mockResolvedValue({ error: null }),
    });

    await GET(mockContext);

    expect(fromMock).toHaveBeenCalledWith("players");
    expect(selectMock).toHaveBeenCalledWith("id");
  });
});
