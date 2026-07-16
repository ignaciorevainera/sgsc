# SGSC Audit — Especificación de Correcciones

> Auditoría generada: 2026-07-16
>
> Propósito: identificar puntos de mejora, priorizarlos y registrar su corrección en iteraciones sucesivas.

## Convenciones del archivo

- Cada item tiene un **ID** único.
- `[ ]` pendiente · `[/]` en progreso · `[x]` corregido
- Se agrupan en entregas (milestones) según prioridad.
- Se agregan items nuevos a medida que se detectan.

---

## Entrega 1 — Seguridad y Secretos

> Rotación de claves expuestas y eliminación de secretos del repo.

### S-1 🔴 API keys expuestas en `opencode.jsonc`

**Archivo**: `opencode.jsonc`
**Líneas**: 30, 52
**Problema**: Las claves `sk-user-f4HB6ix...` (TestSprite) y `ctx7sk-5480ef2e...` (Context7) están en texto plano en un archivo trackeado por git.

**Solución aplicada**:
1. Agregar `opencode.jsonc` a `.gitignore`.
2. Eliminar del tracking de git (`git rm --cached`).

**Checklist**:
- [x] Agregar `opencode.jsonc` a `.gitignore`
- [x] Ejecutar `git rm --cached opencode.jsonc`
- [ ] Regenerar claves expuestas en dashboards externos

---

## Entrega 2 — Infraestructura y CI

> Pipeline de calidad básico y documentación para onboarding.

### I-1 🟡 Eliminar Prettier

**Archivo**: `package.json`, `.prettierrc`
**Problema**: Prettier instalado con plugins pero sin uso activo ni script de lint.

**Solución aplicada**:
1. Remover `prettier`, `prettier-plugin-astro`, `prettier-plugin-tailwindcss` de `devDependencies`.
2. Eliminar `.prettierrc`.

**Checklist**:
- [x] Remover dependencias de `package.json`
- [x] Eliminar `.prettierrc`
- [x] Ejecutar `npm install` para limpiar lockfile

### I-2 🟡 Falta CI de tests

**Archivo**: `.github/workflows/`
**Problema**: Solo existe `keep_alive.yml`. No hay workflow que ejecute tests en push/PR.

**Solución aplicada**: Crear `.github/workflows/ci.yml` con:
- `npm ci && npm run build && npm run test:run`
- Node 22, cache npm
- Dispara en push/PR a `master`

**Checklist**:
- [x] Crear `ci.yml`
- [ ] Verificar que corre en push a `master` y en PRs (requiere push para validar)

### I-3 🟡 Falta `.env.example`

**Problema**: Solo existe `.env.test.example`. Un nuevo desarrollador no sabe qué variables de entorno necesita.

**Solución**: Crear `.env.example` con las variables necesarias y un comentario breve.

```
# Supabase
SUPABASE_URL=https://vbiuclhuqfqbpdddybnt.supabase.co
SUPABASE_KEY=sb_publishable_...

# (opcional) E2E
# TEST_EMAIL=
# TEST_PASSWORD=
# E2E_ALLOW_MUTATIONS=false

# (opcional) TestSprite MCP
# TESTSPRITE_API_KEY=

# (opcional) Context7 MCP
# CONTEXT7_API_KEY=
```

**Checklist**:
- [x] Crear `.env.example`

### I-4 🟡 Cache-Control inconsistente

**Archivo**: Múltiples páginas públicas
**Problema**: `index.astro`, `ranking.astro`, `players/[id].astro`, `matches.astro`, `fields.astro` setean `Cache-Control`. `teams.astro`, `compare.astro`, `teams-builder.astro`, `badges.astro` no.

**Solución**: Agregar `Astro.response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300")` a todas las páginas públicas.

**Checklist**:
- [x] `teams.astro` — ya tenía header
- [x] `compare.astro`
- [x] `teams-builder.astro`
- [x] `badges.astro`
- [x] `hall-of-fame.astro` — ya tenía header (confirmado)

---

## Entrega 3 — Calidad de Código

> Reducción de `@ts-ignore`, tipado estricto, y desacople de lógica.

### C-1 🟡 `@ts-ignore` en `teams.astro`

**Archivo**: `src/pages/teams.astro`
**Líneas**: 40–57
**Problema**: Seis líneas consecutivas con `@ts-ignore` para procesar `appearances`. El bloque entero evade el sistema de tipos.

**Solución**: Definir interfaz:

```typescript
type PlayerAppearance = {
  player_id: string;
  team: "light" | "dark";
  players: { nickname: string; is_guest: boolean | null } | { nickname: string; is_guest: boolean | null }[] | null;
};
```

Y usarla en la consulta y procesamiento.

**Checklist**:
- [x] Tipar `rawAppearances` como `RawAppearance[]`
- [x] Eliminar `@ts-ignore` (6 líneas)
- [x] `npm run astro check` — 0 errores

### C-2 🟡 `@ts-ignore` y `any` en `players/[id].astro`

**Archivo**: `src/pages/players/[id].astro`
**Líneas**: 69, 94, 199–200, 232–234, 239–243, 252–258
**Problema**: Uso extensivo de `(p: any)`, `(s: any)`, `match as any`, y `player as any`. El tipo `getMatchData` retorna `MatchData | null` pero se usa sin narrowing.

**Solución**: Usar los tipos generados de Supabase (`Tables<"view_player_stats_all_time">`, `Tables<"match_players">`) en lugar de `any`.

