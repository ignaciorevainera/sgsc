# Tarea: Contador en vivo desde ultimo partido en Home
Fecha: 2026-03-21

## Descripcion
Agregar en la pagina de inicio un contador en vivo que muestre cuanto tiempo lleva el grupo sin jugar (dias, horas, minutos y segundos), calculado desde la fecha del ultimo partido registrado. Debe integrarse visualmente con el estilo actual, sin reemplazar secciones existentes.

## Riesgos identificados
- La fecha de ultimo partido puede venir sin hora (YYYY-MM-DD), lo que puede generar desfase horario si no se normaliza.
- Si no hay partidos cargados, el contador puede romper o mostrar valores invalidos.
- Actualizaciones por segundo pueden generar drift o problemas de rendimiento si no se implementan con un tick estable.
- El uso de countdown de DaisyUI requiere seteo correcto de --value y aria para accesibilidad.
- Integracion visual puede desbalancear el layout responsive actual del index.

## Plan de ejecucion

[x] Paso 1 — fullstack: definir fuente de tiempo base y contrato de datos para el contador
    Criterio de exito: la pagina index expone un timestamp base valido del ultimo partido (o un estado vacio controlado) y queda documentado el fallback cuando no hay partidos.

[x] Paso 2 — ui-designer: crear bloque UI del contador integrado al home con DaisyUI countdown
    Criterio de exito: el contador se ve consistente con el diseno actual en mobile/desktop, no reemplaza secciones existentes y mantiene semantica accesible.

[x] Paso 3 — fullstack: implementar logica client-side en vivo (dias/horas/min/seg) con tick por segundo
    Criterio de exito: los valores se actualizan en tiempo real, nunca son negativos y mantienen formato correcto en todas las unidades.

[x] Paso 4 — fullstack: manejar estados borde (sin partidos, fecha invalida) y asegurar degradacion elegante
    Criterio de exito: ante datos faltantes o invalidos se muestra mensaje/estado alternativo sin errores en consola ni quiebre de layout.

[x] Paso 5 — qa-reviewer: verificar resultado completo y hacer commit
    Criterio de exito: build en verde, UX validada en mobile/desktop, accesibilidad basica del contador correcta (aria-live/labels), sin regresiones en home.

## Agentes involucrados
- planner
- fullstack
- ui-designer
- qa-reviewer

## Criterio de exito global
La Home muestra un contador en vivo, preciso y accesible del tiempo sin jugar desde el ultimo partido, integrado organicamente al diseno existente, funcionando con y sin datos de partidos, y sin romper build ni layout responsive.

## Resultado de revision — 2026-03-21

### Aprobado
- Build de produccion en verde con `astro build` (sin errores de compilacion ni de tipos).
- Integracion visual del bloque "Tiempo Sin Jugar" consistente con el layout actual en mobile, tablet y desktop.
- Jerarquia de headings en Home se mantiene valida (h1, h2, h3 sin saltos).
- Fallback sin datos de partido implementado y sin quiebre de layout.

