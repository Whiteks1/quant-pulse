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

## Documentación editorial

Ver [`AGENTS.md`](AGENTS.md) y la carpeta [`docs/`](docs/).

## Scripts

| Script        | Descripción        |
| ------------- | ------------------ |
| `npm run dev` | Servidor Vite      |
| `npm run build` | Build producción |
| `npm run lint`  | ESLint           |
| `npm test`      | Vitest           |
| `npm run test:e2e` | Playwright    |
