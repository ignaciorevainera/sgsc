import { describe, it, expect } from "vitest";
import { buildShareUrl } from "../../../../src/lib/ux/share";

describe("buildShareUrl", () => {
  it("builds WhatsApp share URL", () => {
    const url = buildShareUrl("whatsapp", "https://sgsc.vercel.app/players/123", "Mira el perfil de Juancho");
    expect(url).toBe(
      "https://wa.me/?text=" + encodeURIComponent("Mira el perfil de Juancho https://sgsc.vercel.app/players/123")
    );
  });

  it("builds Twitter share URL", () => {
    const url = buildShareUrl("twitter", "https://sgsc.vercel.app/ranking", "Tabla SGSC");
    expect(url).toContain("https://twitter.com/intent/tweet");
    expect(url).toContain(encodeURIComponent("https://sgsc.vercel.app/ranking"));
    expect(url).toContain(encodeURIComponent("Tabla SGSC"));
  });

  it("returns raw URL for copy type", () => {
    const url = buildShareUrl("copy", "https://sgsc.vercel.app/players/123", "text");
    expect(url).toBe("https://sgsc.vercel.app/players/123");
  });
});
