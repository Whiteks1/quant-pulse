# Quant Pulse — Flujo editorial de Fase 1

## Objetivo

Tener un flujo reproducible para publicar el feed sin convertir GitHub Pages en backend.

## Fuente de edición

La edición manual del feed debe hacerse en:

- `content/pulse.source.json`

Ese archivo es la fuente editorial de Fase 1.

El archivo publicado que consume la web es:

- `public/data/pulse.json`

Ese archivo no debe editarse a mano salvo reparación puntual.

## Flujo de publicación

1. editar `content/pulse.source.json`
2. ejecutar `npm run validate:feed`
3. ejecutar `npm run build:feed`
4. revisar cambios en `public/data/pulse.json`
5. ejecutar `npm test`
6. ejecutar `npm run build`
7. commit y push

## Regla operativa

Si `content/pulse.source.json` y `public/data/pulse.json` divergen, el repo está en estado inválido.

El comando:

- `npm run check:feed`

debe pasar antes de desplegar.

## Alcance de esta fase

Este flujo sigue siendo Fase 1:

- no hay backend
- no hay API dinámica
- no hay ingestión automática
- no hay GPT Actions obligatorias

Solo hay:

- fuente editorial
- script de build
- feed publicado estático
- frontend en GitHub Pages
