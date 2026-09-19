export interface HeroImage {
  id: number;
  avif: string;
  webp: string;
  srcsetAvif: string;
  srcsetWebp: string;
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
      srcsetAvif: `/hero/hero-${id}-640.avif 640w, /hero/hero-${id}-1024.avif 1024w, /hero/hero-${id}-1400.avif 1400w, /hero/hero-${id}.avif 1920w`,
      srcsetWebp: `/hero/hero-${id}-640.webp 640w, /hero/hero-${id}-1024.webp 1024w, /hero/hero-${id}-1400.webp 1400w, /hero/hero-${id}.webp 1920w`,
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

