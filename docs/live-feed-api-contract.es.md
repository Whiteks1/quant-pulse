# Quant Pulse — Contrato mínimo de API viva (Fase 2)

## Objetivo

Definir el slice mínimo de contrato necesario para pasar de un feed estático publicado en `public/data/` a una frontera backend viva, sin ampliar Quant Pulse hacia ejecución, lógica downstream de QuantLab ni automatización prematura de ingestión.

Este documento define **target state de Fase 2**, no comportamiento ya implementado. La autoridad presente sigue siendo el runtime actual de Fase 1 y sus artefactos publicados.

## Principio rector

La API de Fase 2 debe sustituir la dependencia directa del frontend sobre JSON editado/publicado en el repo, pero **sin cambiar todavía la forma canónica de los bundles** que la app ya consume.

La transición correcta es:

`misma semántica de payload -> nueva frontera backend -> misma app -> fallback estático controlado mientras la transición madura`

## No objetivos de este slice

- no definir GPT Actions todavía
- no añadir autenticación ni escritura remota
- no absorber lógica de QuantLab
- no añadir endpoints de trading, backtesting o ejecución
- no abrir todavía ingestión automática, scoring automatizado ni búsqueda avanzada
- no rediseñar el frontend para una API más ancha de la necesaria

## Endpoints mínimos

La API mínima de Fase 2 debe empezar con **tres endpoints GET**:

### 1. `GET /v1/pulse/current`

Devuelve el bundle vivo equivalente al payload hoy servido desde:

- `public/data/pulse.json`

Contrato esperado:

- misma forma top-level que `PulseBundle`
- `version`
- `updatedAt`
- `items`
- `executiveBrief`
- `watchItems`

Regla:

El frontend no debe necesitar una transformación conceptual nueva para consumir este endpoint.

### 2. `GET /v1/archive/index`

Devuelve el manifiesto vivo equivalente al payload hoy servido desde:

- `public/data/archive/index.json`

Contrato esperado:

- misma forma top-level que `ArchiveIndex`
- `generatedAt`
- `currentEditionSlug`
- `editions`

Regla:

La semántica de edición actual (`slug`, `label`, `updatedAt`, `version`, `path`, `isCurrent`, `totalItems`, `signalCount`, `p1Count`) debe mantenerse.

### 3. `GET /v1/archive/editions/{editionSlug}`

Devuelve el bundle de una edición concreta del archive.

Equivalencia conceptual con Fase 1:

- `public/data/archive/current.json`
- `public/data/archive/editions/{slug}.json`

Regla:

El payload de cada edición debe seguir siendo equivalente a `PulseBundle`.

## Lo que permanece estático al inicio

Aunque exista backend mínimo, este slice **no obliga** a retirar inmediatamente:

- `content/pulse.source.json`
- `content/archive/editions/`
- `public/data/pulse.json`
- `public/data/archive/`

Durante la transición inicial:

- el backend puede seguir ensamblando datos desde la misma fuente editorial reproducible
- los artefactos estáticos publicados pueden mantenerse como fallback operativo
- la app puede convivir temporalmente con modo API y modo estático mientras se valida la nueva frontera

## Responsabilidades por capa

### Backend mínimo

Debe ser dueño de:

- servir el contrato vivo estable
- validar el payload antes de exponerlo
- ensamblar `pulse` y `archive` desde una única ruta de responsabilidad
- resolver la edición actual y el manifiesto de archive
- devolver errores HTTP coherentes cuando falte una edición o el bundle no pueda generarse

No debe ser dueño todavía de:

- decisiones editoriales autónomas
- scoring automatizado complejo
- lógica downstream de research para QuantLab
- ejecución, trading o coordinación operativa externa

### Frontend

Debe seguir siendo dueño de:

- carga
- render
- estados degradados
- validación runtime defensiva del subconjunto crítico

No debe convertirse en:

- capa de ensamblaje del feed vivo
- fuente de verdad del manifiesto de archive
- lugar donde se redefina la semántica del bundle

## Compatibilidad esperada

Mientras esta fase madura:

- `PulseBundle` sigue siendo la forma canónica para `current` y para cada edición del archive
- `ArchiveIndex` sigue siendo la forma canónica del manifiesto
- el cliente debe poder cambiar de estático a vivo con una capa adaptadora pequeña, no con una reescritura del modelo

## Errores mínimos esperados

Este slice no necesita todavía un envelope sofisticado de errores.

Basta con una disciplina mínima:

- `200` cuando el recurso existe y valida
- `404` cuando la edición pedida no existe
- `500` o `503` cuando el backend no puede construir o servir el bundle

Regla:

No diseñar aún una taxonomía compleja de errores si el frontend actual solo necesita distinguir entre carga correcta y carga fallida.

## Qué no entra todavía como endpoint

Quedan fuera de este contrato mínimo:

- `search-archive`
- `storyline`
- `watchlist` como endpoint separado
- `top-signals`
- endpoints para research intents
- endpoints para alerting
- endpoints de administración/editorial

Motivo:

Todo eso puede llegar después, pero no es necesario para cruzar la frontera mínima de Fase 2 sin romper el contrato presente.

## Secuencia correcta de implementación

1. definir este contrato mínimo
2. implementar el servicio o worker más pequeño que pueda servirlo
3. centralizar validación y ensamblaje en backend
4. persistir archive fuera de edición manual directa de `public/data/`
5. añadir adaptador frontend con fallback estático explícito
6. validar con E2E/smoke tests en modo API

## Regla final

Fase 2 no debe empezar por “más endpoints”.

Debe empezar por:

- el **mismo contrato esencial**
- servido desde una frontera backend mínima
- con menos fragilidad operativa
- y sin violar la separación Quant Pulse -> QuantLab
