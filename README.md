# Quant Pulse — Signal Radar

SPA para explorar señales editoriales orientadas a research y riesgo para QuantLab. El scope principal es crypto, market structure y tecnología o macro solo cuando afectan infraestructura, seguridad o condiciones de mercado. Stack: React, TypeScript, Vite, Tailwind, shadcn/ui.

## Desarrollo

```bash
npm install
npm run dev
```

La app usa el puerto **8080** por defecto.

## GitHub Pages

El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) construye con `VITE_BASE_PATH=/quant-pulse/` y despliega en GitHub Pages.

1. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Haz push a `main`; la URL será `https://whiteks1.github.io/quant-pulse/`.

En local, `npm run build` usa base `/` (raíz). Para probar un build como en Pages: `VITE_BASE_PATH=/quant-pulse/ npm run build` y `npm run preview`.

## Datos del feed (Fase 1)

La arquitectura operativa de Fase 1 es:

`fuentes -> content/pulse.source.json -> build:feed -> public/data/pulse.json -> GitHub Pages -> GPT con Knowledge`

La app carga [`public/data/pulse.json`](public/data/pulse.json) en runtime (`fetch` con `BASE_URL`). Ese archivo es el artefacto publicado de Fase 1. La edición manual debe hacerse sobre [`content/pulse.source.json`](content/pulse.source.json), y después regenerar el feed con `npm run build:feed`. El feed publicado incluye trazabilidad editorial mínima (`sourceTier`, `linkType`, `scoreJustification`) y puede validarse con `npm run validate:feed`.

Además, Fase 1 ya publica archivo estático en:

- [`public/data/archive/current.json`](public/data/archive/current.json)
- [`public/data/archive/index.json`](public/data/archive/index.json)

Los snapshots congelados de edición se guardan en [`content/archive/editions/`](content/archive/editions/) y se publican con `npm run snapshot:edition` seguido de `npm run build:feed`.

El workflow de Pages comprueba además que el feed publicado esté sincronizado con la fuente editorial (`npm run check:feed`) antes del build.

## Documentación editorial

Ver [`AGENTS.md`](AGENTS.md), [`docs/quantlab-upstream-contract.es.md`](docs/quantlab-upstream-contract.es.md), [`docs/architecture-phases.es.md`](docs/architecture-phases.es.md), [`docs/roadmap.es.md`](docs/roadmap.es.md), [`docs/feed-workflow.es.md`](docs/feed-workflow.es.md) y el resto de [`docs/`](docs/).

## Workflow del repositorio

Regla obligatoria para trabajo asistido por Cursor/Codex:

`issue -> branch -> code -> validate -> commit -> push -> PR -> merge -> close issue`

No se deben dejar cambios sustantivos directamente sobre `main`. Si un cambio empezó en `main` por error, debe moverse a una rama antes de continuar.

## Scripts

| Script        | Descripción        |
| ------------- | ------------------ |
| `npm run dev` | Servidor Vite      |
| `npm run build` | Build producción |
| `npm run build:feed` | Genera `public/data/pulse.json` desde `content/pulse.source.json` |
| `npm run check:feed` | Falla si el feed publicado no coincide con la fuente editorial |
| `npm run snapshot:edition` | Congela la edición actual en `content/archive/editions/` |
| `npm run lint`  | ESLint           |
| `npm test`      | Vitest           |
| `npm run validate:feed` | Valida `content/pulse.source.json` contra contrato, integridad editorial y reglas del feed |
| `npm run test:e2e` | Playwright    |
