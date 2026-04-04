# Quant Pulse — Signal Radar

SPA para explorar señales editoriales (tech, crypto, macro) con datos de ejemplo. Stack: React, TypeScript, Vite, Tailwind, shadcn/ui.

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

La app carga [`public/data/pulse.json`](public/data/pulse.json) en runtime (`fetch` con `BASE_URL`). Un pipeline o edición manual puede actualizar ese archivo; en GitHub Pages queda público en `/data/pulse.json` bajo el subpath del repo. El feed incluye ahora trazabilidad editorial mínima (`sourceTier`, `linkType`, `scoreJustification`) y puede validarse con `npm run validate:feed`.

## Documentación editorial

Ver [`AGENTS.md`](AGENTS.md), [`docs/architecture-phases.es.md`](docs/architecture-phases.es.md), [`docs/roadmap.es.md`](docs/roadmap.es.md) y el resto de [`docs/`](docs/).

## Scripts

| Script        | Descripción        |
| ------------- | ------------------ |
| `npm run dev` | Servidor Vite      |
| `npm run build` | Build producción |
| `npm run lint`  | ESLint           |
| `npm test`      | Vitest           |
| `npm run validate:feed` | Valida consistencia editorial del feed |
| `npm run test:e2e` | Playwright    |
