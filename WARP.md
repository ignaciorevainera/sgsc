# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an **Astro** minimal starter project (sgsc v0.0.1). Astro is a modern web framework optimized for building fast, content-focused websites.

## Architecture

### Core Concepts
- **File-based routing**: Pages in `src/pages/` automatically become routes based on their filename (e.g., `src/pages/index.astro` → `/`)
- **Astro components**: `.astro` files use Astro's component syntax with frontmatter for server-side logic and HTML-like templates for markup
- **Static assets**: Files in `public/` are served as-is at the root path
- **TypeScript**: Configured with strict mode via `astro/tsconfigs/strict`

### Project Structure
```
/
├── public/          # Static assets (favicon, images, etc.)
├── src/
│   └── pages/       # File-based routing - .astro or .md files become routes
└── dist/            # Build output (generated, not in git)
```

## Development Commands

**Prerequisites**: Install dependencies first with `npm install`

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server at `localhost:4321` with hot reload |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally before deploying |
| `npm run astro` | Run Astro CLI commands (e.g., `npm run astro add`, `npm run astro check`) |

## Key Configuration Files

- `astro.config.mjs`: Main Astro configuration
- `tsconfig.json`: TypeScript configuration (extends Astro's strict config)
- `.vscode/launch.json`: VSCode debugger configured to run dev server
- `.vscode/extensions.json`: Recommends `astro-build.astro-vscode` extension

## Development Notes

- The recommended VSCode extension is **astro-build.astro-vscode**
- Generated files (`.astro/` types, `dist/` build output, `node_modules/`) are gitignored
- Components can be placed in `src/components/` (not special to Astro but conventional)
- Environment variables go in `.env` files (gitignored)
