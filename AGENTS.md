# AGENTS.md

## Project

Quant Pulse

## Source of truth

- docs/editorial-manual.es.md
- docs/scoring-system.es.md
- docs/priority-rules.es.md
- docs/category-taxonomy.es.md
- docs/canonical-json-format.es.md
- docs/signal-vs-noise.es.md
- docs/voice-summary-style.es.md
- config/approved-sources.yaml
- config/news.schema.json

## Rules

- Do not invent categories outside the taxonomy in `docs/category-taxonomy.es.md`.
- Do not output JSON that breaks the canonical format in `docs/canonical-json-format.es.md` and `config/news.schema.json`.
- Keep summaries readable aloud in Spanish when producing Spanish copy; the UI may stay in English until localized.
- Prefer primary and tier_1 sources per `config/approved-sources.yaml`.
- Treat signal vs noise as a first-class classification.
- Ask for a plan before large refactors.
- Prefer small, verifiable changes.
