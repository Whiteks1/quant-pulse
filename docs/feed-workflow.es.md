# Quant Pulse — Flujo editorial de Fase 1

## Objetivo

Tener un flujo reproducible para publicar el feed sin convertir GitHub Pages en backend.

## Fuente de edición

La edición manual del feed debe hacerse en:

- `content/pulse.source.json`

Ese archivo es la fuente editorial de Fase 1.

El archivo publicado que consume la web es:

- `public/data/pulse.json`

El artefacto downstream publicado para QuantLab es:

- `public/data/intents.json`

Esos archivos publicados no deben editarse a mano salvo reparación puntual.

## Flujo de publicación

1. editar `content/pulse.source.json`
2. ejecutar `npm run validate:feed`
3. ejecutar `npm run build:feed`
4. revisar cambios en:
   - `public/data/pulse.json`
   - `public/data/intents.json`
   - `public/data/archive/current.json`
   - `public/data/archive/index.json`
   - `public/data/archive/deltas/`
5. ejecutar `npm test`
6. ejecutar `npm run build`
7. commit y push

## Checklist editorial mínima

Antes de publicar una edición:

- `executiveBrief` debe seleccionar historias, no repetir `itemId`
- cada `watchItem` debe respetar la taxonomía `section` / `category`
- `sourceTier` debe ser coherente con la fuente aprobada cuando exista una coincidencia explícita
- `signalVsNoise`, `priority` y `relevanceScore` no deben contradecirse sin `editorialOverride`

## Congelar una edición

Si una edición debe quedar archivada como snapshot estático de Fase 1:

1. verificar que `pulse.source.json` ya representa la edición publicada
2. ejecutar `npm run snapshot:edition`
3. ejecutar `npm run build:feed`
4. revisar `public/data/archive/editions/`
5. revisar `public/data/archive/deltas/`
6. commit y push

## Regla operativa

Si `content/pulse.source.json` y `public/data/pulse.json` divergen, el repo está en estado inválido.

Si `public/data/intents.json` no refleja la misma edición fuente y el mismo bundle editorial normalizado, el repo también está en estado inválido.

El comando:

- `npm run check:feed`

debe pasar antes de desplegar.

Además, el manifiesto de archivo estático en `public/data/archive/` debe quedar sincronizado con:

- la edición actual
- los snapshots congelados en `content/archive/editions/`
- los artefactos delta publicados en `public/data/archive/deltas/`

Y el artefacto:

- `public/data/intents.json`

debe quedar sincronizado con:

- la edición actual de `content/pulse.source.json`
- el bundle normalizado que produce `public/data/pulse.json`

## Alcance de esta fase

Este flujo sigue siendo Fase 1:

- no hay backend
- no hay API dinámica
- no hay ingestión automática
- no hay GPT Actions obligatorias

Solo hay:

- fuente editorial
- script de build
- manifiesto de archivo estático
- artefactos delta de seguimiento entre snapshots reales
- feed publicado estático
- artefacto estático de intents para handoff downstream
- frontend en GitHub Pages
