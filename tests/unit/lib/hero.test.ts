import { describe, it, expect } from "vitest";
import { getHeroImages, getRandomHero } from "@/lib/hero";

describe("Hero image utility", () => {
  it("debe retornar la lista completa de 8 imágenes de hero con rutas válidas", () => {
    const images = getHeroImages();
    expect(images).toHaveLength(8);
    images.forEach((img, idx) => {
      expect(img.id).toBe(idx + 1);
      expect(img.avif).toBe(`/hero/hero-${idx + 1}.avif`);
      expect(img.webp).toBe(`/hero/hero-${idx + 1}.webp`);
      expect(img.width).toBe(1920);
      expect(img.height).toBe(1280);
      expect(img.alt).toBeDefined();
      expect(img.alt.length).toBeGreaterThan(0);
    });
  });

  it("debe permitir obtener una imagen específica por índice 1-based", () => {
    const img3 = getRandomHero(3);
    expect(img3.id).toBe(3);
    expect(img3.avif).toBe("/hero/hero-3.avif");
    expect(img3.webp).toBe("/hero/hero-3.webp");
    expect(img3.width).toBe(1920);
    expect(img3.height).toBe(1280);
  });

  it("debe retornar una imagen válida al llamar sin argumentos (aleatorio)", () => {
    const randomImg = getRandomHero();
    expect(randomImg.id).toBeGreaterThanOrEqual(1);
    expect(randomImg.id).toBeLessThanOrEqual(8);
    expect(randomImg.avif).toMatch(/^\/hero\/hero-[1-8]\.avif$/);
    expect(randomImg.webp).toMatch(/^\/hero\/hero-[1-8]\.webp$/);
  });

  it("debe retornar una imagen aleatoria si se pasa un id fuera de rango", () => {
    const outOfBoundsLow = getRandomHero(0);
    expect(outOfBoundsLow.id).toBeGreaterThanOrEqual(1);
    expect(outOfBoundsLow.id).toBeLessThanOrEqual(8);

    const outOfBoundsHigh = getRandomHero(99);
    expect(outOfBoundsHigh.id).toBeGreaterThanOrEqual(1);
    expect(outOfBoundsHigh.id).toBeLessThanOrEqual(8);
  });
});
