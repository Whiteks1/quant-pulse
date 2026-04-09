# Quant Pulse — Roadmap operativo

## 1. Qué se pretende construir

Quant Pulse no pretende ser un simple agregador de noticias.

El repositorio apunta a construir una capa upstream de inteligencia de señales para QuantLab. Su output solo importa cuando puede traducirse en research, validación, filtros de riesgo o prioridades de producto. El scope primario es:

- Crypto & Markets
- estructura de mercado Web3
- riesgo de execution venues y broker rails
- Technology solo cuando afecte infra, seguridad o market structure
- Macro solo cuando afecte materialmente a crypto o tecnología

La intención del producto está muy clara en la documentación del repo:

- `docs/editorial-manual.es.md`: define misión, tono y reglas de publicación
- `docs/scoring-system.es.md`: define relevancia 0–100
- `docs/priority-rules.es.md`: define P1/P2/P3
- `docs/category-taxonomy.es.md`: define sección, categoría y etiquetas
- `docs/canonical-json-format.es.md`: define el contrato de noticia
- `docs/architecture-phases.es.md`: define el orden correcto de evolución del sistema

## 2. Estado actual del proyecto

### Producto ya implementado

- frontend estático en React + Vite + Tailwind + shadcn/ui
- despliegue en GitHub Pages
- carga del feed desde `public/data/pulse.json`
- backend mínimo para `pulse` y `archive` con contrato vivo estable
- adaptador frontend con fallback estático explícito
- dashboard ligero de instrumentación editorial en home
- archivo navegable con ruta dedicada y filtros por edición/facetas
- comparativa entre ediciones en archive
- manifiesto de archivo estático en `public/data/archive/`
- histórico persistido en `content/archive/editions/`
- artefacto downstream `public/data/intents.json`
- smoke/E2E para home, archive, estados degradados, payload inválido y modo API
- estructura visual para:
  - Hero
  - Pulse Dashboard
  - Executive Brief
  - Featured Stories
  - Technology
  - Crypto & Markets
  - Macro
  - Signal vs Noise
  - What to Watch
  - Archive Preview
- imágenes editoriales opcionales en cards destacadas
- cards endurecidas con score, source tier y rationale editorial visible
- página pública de privacidad para preparación del GPT

### Capa editorial ya definida

- manual editorial
- scoring
- prioridad
- taxonomía
- contrato JSON
- lista de fuentes aprobadas

### Lo que todavía no existe

- pipeline real de ingesta
- normalización automática de fuentes
- deduplicación automática
- scoring automático
- generación automática de `pulse.json` desde ingestión viva
- búsqueda real
- endpoints vivos adicionales más allá del baseline mínimo
- GPT Actions útiles sobre datos vivos
- alertas operativas

## 3. Diagnóstico

El repo está bien orientado conceptualmente.

La carpeta ya no es solo una landing: es un frontend funcional de Fase 1 con documentación editorial seria, contrato de datos explícito y una estructura clara para evolucionar.

Pero sigue habiendo una distancia importante entre:

- la visión del producto
- la protección operativa del frontend
- y la automatización real del sistema

Hoy Quant Pulse es, esencialmente:

- una superficie editorial-producto ya bastante instrumental
- alimentada por un feed manual o semi-manual
- con reglas editoriales muy trabajadas
- con archivo e intención downstream hacia QuantLab más explícitos

Todavía no es:

- un radar operativo automatizado
- ni un motor de señales con pipeline end-to-end

### Fortalezas actuales

- pipeline editorial y publicación estática bien definidos
- contrato upstream `Quant Pulse -> QuantLab` más explícito
- frontend más útil para lectura, priorización y comparación
- baseline mínimo de Fase 2 ya implementado sin romper el contrato canónico del feed
- cobertura funcional y smoke mucho más amplia que en la fase inicial

### Gaps operativos principales

- histórico todavía con poca masa crítica publicada
- la ingesta, deduplicación y scoring siguen siendo manuales o semi-manuales
- todavía no existe un uso operativo real de GPT Actions sobre datos vivos
- falta decidir el siguiente paso rentable tras el baseline mínimo de backend

## 4. Principio rector del roadmap

No conviene saltar directamente a GPT Actions, chat embebido o backend complejo.

El orden correcto, según el estado del repo y su propia documentación, es:

1. blindar la confiabilidad de Fase 1
2. cerrar deuda de gobernanza del repo
3. explotar mejor el archivo como producto
4. introducir backend mínimo
5. automatizar la ingesta y el scoring
6. activar Actions solo cuando exista un caso útil y estable

## 5. Roadmap propuesto

## Fase 1A — Reliability hardening

### Objetivo

Hacer que la web sea difícil de romper y que el consumidor frontend esté a la altura del contrato editorial.

### Trabajo

- añadir E2E reales para:
  - filtros
  - búsqueda
  - archive
  - comparación entre ediciones
  - fallos de carga
  - compatibilidad con `BASE_URL`
- introducir validación runtime del subconjunto crítico del feed en cliente
- mejorar fallbacks y estados degradados cuando el payload llegue roto o parcial
- seguir manteniendo `public/data/pulse.json` y `public/data/archive/` sincronizados con la fuente editorial

### Entregables

- home y archive cubiertos por tests funcionales reales
- carga del feed más robusta en cliente
- UX más resistente a drift o corrupción parcial

### Criterio de salida

La app deja de depender solo del “happy path” y resiste escenarios reales sin romper la experiencia completa.

## Fase 1B — Repo governance cleanup

### Objetivo

Cerrar la deuda interna del repositorio para que la fuente de verdad y las ramas vivas queden claras.

