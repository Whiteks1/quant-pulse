# Quant Pulse — Signal Radar

Quant Pulse es la capa upstream de señales para QuantLab. Su trabajo es detectar, filtrar, priorizar, resumir, alertar y archivar señales con relevancia de mercado para acelerar el paso entre evento, comprensión, priorización e intención de research.

No es un motor de trading, no reemplaza el research de QuantLab y no debe ampliarse a cobertura generalista. El scope primario es crypto y market structure; tecnología y macro solo entran cuando cambian infraestructura, seguridad, riesgo operativo o condiciones de mercado relevantes para QuantLab. Stack: React, TypeScript, Vite, Tailwind, shadcn/ui.

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

El workflow de Pages comprueba además que el feed publicado esté sincronizado con la fuente editorial (`npm run check:feed`) antes del build.

## Documentación editorial

Ver [`AGENTS.md`](AGENTS.md), [`docs/quantlab-upstream-contract.es.md`](docs/quantlab-upstream-contract.es.md), [`docs/architecture-phases.es.md`](docs/architecture-phases.es.md), [`docs/live-feed-api-contract.es.md`](docs/live-feed-api-contract.es.md), [`docs/roadmap.es.md`](docs/roadmap.es.md), [`docs/feed-workflow.es.md`](docs/feed-workflow.es.md) y el resto de [`docs/`](docs/).

La guía de marca pública vive en [`docs/brand-guidelines.md`](docs/brand-guidelines.md).

## Licencia

Este repositorio se distribuye bajo [`Apache-2.0`](LICENSE).

## Workflow del repositorio

Regla obligatoria para trabajo asistido por Cursor/Codex:

`issue -> branch -> code -> validate -> commit -> push -> PR -> merge -> close issue`

No se deben dejar cambios sustantivos directamente sobre `main`. Si un cambio empezó en `main` por error, debe moverse a una rama antes de continuar. Las reglas operativas de branching, worktrees, staging y validación previa viven en [`AGENTS.md`](AGENTS.md).

Los PRs contra `main` ejecutan validación automática en GitHub Actions antes del merge.
La guía operativa para remoto canónico y protección esperada de `main` vive en [`.agents/repo-hygiene.md`](.agents/repo-hygiene.md).

## Scripts

| Script        | Descripción        |
| ------------- | ------------------ |
| `npm run dev` | Servidor Vite      |
| `npm run build` | Build producción |
| `npm run build:feed` | Genera `public/data/pulse.json` desde `content/pulse.source.json` |
| `npm run check:feed` | Falla si el feed publicado no coincide con la fuente editorial |
| `npm run lint`  | ESLint           |
| `npm test`      | Vitest           |
| `npm run validate:feed` | Valida `content/pulse.source.json` con las reglas editoriales del feed |
| `npm run test:e2e` | Playwright    |
