# Quant Pulse Analyst — Knowledge Roadmap

## Purpose

This document defines the target Knowledge architecture for Quant Pulse Analyst.

It has two layers:

1. current canonical Knowledge available in the repository today
2. target Knowledge structure to build over time

The goal is to keep the GPT aligned with the real repository while also guiding the documentation roadmap required for a stronger editorial engine.

## 1. Current canonical Knowledge

Current canonical language: Spanish

Current canonical files:

- `AGENTS.md`
- `docs/quantlab-upstream-contract.es.md`
- `docs/quantlab-signal-intent-format.es.md`
- `docs/architecture-phases.es.md`
- `docs/canonical-json-format.es.md`
- `docs/category-taxonomy.es.md`
- `docs/editorial-manual.es.md`
- `docs/feed-workflow.es.md`
- `docs/priority-rules.es.md`
- `docs/roadmap.es.md`
- `docs/scoring-system.es.md`
- `docs/signal-vs-noise.es.md`
- `docs/voice-summary-style.es.md`
- `config/news.schema.json`
- `config/approved-sources.yaml`
- `public/data/pulse.json`

Optional operational reference:

- `content/pulse.source.json`

These files define the current operational GPT Knowledge pack.

Preferred current upload order:

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

## 2. Target Knowledge architecture

Target canonical language: English

Transition rule:

- until the English docs exist and are explicitly adopted as canonical, the Spanish docs remain authoritative
- future English docs must not be treated as authoritative before that migration is complete

### Governance

- `AGENTS.md`

### Editorial rules

- `docs/editorial-manual.md`
- `docs/scoring-system.md`
- `docs/priority-rules-p1-p2-p3.md`
- `docs/signal-vs-noise.md`
- `docs/voice-summary-style.md`
- `docs/taxonomy.md`

### System architecture / roadmap / workflow

- `docs/architecture-phases.md`
- `docs/roadmap.md`
- `docs/feed-workflow.md`

### Canonical data contract

- `docs/canonical-json-format.md`
- `docs/feed-schema.json`
- `config/news.schema.json`

### Source policy

- `config/approved-sources.yaml`

### Operational source data

- `content/pulse.source.json`
- `public/data/pulse.json`

## 3. Gap between current and target state

Target files that do not exist yet:

- `docs/editorial-manual.md`
- `docs/scoring-system.md`
- `docs/priority-rules-p1-p2-p3.md`
- `docs/signal-vs-noise.md`
- `docs/voice-summary-style.md`
- `docs/taxonomy.md`
- `docs/architecture-phases.md`
- `docs/roadmap.md`
- `docs/feed-workflow.md`
- `docs/canonical-json-format.md`
- `docs/feed-schema.json`

Current repository gap:

- the editorial and governance canon is still Spanish-first
- the future English canonical pack is not implemented yet
- the GPT can be loaded accurately today, but the stronger future Knowledge architecture still needs dedicated document creation slices

## 4. Recommended creation order

### Phase A — editorial intelligence layer

1. `docs/editorial-manual.md`
2. `docs/scoring-system.md`
3. `docs/priority-rules-p1-p2-p3.md`
4. `docs/signal-vs-noise.md`
5. `docs/taxonomy.md`
6. `docs/voice-summary-style.md`

### Phase B — English canonical migration

7. `docs/architecture-phases.md`
8. `docs/roadmap.md`
9. `docs/feed-workflow.md`

### Phase C — contract hardening

10. `docs/canonical-json-format.md`
11. `docs/feed-schema.json`

## 5. Conflict resolution rules

### Current repository state

1. runtime contract actually enforced in code
2. `config/news.schema.json`
3. `AGENTS.md`
4. canonical Spanish docs
5. operational data files

### Target repository state

1. runtime contract actually enforced in code
2. runtime schema and canonical contract docs
3. `AGENTS.md`
4. canonical English docs
5. operational data files

## 6. Knowledge upload rule

### Today

Upload only files that actually exist and belong to the current canonical pack.

### Later

When the target English docs are created and explicitly adopted, replace the current pack gradually instead of mixing contradictory documentation layers.

Do not present future documents as if they already exist.

## 7. One-line role definition

Quant Pulse Analyst is the editorial engine that helps produce, validate, and interpret the public Quant Pulse feed.
