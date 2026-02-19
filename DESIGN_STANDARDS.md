# Estándares de Diseño - SGSC

Este documento define los estándares de diseño, colores, componentes y patrones utilizados en el proyecto SGSC (Solo Gente Súper Comprometida Fútbol Club).

## 🎨 Paleta de Colores

### Equipos

#### Equipo Claro

- **Fondo**: `bg-slate-100` / `bg-slate-50`
- **Bordes**: `border-slate-300` / `border-slate-200`
- **Texto principal**: `text-slate-700` / `text-slate-800`
- **Texto secundario**: `text-slate-500` / `text-slate-600`
- **Iconos**: `text-slate-300/40` para light-mode icon
- **Uso**: Representa al equipo claro en partidos y estadísticas

#### Equipo Oscuro

- **Fondo**: `bg-slate-800` / `bg-slate-900`
- **Bordes**: `border-slate-700` / `border-slate-600`
- **Texto principal**: `text-slate-100` / `text-white`
- **Texto secundario**: `text-slate-400` / `text-slate-300`
- **Iconos**: `text-slate-400` para dark-mode icon
- **Uso**: Representa al equipo oscuro en partidos y estadísticas

#### Empates

- **Fondo**: `bg-yellow-100` / `bg-yellow-50`
- **Bordes**: `border-yellow-400` / `border-yellow-200`
- **Texto**: `text-yellow-700` / `text-yellow-600`
- **Decoración**: `bg-yellow-400` para indicadores
- **Iconos**: balance icon
- **Uso**: Representa empates en resultados

### Colores del Sistema

#### Primary

- **Clase DaisyUI**: `btn-primary`, `text-primary`, `bg-primary`
- **Uso**: Acciones principales, enlaces importantes, hover states en avatares

#### Success

- **Verde**: Para victorias y acciones exitosas
- **Clase**: `text-success`, `alert-success`

#### Error

- **Rojo**: Para errores y acciones destructivas
- **Clase**: `text-error`, `alert-error`, `btn-error`

#### Warning

- **Amarillo/Naranja**: Para advertencias
- **Clase**: `text-warning`, `alert-warning`

#### Neutral

- **Avatares**: `bg-neutral`, `text-neutral-content`

## 🧩 Componentes Compartidos

### Avatar (`src/components/Avatar.astro`)

```astro
<Avatar
  initial="AB"
  size="sm"
  |
  "md"
  |
  "lg"
  |
  "xl"
  ring={true}
  interactive={true}
/>
```

**Comportamiento:**

- **Ring por defecto**: `ring-slate-200` (gris muy claro)
- **Ring en hover**: `ring-primary` cuando `interactive={true}`
- **Transiciones**: `transition-all duration-200`
- **Sombras**: `hover:shadow-md` en hover
- **Group-aware**: Responde a `group-hover`

**Props:**

- `initial`: Iniciales del usuario (string)
- `size`: Tamaño del avatar (xs/sm/md/lg/xl)
- `ring`: Mostrar anillo decorativo (boolean, default: true)
- `interactive`: Habilitar hover/animaciones (boolean, default: true)

### Title (`src/components/shared/Title.astro`)

```astro
<Title title="Título Principal" subtitle="Subtítulo descriptivo" />
```

**Uso:**

- Encabezados de páginas principales
- Debe usarse en TODAS las vistas (excepto perfiles individuales como `[id].astro`)
- Excepciones explícitas: `src/pages/index.astro` y `src/pages/404.astro`

### ResultStats (`src/components/ResultStats.astro`)

```astro
<ResultStats lightWins={10} darkWins={8} draws={2} />
```

**Diseño:**

- Grid de 3 columnas
- Número destacado (text-2xl) arriba
- Etiqueta pequeña (text-xs uppercase) abajo
- Sin textos redundantes como "Victorias"

## 📐 Patrones de Diseño

### Cards

```css
/* Estándar para cards */
class="card bg-base-100 border-base-200 rounded-xl border shadow-md"
```

**Hover en cards:**

```css
class="hover:-translate-y-1 hover:shadow-lg transition-all"
```

### Botones

```css
/* Botón primario */
class="btn btn-primary gap-2 rounded-xl shadow-md"

/* Botón secundario */
class="btn btn-outline gap-2 rounded-xl"

/* Tamaños responsivos */
class="btn-sm lg:btn-md"
```

### Inputs y Forms

```css
/* Input estándar */
class="input input-bordered w-full rounded-xl"

/* Select estándar */
class="select select-bordered w-full rounded-xl"

/* Label */
class="label-text text-base-content/60 text-xs font-bold uppercase"
```

### Tables

```css
/* Tabla base */
class="table w-full"

/* Tamaños responsivos */
class="table-xs sm:table-sm lg:table-md"
```

### Badges

```css
/* Badge estándar */
class="badge badge-neutral rounded-xl font-bold"

/* Badge para invitados */
class="badge badge-ghost badge-sm border-base-300"
```

