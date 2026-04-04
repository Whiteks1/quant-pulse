# Quant Pulse — Signal Radar

SPA para explorar señales editoriales (tech, crypto, macro) con datos de ejemplo. Stack: React, TypeScript, Vite, Tailwind, shadcn/ui.

## Desarrollo

```bash
npm install
npm run dev
```

La app usa el puerto **8080** por defecto.

## GitHub Pages

El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) construye con `VITE_BASE_PATH` apuntando al nombre del repositorio y despliega en GitHub Pages.

1. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Haz push a `main`; la URL será `https://<usuario>.github.io/<nombre-del-repo>/`.

En local, `npm run build` usa base `/` (raíz). Para probar un build como en Pages: `VITE_BASE_PATH=/<nombre-repo>/ npm run build` y `npm run preview`.

## Datos del feed (Fase 1)

La arquitectura operativa de Fase 1 es:

`fuentes -> content/pulse.source.json -> build:feed -> public/data/pulse.json -> GitHub Pages -> GPT con Knowledge`

La app carga [`public/data/pulse.json`](public/data/pulse.json) en runtime (`fetch` con `BASE_URL`). Ese archivo es el artefacto publicado de Fase 1. La edición manual debe hacerse sobre [`content/pulse.source.json`](content/pulse.source.json), y después regenerar el feed con `npm run build:feed`.

El workflow de Pages comprueba además que el feed publicado esté sincronizado con la fuente editorial (`npm run check:feed`) antes del build.

## Documentación editorial

Ver [`AGENTS.md`](AGENTS.md), [`docs/architecture-phases.es.md`](docs/architecture-phases.es.md), [`docs/feed-workflow.es.md`](docs/feed-workflow.es.md) y el resto de [`docs/`](docs/).

## Scripts

| Script        | Descripción        |
| ------------- | ------------------ |
| `npm run dev` | Servidor Vite      |
| `npm run build` | Build producción |
| `npm run build:feed` | Genera `public/data/pulse.json` desde `content/pulse.source.json` |
| `npm run check:feed` | Falla si el feed publicado no coincide con la fuente editorial |
| `npm run lint`  | ESLint           |
| `npm test`      | Vitest           |
| `npm run validate:feed` | Valida la estructura base de `content/pulse.source.json` |
| `npm run test:e2e` | Playwright    |
