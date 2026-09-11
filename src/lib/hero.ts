export interface HeroImage {
  id: number;
  avif: string;
  webp: string;
  width: number;
  height: number;
  alt: string;
}

const TOTAL_HERO_IMAGES = 8;

const HERO_IMAGES: HeroImage[] = Array.from(
  { length: TOTAL_HERO_IMAGES },
  (_, i) => {
    const id = i + 1;
    return {
      id,
      avif: `/hero/hero-${id}.avif`,
      webp: `/hero/hero-${id}.webp`,
      width: 1920,
      height: 1280,
      alt: "Solo Gente Súper Comprometida Fútbol Club",
    };
  }
);

export function getHeroImages(): HeroImage[] {
  return HERO_IMAGES;
}

export function getRandomHero(specificId?: number): HeroImage {
  if (
    typeof specificId === "number" &&
    Number.isInteger(specificId) &&
    specificId >= 1 &&
    specificId <= TOTAL_HERO_IMAGES
  ) {
    return HERO_IMAGES[specificId - 1];
  }
  const randomIndex = Math.floor(Math.random() * TOTAL_HERO_IMAGES);
  return HERO_IMAGES[randomIndex];
}

