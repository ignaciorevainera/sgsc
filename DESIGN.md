# DESIGN SYSTEM - SGSC
Generado el 2026-03-21. Este archivo reemplaza a DESIGN_STANDARDS.md como referencia oficial para decisiones de diseno, estilo y nomenclatura.

## Stack
- Astro 6 + Tailwind CSS 4 + DaisyUI 5
- Iconos con astro-icon (set principal: material-symbols)
- Fuente base: Sora Variable
- Runtime de tema con theme-change

## Tema activo
- Modo soportado: claro y oscuro
- data-theme en layout principal
- Toggle global en Header
- Regla de proyecto: usar light/dark como base oficial. El valor fantasy puede usarse solo como override puntual de usuario, no como tema de diseno por defecto en nuevas implementaciones.

## Tokens de color en uso
Base semantica obligatoria:
- bg-base-100, bg-base-200, bg-base-300
- text-base-content
- primary, secondary, accent, neutral
- success, warning, error, info

Colores de semantica de juego (dominio futbol):
- Equipo claro: escala slate clara
- Equipo oscuro: escala slate oscura
- Empate: escala yellow

Norma:
- Priorizar tokens DaisyUI para UI general.
- Usar colores de dominio (equipo claro/oscuro/empate) solo en contextos de partido/resultado.

## Tipografia
- Fuente principal UI: Sora Variable
- Jerarquia visual predominante: titulos bold/black y labels uppercase
- Poppins esta instalada pero no se declara como fuente base global

## Escala tipografica usada
Escala recomendada para todo proyecto del ecosistema SGSC:
- Titulos de pagina: text-3xl a text-6xl + font-black
- Subtitulos de pagina: text-sm a text-lg + text-base-content/60
- Titulo de seccion: text-xl a text-2xl + font-black
- Texto de soporte: text-xs a text-sm
- KPIs: text-2xl a text-5xl + font-black

## Espaciado y layout
- Layout principal: contenedor centrado con px-4 y py responsivo
- Ancho publico: max-w-[80ch]
- Ancho admin: max-w-[80ch] + lg:max-w-7xl
- Cards: rounded-xl + border + shadow-md
- Gaps frecuentes: gap-2, gap-4, gap-6
- Grids responsive: mobile-first con sm, md, lg, xl

## Componentes catalogados
Global/shared:
- Header, Footer, Title, Alert, Card, SectionTitle, PageHeader, TableWrapper

Dominio:
- Avatar, MatchCard, FieldCard, ResultStats, PlayerBadge
- players/*, ranking/*, compare/*, teams/*, admin/*

Patrones de composicion:
- Main.astro centraliza head, layout y shell global
- Title se usa como encabezado estandar de vistas
- Alert para estados (error/warning/success)
- Card compartida como base visual de contenedores

## Convenciones de nomenclatura
Archivos:
- Componentes: PascalCase.astro
- Paginas: kebab-case.astro y rutas dinamicas [id].astro
- Utilidades: camelCase.ts

Carpetas de componentes (estandar SGSC unificado):
- src/components/global para elementos globales (header/footer)
- src/components/ui para atomicos reutilizables
- src/components/sections para bloques de pagina
- src/components/features/<feature> para componentes de dominio

Estado actual del repo:
- Estructura principal por dominio (shared, admin, players, ranking, teams, compare).
- Esta estructura es valida y mantenible; para proyectos nuevos se recomienda el estandar unificado anterior.

Clases y estilo:
- Priorizar DaisyUI + Tailwind
- Evitar estilos inline salvo casos de valor dinamico no expresable con clases
- Evitar valores arbitrarios Tailwind en codigo nuevo

## Patrones prohibidos
- select("*") en paginas (usar columnas explicitas)
- Mezclar sets de iconos sin justificacion
- Repetir componentes visuales sin pasar por shared/ui
- Agregar nuevos colores hardcodeados para UI general
- Saltos de jerarquia de headings (h1 -> h3)

## Decisiones documentadas
- El DS oficial pasa a ser DESIGN_SYSTEM.md
- DESIGN_STANDARDS.md queda como referencia historica no normativa
- Naming unificado recomendado para proyectos nuevos: global/ui/sections/features
- Query style en servidor: explicit column selection por defecto
- Iconografia principal: material-symbols

## Pendientes
- Migrar progresivamente componentes shared/admin/domain al esquema unificado (global/ui/sections/features)
- Reducir uso de classes puntuales con colores no semanticos cuando existan equivalentes DaisyUI
- Eliminar inconsistencias de tema por scripts legacy y unificar default theme
- Documentar ejemplos de plantillas base de componentes (global, ui, sections, features)
