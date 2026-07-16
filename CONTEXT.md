# PROJECT_CONTEXT

## Nombre del proyecto
SGSC - Solo Gente Super Comprometida F.C.

## Descripcion
Aplicacion web de gestion y analitica para futbol amateur. Centraliza resultados, historial de partidos, ranking por temporada e historico, perfiles de jugadores y herramientas para armar equipos equilibrados.

## Publico objetivo
- Grupo interno de jugadores y organizadores del club (uso frecuente semanal).
- Administrador del sistema (carga/edicion de partidos y jugadores).
- Participantes del grupo con perfil no tecnico que consumen estadisticas y comparativas.

---

## STACK

### Frontend
- Framework: Astro 6 (output server, SSR via @astrojs/vercel)
- Estilos: Tailwind CSS 4 + DaisyUI 5
- Layout principal: src/layouts/Main.astro
- Integraciones: sitemap, astro-icon
- Iconos: material-symbols via @iconify-json/material-symbols
- Fuente principal UI: Sora Variable (@fontsource-variable/sora)
- Fuente secundaria (mono/countdown): Roboto Mono Variable (@fontsource-variable/roboto-mono)
- Poppins (@fontsource/poppins) instalada pero no activa en CSS global
- Tema: light/dark toggle via theme-change; init script inline en Main.astro; DaisyUI themes light --default, dark --prefersdark
- Config destacada: compressHTML: true, prefetchAll + hover, site URL https://sgsc.vercel.app

### Base de datos
- Supabase (Postgres) via @supabase/supabase-js + @supabase/ssr
- Tablas: players, matches, match_players, fields
- Vistas:
  - view_player_stats_all_time
  - view_player_stats_yearly
  - view_match_outcomes
  - view_totals_global
  - view_totals_yearly
- RPC: create_complete_match(p_dark_players, p_date, p_field_id, p_light_players, p_result)
- Dos clientes Supabase:
  - src/lib/supabase.ts:9 — supabase (createClient, browser-safe)
  - src/lib/supabase.ts:12 — createAstroSupabase(context) (createServerClient SSR, usar en .astro frontmatter)