### Requiere correccion
- Alta: Doble region viva actualizada cada segundo produce riesgo de spam para lectores de pantalla. En [src/pages/index.astro](src/pages/index.astro#L295) y [src/pages/index.astro](src/pages/index.astro#L338) se usa `aria-live="polite"` y ademas se actualiza texto cada 1s en [src/pages/index.astro](src/pages/index.astro#L440). Esto puede generar anuncios continuos e intrusivos.
- Alta: El uso de DaisyUI countdown esta exponiendo contenido verboso en arbol de accesibilidad (secuencias 00-99) en los bloques del contador ([src/pages/index.astro](src/pages/index.astro#L299), [src/pages/index.astro](src/pages/index.astro#L308), [src/pages/index.astro](src/pages/index.astro#L317), [src/pages/index.astro](src/pages/index.astro#L326)). Se verifico en snapshot accesible mobile.
- Media: Riesgo de desfase horario por parseo de fecha sin zona al convertir a ISO. Se normaliza con `T00:00:00` en [src/pages/index.astro](src/pages/index.astro#L54) y luego se serializa con `toISOString()` en [src/pages/index.astro](src/pages/index.astro#L62), lo que puede variar entre servidor/cliente segun timezone.
- Baja: Riesgo menor de performance por trabajo repetido en cada tick (4 querySelector por segundo) en [src/pages/index.astro](src/pages/index.astro#L416). El impacto es bajo, pero se puede optimizar cacheando referencias.

### Bloqueantes para completar la tarea
- Ajustar estrategia de accesibilidad del contador para evitar anuncios por segundo y salida verbosa en lectores de pantalla.
- Definir normalizacion temporal estable para fechas sin hora (criterio unico de zona/instante base).

## Resultado de revision — 2026-03-21

### Aprobado
- Bloqueantes previos de accesibilidad resueltos en Home: el bloque visual del countdown queda fuera del arbol accesible con `aria-hidden="true"` y existe una unica region viva controlada por minuto (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`) en `src/pages/index.astro`.
- Sin regresiones funcionales del contador: el valor de segundos incrementa en vivo (verificacion runtime en 2.2s: `52 -> 54`) y mantiene consistencia de dias/horas/minutos en `src/pages/index.astro`.
- Sin regresiones visibles del layout Home en mobile/tablet/desktop segun capturas actuales (`qa-home-mobile.png`, `qa-home-tablet.png`, `qa-home-desktop.png`).
- Normalizacion temporal estable para fechas `YYYY-MM-DD`: base timestamp en UTC (`1769817600000`, multiplo exacto de 86400000) y visualizacion consistente de fecha en `src/pages/index.astro`.
- Build de produccion en verde con `npm run build` (sin errores de compilacion ni TypeScript).

### Requiere correccion
- Ninguna.

### Bloqueantes para completar la tarea
- Ninguno.

## Auditoria de seguridad — 2026-03-21

### Sin vulnerabilidades
- Secretos en cliente: no se detectaron `PUBLIC_*SECRET`, `PUBLIC_*SERVICE_ROLE` ni `SUPABASE_SERVICE_ROLE_KEY` expuesta en `src/`.
- Almacenamiento inseguro de sesion: no se detectaron tokens/sesiones en `localStorage` o `sessionStorage`.
- Metodo HTTP en API: `src/pages/api/auth/signout.ts` exporta solo `POST`.
- Variables de entorno locales: `.env` y `.env.production` estan en `.gitignore`.

### Vulnerabilidades encontradas y corregidas
- Falta de proteccion centralizada de rutas privadas y subrutas.
    Archivo: `src/middleware.ts:4-49` (agregado).
    Correccion: se implemento middleware global para proteger todo prefijo `/admin` y redirigir a `/login` si no hay sesion activa.

- Falta de mitigacion CSRF para POST sensibles.
    Archivo: `src/middleware.ts:5, 42-47`.
    Correccion: se agrego validacion de mismo origen (Origin/Referer) para POST en `/admin` y `/api/auth/signout`, devolviendo `403` si falla.

- Riesgo XSS por insercion de contenido dinamico con `innerHTML` en preview de convocatoria.
    Archivo: `src/pages/admin/matches/create.astro:579-595`.
    Correccion: se reemplazo render con `innerHTML` por construccion segura de nodos DOM usando `textContent`.

- Riesgo XSS por interpolacion de nombres dinamicos en HTML generado para armador de equipos.
    Archivo: `src/pages/teams-builder.astro:386, 444-458`.
    Correccion: se agrego `escapeHtml(...)` para valores dinamicos antes de interpolarlos en el template HTML.

- Riesgo XSS menor por feedback visual armado con `innerHTML`.
    Archivo: `src/pages/teams-builder.astro:502-507`.
    Correccion: se reemplazo `innerHTML` por `textContent` para el estado del boton de copiado.

- Exposicion de error interno del servidor al cliente.
    Archivo: `src/pages/admin/players/edit/[id].astro:60`.
    Correccion: se reemplazo respuesta con payload tecnico por mensaje generico `Error interno`.

- Header de hardening incompleto para permisos del navegador.
    Archivo: `vercel.json:28`.
    Correccion: se agrego `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

### Requiere decision del usuario
- `tasks/lessons.md` no existe en este repositorio, por lo que no se pudo revisar historial de vulnerabilidades previas.

- Supabase Security Advisors reporta politicas RLS permisivas (`USING/WITH CHECK true`) y proteccion de leaked passwords deshabilitada.
    Detalle:
    - `public.match_players` policy `Solo admins pueden modificar match_players` (ALL con `true`).
    - `public.players` policy `Permitir crear jugadores a admins` (INSERT con `with_check true`).
    - `public.players` policy `Permitir editar jugadores a admins` (UPDATE con `true`).
    - Auth: leaked password protection disabled.

    Limitacion actual:
    - El entorno Supabase en esta sesion esta en modo read-only para migraciones (`Cannot apply migration in read-only mode`).
    - No existe modelo de roles administrativos en tablas publicas (no hay columna/tabla de rol) para endurecer politicas sin una definicion funcional previa.

### Recomendaciones adicionales
- Definir un modelo de roles de administracion en BD (por ejemplo tabla `admin_users` vinculada a `auth.users`) y reemplazar politicas `authenticated` por chequeos explicitos de admin.
- Habilitar leaked password protection en Supabase Auth:
    https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Eliminar politicas RLS redundantes/permisivas marcadas por el linter y consolidar una sola politica por accion con condicion estricta de admin.

## Reporte de testing — 2026-03-21

### Tests de unidad (Vitest)
[14 tests pasando / 0 tests fallando]
Cobertura:
- [src/lib/utils/dateUtils.ts](src/lib/utils/dateUtils.ts): `getSafeDate`, `formatDate`, `getYearFromDate`, `getCurrentYear`, `calculateAge`.
- [src/lib/utils/playerForm.ts](src/lib/utils/playerForm.ts): `parsePlayerFormData`.
- [src/lib/supabase.ts](src/lib/supabase.ts): inicializacion de `supabase` y `createAstroSupabase` (mockeado).
Sin cobertura:
- Ninguna funcion exportada de `src/lib/` quedo sin test.

### Tests e2e (Playwright)
[14 tests pasando / 0 tests fallando / 8 tests omitidos por entorno]
Flujos cubiertos (definidos en specs):
- [tests/e2e/auth.spec.ts](tests/e2e/auth.spec.ts): redireccion de ruta protegida, login invalido, endpoint signout por GET.
- [tests/e2e/fixtures.ts](tests/e2e/fixtures.ts): fixture autenticado para login con credenciales reales.
- [tests/e2e/navigation.spec.ts](tests/e2e/navigation.spec.ts): navegacion publica y carga en viewport mobile.
- [tests/e2e/forms.spec.ts](tests/e2e/forms.spec.ts): presencia de campos requeridos y submit vacio en login.
- [tests/e2e/admin-forms.spec.ts](tests/e2e/admin-forms.spec.ts): alta real de jugador y alta real de partido (persistencia).
Flujos sin cobertura ejecutada:
- Login valido y logout real (definidos pero omitidos sin `TEST_EMAIL` / `TEST_PASSWORD`).
- Persistencia real admin (definida pero omitida sin `E2E_ALLOW_MUTATIONS=true`).

### Problemas encontrados
- No existia infraestructura de testing en el repo (sin scripts, sin config, sin tests).
- `tasks/lessons.md` no existe para extraer lecciones previas de testing.
- `src/types/` no existe en el proyecto actual (solo tipos en utilidades), por lo que no se pudo hacer lectura obligatoria de esa carpeta.

### Deuda tecnica de testing
- Configurar `.env.test` real a partir de `.env.test.example` para habilitar ejecucion de tests autenticados.
- Habilitar `E2E_ALLOW_MUTATIONS=true` solo en entorno de pruebas controlado para ejecutar persistencia real sin riesgo sobre datos compartidos.

## Resultado de revision — 2026-03-21 (auditoria completa)

### Aprobado
- Build de produccion en verde con `npm run build`.
- Chequeo de tipos/diagnosticos Astro en verde (`npx astro check` sin errores; solo hints).
- Suite de tests automatizados en verde: `npm run test:run` (14/14) y `playwright test` (14 passed, 8 skipped por entorno).
- Verificacion visual automatizada en mobile/tablet/desktop sobre rutas publicas y admin protegidas del `PROJECT_CONTEXT`: sin overflow horizontal detectado y sin errores de consola en rutas 200 (excepto ruido esperado en `/404`).
- Rutas admin protegidas redirigen correctamente a `/login` cuando no hay sesion.

### Requiere correccion
- Alta: hay clases Tailwind con valores arbitrarios en paginas y estilos de medallas, incumpliendo la regla de proyecto de no usar valores arbitrarios en codigo nuevo/modificado. Ejemplos:
    - `src/pages/teams.astro` (gradientes/patron con `bg-[...]`, `bg-size-[...]`, opacidad arbitraria)
    - `src/pages/players/[id].astro` (sombras `shadow-[...]`, anchos `min-w-[...]`)
    - `src/pages/admin/matches/create.astro` (`max-h-[90vh]`)
    - `src/pages/404.astro` (`rounded-[100%]`)
    - `src/pages/badges.astro` (sombras `shadow-[...]`)
- Media: existe estilo inline en `src/pages/404.astro` (`style="rotate: -30deg;"`), incumpliendo la convencion de evitar `style=""`.
- Media: hay colores hardcodeados en codigo de UI (`#000000`, `#ffffff`, `#F59E0B`, `#6366f1`) en:
    - `src/pages/teams.astro`
    - `src/pages/players/[id].astro`
- Media: `astro check` reporta 6 hints de simbolos no usados que conviene limpiar para mantener calidad interna:
    - `src/components/MatchCard.astro`
    - `src/components/shared/SectionTitle.astro`
    - `src/pages/index.astro`

### Bloqueantes para completar la tarea
- Falta `tasks/lessons.md`, por lo que no se puede validar contra historial de errores obligatorios del proyecto.
- No estan disponibles `.github/skills/web-design-guidelines.md`, `.github/skills/performance.md` ni `AGENT_INSTRUCTIONS.md`, por lo que la auditoria no pudo contrastarse contra esas checklists internas requeridas para cierre final.
- Auditoria visual de rutas dinamicas admin (`/admin/matches/edit/[id]`, `/admin/players/edit/[id]`) no se pudo completar sin credenciales + IDs concretos de registros en entorno de prueba.

## Resultado de revision — 2026-03-22

### Aprobado
- Se eliminaron los hallazgos de estilo inline y utilidades arbitrarias reportadas en esta tarea:
    - `src/pages/404.astro` (sin `style="..."` y sin `rounded-[...]`).
    - `src/pages/teams.astro` (sin `bg-[...]`, `bg-size-[...]` ni opacidades arbitrarias en el bloque decorativo).
    - `src/pages/admin/matches/create.astro` (sin `max-h-[90vh]`).
    - `src/pages/badges.astro` y `src/pages/players/[id].astro` (sin `shadow-[...]`).
    - `src/pages/players/[id].astro` (sin `min-w-[...]`).
- Se eliminaron colores hex hardcodeados en los graficos de `src/pages/players/[id].astro`, usando colores obtenidos desde tokens semanticos (`text-warning`, `text-secondary`).
- Se limpiaron hints de simbolos no usados en:
    - `src/components/MatchCard.astro`
    - `src/components/shared/SectionTitle.astro`
    - `src/pages/index.astro`
- Validaciones ejecutadas en verde:
    - `npx astro check` -> 0 errores, 0 warnings, 0 hints.
    - `npm run build` -> build exitoso.
    - `npm run test:run` -> 14/14 tests unitarios pasando.
    - `npx playwright test` -> 14 passed, 8 skipped (por guardas de entorno).

### Requiere correccion
- Ninguna en el alcance de esta pasada de remediacion.

### Bloqueantes para completar la tarea
- Siguen vigentes los bloqueantes de proceso ya documentados previamente (archivos de checklist internos faltantes y falta de credenciales/IDs para auditoria visual completa de rutas admin dinamicas).
