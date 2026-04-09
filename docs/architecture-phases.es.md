# Quant Pulse — Arquitectura por fases

Documento operativo para humanos, Cursor y Codex. Resume la estrategia acordada: primero feed estático generado por pipeline y consumido por la web; después backend mínimo y, solo cuando esa frontera sea estable, Actions. Quant Pulse actúa como capa upstream de señales para QuantLab y no debe absorber lógica de trading, backtesting o ejecución.

## Fase 1 (ahora)

- **GitHub Pages** como frontend estático.
- **Datos en el repo**: la fuente editorial vive en `content/pulse.source.json` y el feed publicado se genera en `public/data/pulse.json` (se copia tal cual a `dist/` en el build).
- **Pipeline editorial**: una tarea o script genera/actualiza `public/data/pulse.json` a partir de la fuente editorial, validación y criterio editorial. El GPT no publica.
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

**Objetivo:** el pipeline produce el feed desde una fuente reproducible, la web lo lee desde Pages y el GPT aplica las reglas editoriales de Quant Pulse sobre ese contenido para priorizar señales y generar handoffs disciplinados hacia QuantLab cuando proceda.

**No en esta fase:** backend propio, endpoints dinámicos, chat embebido en la web, llamadas a OpenAI desde el navegador, Custom GPT Actions sin servidor.

**Regla de interpretación:** si una señal no puede traducirse de forma plausible a research, riesgo o prioridad de producto para QuantLab, debe permanecer como contexto y no como handoff downstream.

## Fase 2 (baseline mínima ya implementada)

- **Backend mínimo** que sirve JSON con contrato estable para `pulse` y `archive`.
- La frontera mínima de Fase 2 se define en [`docs/live-feed-api-contract.es.md`](live-feed-api-contract.es.md) y ya existe en `main`.
- El repo ya tiene:
  - `GET /v1/pulse/current`
  - `GET /v1/archive/index`
  - `GET /v1/archive/editions/{editionSlug}`
  - adaptador frontend con fallback estático explícito
  - smoke/E2E de modo API
  - persistencia local del histórico vía `content/archive/editions/`
- **Custom GPT Actions** siguen fuera hasta que esta frontera viva se considere suficientemente madura y útil operativamente.

**Lo que todavía no resuelve Fase 2:** ingestión automática real, scoring automático, búsqueda viva, alertas operativas, endpoints adicionales o lógica downstream para QuantLab.

## Fase 3 (opcional, más tarde)

- Chat u otras integraciones que requieran **clave de API solo en servidor**.

## URL del JSON en Pages

Con repositorio `nombre-repo` y usuario `usuario`:

`https://usuario.github.io/nombre-repo/data/pulse.json`

También accesible en el árbol del repo: `public/data/pulse.json`.

## Instrucción corta para agentes

Primero `content/pulse.source.json` + pipeline + `pulse.json` + Pages + GPT con Knowledge. La frontera mínima de backend ya existe; no saltar ahora a más endpoints ni a GPT Actions antes de justificar el siguiente beneficio real.
