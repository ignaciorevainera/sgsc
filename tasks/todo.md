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
