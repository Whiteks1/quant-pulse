# AGENTS.md

## Project

Quant Pulse

## Source of truth

- docs/architecture-phases.es.md (fases: Pages + Knowledge → backend + Actions)
- docs/roadmap.es.md
- docs/feed-workflow.es.md
- docs/editorial-manual.es.md
- docs/scoring-system.es.md
- docs/priority-rules.es.md
- docs/category-taxonomy.es.md
- docs/canonical-json-format.es.md
- docs/signal-vs-noise.es.md
- docs/voice-summary-style.es.md
- config/approved-sources.yaml
- config/news.schema.json
- content/pulse.source.json (fuente editorial de Fase 1)
- public/data/pulse.json (feed estático servido en Pages; debe salir del pipeline)
- npm run validate:feed (comprobación mínima de consistencia editorial y de contrato)

## Rules

- Do not invent categories outside the taxonomy in `docs/category-taxonomy.es.md`.
- Do not output JSON that breaks the canonical format in `docs/canonical-json-format.es.md` and `config/news.schema.json`.
- Do not edit `public/data/pulse.json` manually if the same change belongs in `content/pulse.source.json`.
- Keep summaries readable aloud in Spanish when producing Spanish copy; the UI may stay in English until localized.
- Prefer primary and tier_1 sources per `config/approved-sources.yaml`.
- Treat signal vs noise as a first-class classification.
- Ask for a plan before large refactors.
- Prefer small, verifiable changes.

## Git workflow rules

- Always use the full repository workflow for any non-trivial change: `issue -> branch -> code -> validate -> commit -> push -> PR -> merge -> close issue`.
- Never leave substantive local changes directly on `main`.
- Never skip issue, branch, commit, push, and PR for repository work.
- If work starts on `main` by mistake, stop and move it to a branch before continuing.

## Phased delivery (summary)

1. **Fase 1:** `content/pulse.source.json` + build pipeline + GitHub Pages + `public/data/pulse.json` + Custom GPT Knowledge (listado en `docs/architecture-phases.es.md`). No backend, no GPT Actions, no OpenAI en el frontend.
2. **Fase 2:** Backend mínimo + OpenAPI + GPT Actions para datos vivos.
3. **Fase 3 (opcional):** chat u otras integraciones con API key solo en servidor.
