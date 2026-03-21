# STACK

## Frontend
- Framework: Astro 6 (output server)
- Estilos: Tailwind CSS 4 + DaisyUI 5
- Layout principal: src/layouts/Main.astro
- Integraciones Astro: sitemap, astro-icon
- Fuentes activas: Sora Variable (@fontsource-variable/sora)
- Tema: light/dark con toggle; script de inicializacion usa theme-change

## Base de datos
- Supabase (Postgres)
- Tablas detectadas: players, matches, match_players, fields
- Vistas detectadas: view_player_stats_all_time, view_player_stats_yearly
- RPC detectada: create_complete_match

## Autenticacion
- Supabase Auth (email/password)
- Manejo SSR de sesion con @supabase/ssr
- Ruta de cierre de sesion: src/pages/api/auth/signout.ts

## Deploy
- Vercel (adapter @astrojs/vercel)
- Analytics: @vercel/analytics habilitado

## Skills activas recomendadas para este proyecto
- c:/Users/Ignacio Revainera/.copilot/skills/components/SKILL.md
- c:/Users/Ignacio Revainera/.copilot/skills/forms/SKILL.md
- c:/Users/Ignacio Revainera/.copilot/skills/feature-structure/SKILL.md
- c:/Users/Ignacio Revainera/.copilot/skills/auth-supabase/SKILL.md
- c:/Users/Ignacio Revainera/.agents/skills/supabase-postgres-best-practices/SKILL.md

## Variables de entorno necesarias
- SUPABASE_URL
- SUPABASE_KEY

## Dependencias principales instaladas
- astro
- @astrojs/sitemap
- @astrojs/vercel
- @tailwindcss/vite
- tailwindcss
- daisyui
- astro-icon
- @iconify-json/material-symbols
- @supabase/supabase-js
- @supabase/ssr
- theme-change
- @fontsource-variable/sora
- @fontsource/poppins
- @vercel/analytics

## Notas de configuracion
- Site URL configurada en astro.config.mjs: https://sgsc.vercel.app
- Prefetch global habilitado (hover + prefetchAll)
- Alias TypeScript activos: @, @components, @layouts, @lib, @styles, @assets, @instructions
- Convencion de consultas: evitar select("*") en paginas; seleccionar columnas explicitas
