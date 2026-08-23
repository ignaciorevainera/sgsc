import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { copyImageToClipboard } from "../../../../src/lib/ux/share";

const fakeBlob = new Blob(["fake-png"], { type: "image/png" });

describe("copyImageToClipboard", () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  it("returns true when clipboard write succeeds", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    class ClipboardItemStub {
      constructor(public items: Record<string, Blob>) {}
    }
    vi.stubGlobal("ClipboardItem", ClipboardItemStub);
    Object.defineProperty(navigator, "clipboard", {
      value: { write },
      configurable: true,
    });

    const result = await copyImageToClipboard(fakeBlob);

    expect(result).toBe(true);
    expect(write).toHaveBeenCalledTimes(1);
    const items = write.mock.calls[0][0] as unknown[];
    expect(items).toHaveLength(1);
    const item = items[0] as ClipboardItem;
    expect(item).toBeInstanceOf(ClipboardItemStub);
  });

  it("returns false when clipboard is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    const result = await copyImageToClipboard(fakeBlob);

    expect(result).toBe(false);
  });

  it("returns false when ClipboardItem is unsupported", async () => {
    vi.stubGlobal("ClipboardItem", undefined);

    const result = await copyImageToClipboard(fakeBlob);

    expect(result).toBe(false);
  });

  it("returns false when clipboard write rejects", async () => {
    const write = vi.fn().mockRejectedValue(new Error("denied"));
    class ClipboardItemStub {}
    vi.stubGlobal("ClipboardItem", ClipboardItemStub);
    Object.defineProperty(navigator, "clipboard", {
      value: { write },
      configurable: true,
    });

    const result = await copyImageToClipboard(fakeBlob);

    expect(result).toBe(false);
  });
});
