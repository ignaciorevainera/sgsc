# ⚽ SGSC | Solo Gente Súper Comprometida F.C.

![Astro](https://img.shields.io/badge/Astro-0C1524?style=for-the-badge&logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

![SGSC Hero Mockup](docs/mockups/hero-mockup.png)
*^ Espacio para imagen de portada o mockup en múltiples dispositivos (Desktop/Mobile) ^*

## 📖 Sobre el Proyecto

**SGSC** (Solo Gente Súper Comprometida) es una aplicación web integral diseñada para profesionalizar la gestión y el seguimiento estadístico de un grupo de fútbol amateur. 

Nacida para poner fin a las eternas discusiones sobre quién es el mejor jugador o cómo armar equipos parejos, SGSC transforma los típicos mensajes de WhatsApp en una plataforma completa que gamifica la experiencia de jugar al fútbol semanalmente. Registra partidos, calcula efectividades, otorga medallas por logros y utiliza algoritmos para crear partidos perfectamente balanceados.

---

## 🚀 Funcionalidades Principales

### 🏆 Ranking y Estadísticas Globales (Leaderboard)
La página principal de la competencia. Un ranking dinámico que ordena a los jugadores según sus Puntos, Partidos Jugados, Porcentaje de Victorias, Goles, etc.
* **Características:** Filtros por temporada (histórico vs año actual), cálculo automático de rendimiento y promedios del club.

![Mockup del Ranking](docs/mockups/ranking-mockup.png)
*^ Espacio para mockup de la tabla de posiciones (/ranking) ^*

### 👤 Perfiles de Jugador Estilo "Ficha Técnica"
Cada jugador tiene su propia página de perfil con estadísticas profundas, diseñada con un estilo premium que recuerda a los videojuegos de fútbol (como el Ultimate Team).
* **Características:** * Gráficos históricos de rendimiento (ApexCharts).
  * Estadísticas de "Mejor Socio" y "Némesis" (contra quién pierde más).
  * Análisis de rendimiento por color de camiseta (Claro vs Oscuro).
  * **Vitrina de Logros:** Sistema de medallas dinámicas por trayectoria, rachas de victorias ("On Fire 🔥") y fidelidad.

![Mockup del Perfil de Jugador](docs/mockups/player-profile-mockup.png)
*^ Espacio para mockup del perfil detallado de un jugador (/players/[id]) ^*

### ⚖️ Squad Builder (Armador de Equipos Inteligente)
La herramienta definitiva para el organizador. Se seleccionan los jugadores que asistirán al partido y el sistema genera automáticamente dos equipos equilibrados.
* **Características:** * Algoritmo *Greedy* basado en el Win Rate (%) histórico de cada jugador.
  * Inclusión de jugadores "Guest" (Invitados anónimos) de forma manual.
  * Interfaz optimizada para móviles con feedback táctil.
  * Botón para exportar directamente las formaciones a WhatsApp con un resumen de promedios.

![Mockup del Armador de Equipos](docs/mockups/squad-builder-mockup.png)
*^ Espacio para mockup de la vista de selección y el modal de resultado (/teams) ^*

### 🆚 Head-to-Head (Comparador de Jugadores)
¿Quién tiene mejores números? Una herramienta para comparar las estadísticas de dos jugadores frente a frente.
* **Características:** Comparativa visual de efectividad, puntos, partidos jugados y más, fomentando el "folclore" y la rivalidad sana del grupo.

![Mockup del Comparador](docs/mockups/compare-mockup.png)
*^ Espacio para mockup de la pantalla de comparación (/compare) ^*

### 🏟️ Historial de Partidos y Sedes
Un registro inmutable de todos los encuentros disputados.
* **Características:** Listado de partidos recientes, detalle de los equipos conformados, resultado final y las distintas canchas (sedes) donde se jugaron.

![Mockup de Partidos y Sedes](docs/mockups/matches-fields-mockup.png)
*^ Espacio para mockup de la lista de partidos (/matches) y canchas (/fields) ^*

### 🔒 Panel de Administración (Gestor)
Una sección privada y protegida por autenticación para mantener el sistema actualizado.
* **Características:** ABM (Alta, Baja y Modificación) de Jugadores, registro de nuevos Partidos (seleccionando quién jugó para qué equipo y el resultado), y gestión de Sedes.

![Mockup del Panel de Admin](docs/mockups/admin-panel-mockup.png)
*^ Espacio para mockup del dashboard de administración (/admin) ^*

---

*Desarrollado con ☕ y ⚽ para el SGSC.*