### Autenticacion
- Supabase Auth (email/password)
- Manejo SSR de sesion con @supabase/ssr
- Ruta de cierre de sesion: src/pages/api/auth/signout.ts
- Middleware (src/middleware.ts): redirects /admin/* a /login si no autenticado; CSRF check en POST a /admin y /api/auth/signout
- CSRF via isSameOrigin() en src/lib/utils/csrf.ts

### Deploy
- Vercel (adapter @astrojs/vercel) con imageService: true
- Analytics: @vercel/analytics habilitado via componente en Main.astro

### Testing
- Vitest (node env, globals enabled)
- Tests unitarios: tests/unit/
- Tests E2E: Playwright (tests/e2e/) con baseURL http://localhost:4321, auto-starts dev server
- E2E auth fixture requiere .env.test con TEST_EMAIL + TEST_PASSWORD
- E2E mutations gated by E2E_ALLOW_MUTATIONS=false (set true solo para mutation tests)
- Comandos: npm test (vitest watch), npm run test:run (single run), npm run test:coverage, npm run test:e2e

### Dependencias principales
- astro ^6.0.4, @astrojs/check, @astrojs/sitemap, @astrojs/vercel
- tailwindcss ^4.1.18, @tailwindcss/vite, daisyui ^5.5.14
- @supabase/supabase-js, @supabase/ssr
- astro-icon, @iconify-json/material-symbols
- theme-change
- @fontsource-variable/sora, @fontsource-variable/roboto-mono, @fontsource/poppins
- @vercel/analytics
- typescript ^5.9.3
- vitest ^4.1.0, @vitest/ui, @playwright/test
- Override: path-to-regexp ^8.2.0

### Path aliases (TypeScript)
@ → src/, @components/, @layouts/, @lib/, @styles/, @assets/

### Variables de entorno
SUPABASE_URL, SUPABASE_KEY (en .env; tambien en Vercel secrets)

---

## BRIEFING DE ESTRUCTURA

### Paginas del sitio
- / (Home)
- /ranking
- /matches
- /players
- /players/[id]
- /compare
- /teams
- /teams-builder
- /fields
- /badges
- /hall-of-fame
- /login
- /404
- /admin
- /admin/matches
- /admin/matches/create
- /admin/matches/edit/[id]
- /admin/players
- /admin/players/create
- /admin/players/edit/[id]

### Secciones obligatorias por pagina
Home:
- Hero de marca SGSC
- Top ranking de temporada activa
- Ultimo resultado
- Accesos rapidos a modulos

Ranking:
- Selector de temporada (anual/historico)
- Selector de criterio de orden
- Tabla de clasificacion
- Leyenda de metricas

Players:
- Lista de jugadores con metricas resumen

Player Detail:
- Header de jugador
- KPIs (puntos, win rate, victorias/empates/derrotas)
- Comparativas (socios/nemesis, claro/oscuro)
- Historico anual y mensual
- Forma reciente

Matches:
- Listado historico de partidos
- Cards de partido con equipos y resultado

Teams / Teams Builder:
- Herramientas para armado de equipos
- Estadisticas para balance de planteles

Fields:
- Listado de canchas
- Estadisticas por sede

Compare:
- Selector de dos jugadores
- Filas comparativas por metrica

Hall of Fame / Badges:
- Rankings historicos por categoria
- Reconocimientos y logros

Admin:
- Dashboard de conteos y accesos
- CRUD de jugadores
- CRUD de partidos

Login:
- Formulario de acceso de administrador

### Componentes globales
- Layout principal Main.astro (head, OG meta, theme-color, twitter cards, favicon/apple-touch-icon/site.webmanifest, theme init script)
- Header (navegacion + toggle de tema + acceso admin)
- Footer
- Title (h1 + subtitulo estandar)
- Alert (mensajes de estado)
- Card (base visual compartida de contenedores)
- SectionTitle, PageHeader, TableWrapper

### Componentes de dominio
- Avatar, MatchCard, FieldCard, ResultStats, PlayerBadge
- players/*, ranking/*, compare/*, teams/*, admin/*

### Convenciones de componentes
- src/components/shared/ — elementos globales (Header, Footer)
- src/components/ui/ — atomicos reutilizables (aun sin poblar)
- src/components/sections/ — bloques de pagina (aun sin poblar)
- src/components/features/<feature>/ — componentes de dominio
- Estructura actual principalmente por dominio (shared, admin, players, ranking, teams, compare) — valida

### Utilidades en src/lib/utils/
- csrf.ts — isSameOrigin() para proteccion CSRF
- dateUtils.ts — formateo de fechas
- playerForm.ts — logica de formulario de jugadores
- teamBalancer.ts — algoritmo de balanceo de equipos

---

## BRIEFING VISUAL

### Tono estetico
- Deportivo y competitivo, con lenguaje visual de tablero estadistico.
- Fuerte jerarquia tipografica en KPIs y titulos.
- Balance entre interfaz utilitaria (admin) y presentacion premium (perfiles y ranking).

### Referencias visuales
- No documentadas formalmente en el repo actual.

### Preferencia de modo
- Ambos (claro y oscuro), con selector manual de tema.
- theme-color meta: light #570df8, dark #1d232a.

### Restricciones visuales
- Evitar estilos inline para propiedades cubiertas por Tailwind/DaisyUI.
- Evitar colores hardcodeados fuera de tokens semanticos, salvo casos justificados de identidad de equipo o visualizacion puntual.
- OG image default: /images/og-default.jpg
- Twitter card: summary_large_image
- OG locale: es_AR

---

## BRIEFING FUNCIONAL

### Funcionalidades que el proyecto necesita
- Ranking anual e historico.
- Perfiles avanzados de jugador.
- Historial de partidos y sedes.
- Comparador head-to-head.
- Generador/constructor de equipos (teamBalancer.ts).
- Panel admin con autenticacion para gestion de entidades.

### Base de datos
- Si, Supabase (Postgres).
- Entidades: players (incluye: is_active, birth_date, height, preferred_foot, is_guest, nickname, username, first_name, last_name), matches (incluye: video_url, notes, field_id), match_players, fields (incluye: city).
- Vistas: 5 (ver seccion STACK).
- RPC: create_complete_match (ver seccion STACK).

### Autenticacion
- Si, Supabase Auth (email/password) para acceso a admin.
- Usuario autenticado: acceso a panel de gestion.
- Usuario no autenticado: acceso solo a vistas publicas.

---

## ESTADO ACTUAL
- Proyecto en funcionamiento con output server (Astro + Vercel adapter).
- UI consolidada con Tailwind + DaisyUI + tema light/dark.
- Fuentes: Sora (UI) + Roboto Mono (countdown/tabular data).
- OG meta, twitter cards, favicon completo, site.webmanifest, theme-color implementados.
- Normalizacion de queries para evitar select(*) en paginas en progreso.
- STACK.md eliminado — CONTEXT.md es la unica fuente de verdad de contexto + stack.
- AGENTS.md: instrucciones operativas para agentes de IA (comandos, auth detalle, code conventions).

## Proximos pasos
- Usar CONTEXT.md como fuente de verdad al iniciar nuevas tareas.
- Usar DESIGN.md como estandar oficial para nomenclatura y estilos.
- Migrar progresivamente componentes shared/admin/domain al esquema unificado (global/ui/sections/features).
- Reducir uso de clases con colores no semanticos donde existan equivalentes DaisyUI.
- Eliminar inconsistencias de tema por scripts legacy y unificar default theme.
- Crear /images/og-default.jpg si no existe.
