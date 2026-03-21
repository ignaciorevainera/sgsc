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
- Layout principal Main.astro
- Header (navegacion + toggle de tema + acceso admin)
- Footer
- Title (h1 + subtitulo estandar)
- Alert (mensajes de estado)

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

### Restricciones visuales
- Evitar estilos inline para propiedades cubiertas por Tailwind/DaisyUI.
- Evitar colores hardcodeados fuera de tokens semanticos, salvo casos justificados de identidad de equipo o visualizacion puntual.

---

## BRIEFING FUNCIONAL

### Funcionalidades que el proyecto necesita
- Ranking anual e historico.
- Perfiles avanzados de jugador.
- Historial de partidos y sedes.
- Comparador head-to-head.
- Generador/constructor de equipos.
- Panel admin con autenticacion para gestion de entidades.

### Base de datos
- Si, Supabase (Postgres).
- Entidades principales detectadas: players, matches, match_players, fields.
- Vistas detectadas: view_player_stats_all_time, view_player_stats_yearly.
- Funcion RPC detectada: create_complete_match.

### Autenticacion
- Si, Supabase Auth (email/password) para acceso a admin.
- Usuario autenticado: acceso a panel de gestion.
- Usuario no autenticado: acceso solo a vistas publicas.

---

## ESTADO ACTUAL
- Proyecto en funcionamiento con output server (Astro + Vercel adapter).
- UI consolidada con Tailwind + DaisyUI.
- Se inicio normalizacion de queries para evitar select("*") en paginas.
- Documentacion de contexto/stack/diseno en proceso de unificacion.

## Proximos pasos
- Mantener PROJECT_CONTEXT.md y STACK.md como fuente de verdad al iniciar nuevas tareas.
- Usar DESIGN_SYSTEM.md como estandar oficial para nomenclatura y estilos en SGSC y proyectos futuros.
