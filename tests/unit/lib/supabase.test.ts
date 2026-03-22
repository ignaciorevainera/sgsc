const createClientMock = vi.fn(() => ({ tag: "browser-client" }));
const createServerClientMock = vi.fn(() => ({ tag: "server-client" }));
const parseCookieHeaderMock = vi.fn(() => [
  { name: "a", value: "1" },
  { name: "b", value: undefined },
]);

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
  parseCookieHeader: parseCookieHeaderMock,
}));

describe("supabase lib", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_KEY", "anon-key");
  });

  it("initializes browser client with env values", async () => {
    const mod = await import("../../../src/lib/supabase");

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );
    expect(mod.supabase).toEqual({ tag: "browser-client" });
  });

  it("createAstroSupabase wires cookie adapter and filters undefined cookies", async () => {
    const mod = await import("../../../src/lib/supabase");
    const setMock = vi.fn();

    const serverClient = mod.createAstroSupabase({
      request: {
        headers: {
          get: vi.fn(() => "a=1; b=2"),
        },
      },
      cookies: {
        set: setMock,
      },
    });

    expect(createServerClientMock).toHaveBeenCalled();
    expect(serverClient).toEqual({ tag: "server-client" });

    const optionsArg = createServerClientMock.mock.calls[0][2];
    const getAllResult = optionsArg.cookies.getAll();

    expect(parseCookieHeaderMock).toHaveBeenCalledWith("a=1; b=2");
    expect(getAllResult).toEqual([{ name: "a", value: "1" }]);

    optionsArg.cookies.setAll([
      { name: "sb-a", value: "v1", options: { path: "/" } },
    ]);
    expect(setMock).toHaveBeenCalledWith("sb-a", "v1", { path: "/" });
  });
});
