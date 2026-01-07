// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://sgsc.vercel.app",

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Mejora el código dividido para mejor caché
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Nombres con hash para mejor caché en el navegador
          assetFileNames: "assets/[name].[hash][extname]",
        },
      },
    },
  },

  integrations: [sitemap(), icon()],
  output: "server",
  adapter: vercel({
    // Habilita ISR (Incremental Static Regeneration) para mejor rendimiento
    isr: {
      // Regenera páginas cada 5 minutos
      expiration: 300,
    },
    // Optimiza imágenes automáticamente
    imageService: true,
  }),

  prefetch: {
    // Prefetch de enlaces al hacer hover para navegación instantánea
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  compressHTML: true,
});
