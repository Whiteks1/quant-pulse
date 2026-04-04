# Quant Pulse — Arquitectura por fases

Documento operativo para humanos, Cursor y Codex. Resume la estrategia acordada: primero conocimiento estático, después API y Actions.

## Fase 1 (ahora)

- **GitHub Pages** como frontend estático.
- **Datos en el repo**: el feed publicado vive en `public/data/pulse.json` (se copia tal cual a `dist/` en el build). El pipeline editorial puede **sustituir o generar** ese archivo en commits.
- **Custom GPT con Knowledge** (sin backend ni Actions todavía). Subir al GPT:
  - `AGENTS.md`
  - `docs/editorial-manual.es.md`
  - `docs/scoring-system.es.md`
  - `docs/priority-rules.es.md`
  - `docs/category-taxonomy.es.md`
  - `docs/canonical-json-format.es.md`
  - `docs/signal-vs-noise.es.md`
  - `docs/voice-summary-style.es.md`
  - `config/approved-sources.yaml`

**Objetivo:** el GPT aplica las reglas editoriales de Quant Pulse; la web lee el JSON estático vía `fetch` usando `import.meta.env.BASE_URL` (correcto bajo subpath en Pages).

**No en esta fase:** chat embebido en la web, llamadas a OpenAI desde el navegador, Custom GPT Actions sin servidor.

## Fase 2 (después)

- **Backend mínimo** (worker, serverless, etc.) que sirva JSON con contrato estable.
- Endpoints orientativos: `latest-news`, `top-signals`, `storyline`, `watchlist`, `search-archive`.
- **Custom GPT Actions** con esquema OpenAPI apuntando a ese backend.

## Fase 3 (opcional, más tarde)

- Chat u otras integraciones que requieran **clave de API solo en servidor**.

## URL del JSON en Pages

Con repositorio `nombre-repo` y usuario `usuario`:

`https://usuario.github.io/nombre-repo/data/pulse.json`

También accesible en el árbol del repo: `public/data/pulse.json`.

## Instrucción corta para agentes

Primero GPT con conocimiento interno y `pulse.json` en repo. Después GPT con Actions y backend. No invertir el orden.
