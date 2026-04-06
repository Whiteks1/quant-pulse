# Quant Pulse Analyst — Current Knowledge Pack

## Purpose

This document defines the current GPT Knowledge pack for Quant Pulse Analyst based only on files that exist in the repository today.

Use it as the operational upload guide for the GPT in the current Phase 1 architecture.

## Current canonical language

Spanish.

Transition note:

- the UI may remain in English for now
- the editorial and governance layer is currently canonical in Spanish
- if the GPT answers in Spanish, it should preserve the editorial tone and read-aloud quality described in the current Spanish docs

## Current canonical Knowledge

### Governance

- `AGENTS.md`
- `docs/quantlab-upstream-contract.es.md`
- `docs/quantlab-signal-intent-format.es.md`

### Editorial rules

- `docs/editorial-manual.es.md`
- `docs/scoring-system.es.md`
- `docs/priority-rules.es.md`
- `docs/signal-vs-noise.es.md`
- `docs/voice-summary-style.es.md`
- `docs/category-taxonomy.es.md`

### System architecture / roadmap / workflow

- `docs/architecture-phases.es.md`
- `docs/roadmap.es.md`
- `docs/feed-workflow.es.md`

### Canonical data contract

- `docs/canonical-json-format.es.md`
- `config/news.schema.json`

### Source policy

- `config/approved-sources.yaml`

### Operational source data

- `public/data/pulse.json`

Optional operational reference:

- `content/pulse.source.json`

## Current upload priority

1. `AGENTS.md`
2. `docs/quantlab-upstream-contract.es.md`
3. `docs/quantlab-signal-intent-format.es.md`
4. `docs/editorial-manual.es.md`
5. `docs/scoring-system.es.md`
6. `docs/priority-rules.es.md`
7. `docs/category-taxonomy.es.md`
8. `docs/signal-vs-noise.es.md`
9. `docs/canonical-json-format.es.md`
10. `docs/voice-summary-style.es.md`
11. `docs/feed-workflow.es.md`
12. `config/approved-sources.yaml`
13. `config/news.schema.json`
14. `docs/architecture-phases.es.md`
15. `docs/roadmap.es.md`
16. `public/data/pulse.json`

## Current conflict resolution rule

If there is a conflict, resolve in this order:

1. runtime contract actually enforced by the repository
2. `AGENTS.md`
3. `docs/quantlab-upstream-contract.es.md`
4. `docs/quantlab-signal-intent-format.es.md`
5. `config/news.schema.json`
6. canonical Spanish docs in `docs/*.es.md`
7. operational data files

## Knowledge upload rule

Upload only files that actually exist.

Do not present future documents as if they already exist.

Do not treat operational feed data as higher authority than governance, schema, or canonical docs.

Prefer `public/data/pulse.json` over `content/pulse.source.json` when the goal is to give the GPT the currently published state of the system.

## Exclude from the current primary pack

- UI component files
- build files
- generated artifacts outside the current operational feed
- future English docs that do not exist yet
- non-authoritative duplicates if they appear later
- `README.md` unless a narrower product framing gap requires it

## One-line role definition

Quant Pulse Analyst is the upstream editorial signal layer that helps produce and interpret the public Quant Pulse feed for QuantLab.