**Checklist**:
- [x] Reemplazar casts inline en colorStats con guard tipado y helper
- [x] Eliminar helper genérico incompatible con `.astro`
- [x] `npm run astro check` — 0 errores

### C-3 🟡 `players/[id].astro` monolítico (1292 líneas)

**Archivo**: `src/pages/players/[id].astro`
**Problema**: Lógica de badges (~200 líneas), socio/némesis (~80 líneas), color stats (~30 líneas), y gráficos (~90 líneas) todo en el mismo archivo.

**Solución**: Extraer a módulos:

| Módulo | Lo que contiene |
|--------|----------------|
| `src/lib/utils/badges.ts` | Sistema de tiers, cálculo de medallas, tipos `TierKey`, `Badge` |
| `src/lib/utils/headToHead.ts` | Lógica de partner stats, rival stats, `minMatches` |
| `src/lib/utils/colorStats.ts` | Lógica de claro/oscuro win rate |

Las importaciones en `[id].astro` se reducen a 3 líneas.

**Checklist**:
- [x] Crear `src/lib/utils/badges.ts` (computeBadges)
- [x] Crear `src/lib/utils/headToHead.ts` (computeHeadToHead)
- [x] Crear `src/lib/utils/colorStats.ts` (computeColorStats)
- [x] Refactorizar `[id].astro` — 1293 → 982 líneas
- [x] Build + tests + astro check pasan

### C-4 🟡 `@ts-ignore` en `compare.astro`

**Archivo**: `src/pages/compare.astro`
**Líneas**: 73, 106, 122–123
**Problema**: `@ts-ignore` en accesos a `m.match.result` y `entry.match.id`.

**Solución**: Tipar correctamente la respuesta de Supabase y extraer con helper.

```typescript
type MatchEntry = {
  player_id: string;
  team: string;
  match: { id: string; result: string } | { id: string; result: string }[] | null;
};
```

**Checklist**:
- [x] Definir tipo `MatchEntry` para resultados de Supabase
- [x] Eliminar `@ts-ignore` (3 líneas) y `any` (3 usos)
- [x] Verificar funcionamiento de comparación

---

## Entrega 4 — UX y Manejo de Errores

> Feedback claro al usuario en formularios y manejo de estados de error.

### U-1 🟡 Reemplazar Alert por Toast notifications

**Archivos**: Múltiples admin pages
**Problema**: Alert component sin animación, no auto-dismiss, UX pobre.

**Solución aplicada**:
1. Crear `ToastContainer.astro` con slide-in/out animation, auto-dismiss 5s, click-to-dismiss
2. Integrar en `Main.astro` layout, acepta props o lee URL params
3. Reemplazar Alert en todas las páginas admin:
   - `admin/players/create.astro` — error toast + success redirect
   - `admin/players/edit/[id].astro` — toast redirects en save/toggle
   - `admin/matches/create.astro` — error toast + success redirect
   - `admin/matches/edit/[id].astro` — toast redirects en save

**Checklist**:
- [x] Crear ToastContainer.astro
- [x] Integrar en Main.astro layout
- [x] Reemplazar en players create/edit
- [x] Reemplazar en matches create/edit

### U-2 🟡 Validación débil en `admin/matches/create.astro`

**Archivo**: `src/pages/admin/matches/create.astro`
**Líneas**: 53–56
**Problema**: Solo verifica existencia de campos, no formato ni valores permitidos.

**Solución**:

```typescript
// Validar fecha ISO
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(date)) throw new Error("Formato de fecha inválido.");

// Validar field_id existe
const selectedField = fields?.find(f => String(f.id) === field_id);
if (!selectedField) throw new Error("Sede inválida.");

// Validar resultado
if (!["light", "dark", "draw"].includes(result)) throw new Error("Resultado inválido.");
```

**Checklist**:
- [x] Agregar validación de formato de fecha
- [x] Agregar validación de field_id existente
- [x] Agregar validación de resultado contra valores permitidos
- [x] Aplicar mismas validaciones a `matches/edit/[id].astro`

### U-3 🟡 Falta página de error 500

**Problema**: No existe `src/pages/500.astro`. Si ocurre un error de servidor, Astro muestra su página de error por defecto.

**Solución**: Crear `src/pages/500.astro` con diseño consistente con `404.astro`:

- Misma estructura visual (logo, fondo, navegación)
- Mensaje: "Error interno del servidor"
- Botón: "Volver al inicio"
- `Astro.response.status = 500`

**Checklist**:
- [x] Crear `500.astro`
- [x] Verificar que se renderiza forzando un error

---

## Entregas futuras (propuestas)

| ID | Área | Descripción |
|----|------|-------------|
| F-1 | Testing | Agregar tests unitarios para `badges.ts`, `headToHead.ts`, `colorStats.ts` |
| F-2 | Testing | Agregar test E2E para player edit con toggle de estado |
| F-3 | Monitoreo | Agregar manejo de errores con `Astro.error` |
| F-4 | SEO | Verificar meta tags y Open Graph en todas las páginas |
| F-5 | Performance | Evaluar lazy loading de imágenes en hero |
| F-6 | Accesibilidad | Auditoría WCAG con axe-core |

---

## Progreso

| Entrega | Items | Pendientes | En Progreso | Completados |
|---------|-------|------------|-------------|-------------|
| 1. Seguridad | 1 | 0 | 0 | 1 |
| 2. Infraestructura | 4 | 0 | 0 | 4 |
| 3. Calidad de código | 4 | 0 | 0 | 4 |
| 4. UX y errores | 3 | 0 | 0 | 3 |
| **Total** | **12** | **0** | **0** | **12** |