### Dividers

```css
class="divider m-0"
```

## 🎯 Responsive Design

### Breakpoints (Tailwind/DaisyUI)

- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

### Patrones Comunes

```css
/* Grid responsivo */
class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

/* Ocultar en móvil */
class="hidden sm:inline"
class="sm:hidden"

/* Texto responsive */
class="text-xs sm:text-sm lg:text-base"

/* Padding/Margin responsive */
class="p-4 sm:p-6 lg:p-8"
```

## 🔤 Tipografía

### Jerarquía

```css
/* Títulos principales */
class="text-3xl font-black uppercase"

/* Subtítulos */
class="text-base-content/60 text-xs font-bold uppercase"

/* Texto normal */
class="text-sm sm:text-base"

/* Números destacados (estadísticas) */
class="text-2xl font-black"
```

### Estilos de fuente

- `font-black`: Títulos muy importantes
- `font-bold`: Títulos secundarios, labels
- `font-semibold`: Énfasis moderado
- `font-medium`: Texto regular con énfasis

## 📅 Formateo de Fechas

Usar siempre `formatDate` de `src/lib/utils/dateUtils.ts`:

```typescript
import { formatDate } from "@/lib/utils/dateUtils";

// Formatos disponibles:
formatDate(dateString, "short"); // "11/04/2026" (default)
formatDate(dateString, "medium"); // "11 Abr 2026"
formatDate(dateString, "long"); // "Lun, 11 Abr"
formatDate(dateString, "compact"); // "Abr 2026" (para FieldCard)
```

**Importante**:

- Siempre usar `getSafeDate()` para evitar problemas de zona horaria
- Las fechas de la BD vienen en formato "YYYY-MM-DD"
- Se agrega "T12:00:00" para evitar saltos de día

## 🎭 Iconos

### Sistema de Iconos

```astro
import {Icon} from "astro-icon/components";

<Icon name="material-symbols:nombre-icon" size={24} />
```

### Iconos Comunes

- **Equipos**: `material-symbols:light-mode` (Claro), `material-symbols:dark-mode` (Oscuro)
- **Empate**: `material-symbols:balance`
- **Calendario**: `material-symbols:calendar-today`
- **Ubicación**: `material-symbols:location-on`
- **Trofeo**: `material-symbols:trophy`
- **Jugadores**: `material-symbols:groups`
- **Estadio**: `material-symbols:stadium-rounded`
- **Verificación**: `material-symbols:check-circle`
- **Error**: `material-symbols:error`

## 📂 Estructura de Admin

### Subtítulos

Todas las vistas de admin DEBEN usar:

```astro
<Title title="Nombre Vista" subtitle="Panel de Administración" />
```

### Layout

- Ancho máximo en desktop: `lg:max-w-7xl` (para admin)
- Ancho estándar páginas públicas: `max-w-[80ch]`
- Implementación recomendada: usar `contentWidth="admin"` en `Main.astro` para vistas admin

## 🎨 Animaciones

### Transiciones Estándar

```css
class="transition-all duration-200"
class="transition-colors"
```

### Hover Effects

```css
/* Elevación */
class="hover:-translate-y-1"

/* Escala */
class="hover:scale-[1.02] active:scale-[0.98]"

/* Sombra */
class="hover:shadow-lg"
```

### Animaciones de entrada

```css
class="animate-fade-in"
class="animate-fade-up"
```

## 📝 Convenciones de Texto

### Mensajes de Éxito

- "¡[Acción] con éxito!" (ej: "¡Partido registrado con éxito!")
- "Cambios guardados correctamente."

### Mensajes de Error

- "No se pudo [acción]. Por favor, intenta más tarde."
- "Error al [acción]: [detalles]"

### Labels de Campos

- Usar UPPERCASE para labels: `text-xs font-bold uppercase`
- Formato: "Nombre Campo" sin dos puntos
- Requeridos: "Nombre (Requerido)"

### Textos de Botones

- Acciones: "Cargar Partido", "Nuevo Jugador", "Guardar Cambios"
- Navegación: "Ver perfil", "Volver al inicio"
- Auth: "Ingresar", "Cerrar Sesión"

## 🔧 Utilidades

### Path Aliases

```typescript
@/components  → src/components
@/layouts     → src/layouts
@/lib         → src/lib
@/pages       → src/pages
```

### Componentes Reutilizables

- `Alert.astro` - Mensajes de alerta (success/error/warning/info)
- `Card.astro` - Cards básicas
- `PageHeader.astro` - Encabezados con botón de retroceso
- `SectionTitle.astro` - Títulos de sección
- `TableWrapper.astro` - Wrapper para tablas
- `Avatar.astro` - Avatares de usuario con iniciales

---

**Última actualización**: Enero 2026

**Nota**: Este documento debe mantenerse actualizado cuando se establezcan nuevos patrones o se modifiquen los existentes.