### Trabajo

- decidir explícitamente qué hacer con la rama heredada y cualquier trabajo no integrado
- separar lo rescatable en slices limpias
- descartar o congelar lo que ya no forma parte del plan actual
- documentar mejor qué está vivo, qué está congelado y qué es material histórico

### Entregables

- repositorio con menos ambigüedad operativa
- ramas y trabajo heredado ya clasificados
- mejor trazabilidad entre roadmap, docs y estado real del repo

### Criterio de salida

La gobernanza del repo deja de depender de memoria oral o ramas colgantes.

## Fase 1C — Archive as product

### Objetivo

Convertir el histórico en valor visible, no solo en infraestructura preparada.

### Trabajo

- publicar más snapshots reales
- hacer más visibles los deltas entre ediciones
- añadir lectura editorial útil de “qué cambió y por qué importa”
- reforzar el archivo como superficie de continuidad, no solo navegación

### Entregables

- archivo con más masa crítica de ediciones
- comparativas más útiles para seguimiento recurrente
- mayor valor visible del histórico

### Criterio de salida

El archive deja de sentirse como promesa de sistema y pasa a ser una capacidad clara del producto.

## Fase 2 — Backend mínimo y feed vivo

### Objetivo

Separar contenido y frontend, y dejar de depender progresivamente de edición manual directa del JSON.

### Trabajo

- crear backend mínimo o worker
- exponer endpoints estables para datos vivos
- centralizar validación del contrato
- introducir persistencia básica para histórico
- preparar la frontera para intents downstream sin tocar todavía ejecución

### Entregables

- API mínima funcional
- generación del feed desde proceso automatizado
- archivo histórico persistente

### Criterio de salida

La web ya no depende de edición manual directa de `public/data/pulse.json`.

### Estado

El baseline mínimo de esta fase ya está implementado en `main`. Lo que queda pendiente ya no es "tener API", sino decidir si merece ampliar esa frontera más allá de:

- `GET /v1/pulse/current`
- `GET /v1/archive/index`
- `GET /v1/archive/editions/{editionSlug}`
- persistencia local del histórico
- adaptador frontend con fallback estático
- smoke/E2E del modo API

## Fase 3 — Ingesta y scoring automatizados

### Objetivo

Construir el núcleo real de Quant Pulse como sistema de señales.

### Trabajo

- definir fuentes estructuradas y prioritarias
- construir ingesta desde RSS, fuentes oficiales y newsroom
- normalizar a un formato canónico
- deduplicar historias
- aplicar scoring automático basado en recencia, impacto, fuente, validación cruzada y relevancia temática
- registrar overrides editoriales

### Entregables

- pipeline de ingestión
- capa de scoring reproducible
- historial de decisiones editoriales

### Criterio de salida

La mayor parte del trabajo repetitivo de selección y priorización queda automatizada sin perder gobernanza editorial.

## Fase 4 — GPT operativo y distribución

### Objetivo

Usar el GPT y la distribución operativa encima del sistema ya estructurado.

### Trabajo

- mantener GPT con Knowledge para reglas editoriales
- añadir Actions solo cuando la API ya exista
- alertas P1
- digest diario
- histórico por narrativa
- watchlists por tema o ticker
- panel “what changed”
- métricas de calidad editorial

### Entregables

- GPT útil y consistente con Quant Pulse
- alerting útil
- archivo más navegable
- mayor valor para seguimiento recurrente

### Criterio de salida

Quant Pulse ya funciona como radar, no solo como frontend de resúmenes.

## 6. Prioridades inmediatas

## Prioridad alta

- seguir poblando el archivo con histórico real de ediciones estáticas
- decidir el siguiente slice rentable tras el baseline mínimo de backend
- mantener sincronizados feed, archive e intents con la fuente editorial

## Prioridad media

- reforzar la lectura editorial de cambios entre ediciones
- preparar la siguiente frontera útil de automatización sin sobrediseñar Fase 3
- reescribir README/demo para reflejar mejor la madurez real del producto

## Prioridad baja

- automatización editorial más ambiciosa
- personalización avanzada
- Actions públicas del GPT antes de tener backend real

## 7. Riesgos principales

- sobreinvertir en GPT/Actions antes de tener pipeline real
- dejar que la instrumentación visible del frontend vaya por delante de la protección funcional
- mantener documentación muy madura con consumidor frontend todavía poco blindado
- perder consistencia editorial si el feed se edita sin validación
- publicar una UX que prometa “archivo” o “radar” sin tener aún esas capacidades resueltas

## 8. Siguiente paso recomendado

El siguiente paso más rentable no es añadir más UI ni más backend.

Es este:

1. seguir convirtiendo el archive en producto con ediciones reales
2. decidir el primer slice útil de automatización de Fase 3
3. evitar ampliar backend o Actions sin un beneficio downstream claro

## 9. Resumen ejecutivo

Quant Pulse pretende convertirse en una capa upstream de señales para QuantLab, no en un motor de picks ni en un controlador de ejecución.

El repositorio ya tiene:

- visión editorial
- taxonomía
- scoring
- frontend publicado
- feed estático funcional
- backend mínimo vivo ya implementado
- archive persistente y API baseline ya cubiertos por smoke
- contrato upstream más explícito
- frontend más instrumental que en la fase inicial

Lo que falta es cerrar el gap entre:

- contrato
- frontend
- protección operativa
- y explotación real del histórico

El roadmap correcto es:

- explotar mejor el histórico
- automatizar ingesta y scoring
- abrir Actions solo si el caso downstream lo justifica
- evolucionar a radar operativo completo
