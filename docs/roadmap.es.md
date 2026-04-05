# Quant Pulse — Roadmap operativo

## 1. Qué se pretende construir

Quant Pulse no pretende ser un simple agregador de noticias.

El repositorio apunta a construir un sistema editorial de inteligencia de señales para:

- detectar noticias relevantes antes que el ruido
- clasificarlas con criterios editoriales consistentes
- resumirlas con contexto útil y tono sobrio
- publicarlas en una web pública y consultable
- preparar el salto posterior a un backend y a un GPT con Actions

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
- estructura visual para:
  - Hero
  - Executive Brief
  - Featured Stories
  - Technology
  - Crypto & Markets
  - Macro
  - Signal vs Noise
  - What to Watch
  - Archive Preview
- imágenes editoriales opcionales en cards destacadas
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
- generación automática de `pulse.json`
- archivo navegable real
- búsqueda real
- backend/API
- GPT Actions útiles sobre datos vivos
- alertas operativas

## 3. Diagnóstico

El repo está bien orientado conceptualmente.

La carpeta ya no es solo una landing: es un frontend funcional de Fase 1 con documentación editorial seria y una estructura clara para evolucionar.

Pero sigue habiendo una distancia importante entre:

- la visión del producto
- y la automatización real del sistema

Hoy Quant Pulse es, esencialmente:

- una web estática bien planteada
- alimentada por un feed manual o semi-manual
- con reglas editoriales muy trabajadas

Todavía no es:

- un radar operativo automatizado
- ni un motor de señales con pipeline end-to-end

## 4. Principio rector del roadmap

No conviene saltar directamente a GPT Actions, chat embebido o backend complejo.

El orden correcto, según el estado del repo y su propia documentación, es:

1. consolidar Fase 1
2. automatizar el feed
3. introducir backend mínimo
4. activar Actions
5. añadir funciones avanzadas de inteligencia editorial

## 5. Roadmap propuesto

## Fase 1A — Consolidación del frontend y del contrato

### Objetivo

Cerrar bien la base estática para que la web sea estable, coherente y mantenible.

### Trabajo

- revisar que `public/data/pulse.json` cumpla siempre `config/news.schema.json`
- eliminar placeholders obvios en `url` y reemplazarlos por enlaces reales o marcarlos explícitamente como demo
- decidir si la UI final queda en inglés, español o bilingüe
- convertir `ArchivePreview` de bloque visual a contrato funcional aunque sea con datos estáticos
- añadir estados de empty state y stale data usando `updatedAt`
- reforzar tests del feed y del render principal

### Entregables

- web estable publicada en Pages
- feed canónico válido
- documentación alineada con lo que realmente muestra la UI

### Criterio de salida

La app puede publicarse como demo funcional sin incoherencias evidentes entre docs, datos y frontend.

## Fase 1B — Pipeline editorial manual asistido

### Objetivo

Pasar de demo estática a operación editorial mínima sin backend.

### Trabajo

- definir un proceso operativo para actualizar `pulse.json`
- crear una checklist editorial para cada actualización del feed
- validar cada ítem contra taxonomía, prioridad y scoring
- documentar quién y cómo actualiza `executiveBrief`
- documentar cómo se seleccionan `featured` y `watchItems`
- añadir una utilidad o script local de validación del JSON

### Entregables

- flujo manual reproducible para publicar ediciones
- validación automática básica del feed
- criterio claro para featured, signal/noise y watchlist

### Criterio de salida

Se puede publicar un nuevo feed completo de forma consistente en menos de 15 minutos con poca fricción.

## Fase 2 — Backend mínimo y feed vivo

### Objetivo

Separar contenido y frontend, y dejar de depender de edición manual del JSON.

### Trabajo

- crear backend mínimo o worker
- exponer endpoints estables para:
  - latest-news
  - top-signals
  - storyline
  - watchlist
  - search-archive
- implementar generación automática de `pulse.json`
- centralizar validación del contrato
- introducir persistencia básica para histórico

### Entregables

- API mínima funcional
- generación del feed desde proceso automatizado
- archivo histórico persistente

### Criterio de salida

La web ya no depende de edición manual directa de `public/data/pulse.json`.

## Fase 3 — Ingesta y scoring automatizados

### Objetivo

Construir el núcleo real de Quant Pulse como sistema de señales.

### Trabajo

- definir fuentes estructuradas y prioritarias
- construir ingesta desde RSS, fuentes oficiales y newsroom
- normalizar a un formato canónico
- deduplicar historias
- aplicar scoring automático basado en:
  - recencia
  - impacto
  - fuente
  - validación cruzada
  - relevancia temática
- registrar overrides editoriales

### Entregables

- pipeline de ingestión
- capa de scoring reproducible
- historial de decisiones editoriales

### Criterio de salida

La mayor parte del trabajo repetitivo de selección y priorización queda automatizada.

## Fase 4 — GPT operativo

### Objetivo

Usar el GPT como capa analítica encima del sistema ya estructurado.

### Trabajo

- mantener GPT con Knowledge para reglas editoriales
- añadir Actions solo cuando la API ya exista
- diseñar prompts operativos para:
  - executive brief
  - signal vs noise
  - storyline summaries
  - “what changed in last 24h”
- establecer límites claros entre:
  - hechos del feed
  - inferencia del modelo
  - hipótesis editoriales

### Entregables

- GPT útil y consistente con Quant Pulse
- consultas sobre señales actuales y archivo
- respuestas alineadas con la voz editorial

### Criterio de salida

El GPT deja de ser una demo y se convierte en una interfaz real de análisis.

## Fase 5 — Operación y distribución

### Objetivo

Convertir Quant Pulse en una herramienta operativa y no solo editorial.

### Trabajo

- alertas P1
- digest diario
- histórico por narrativa
- watchlists por tema o ticker
- panel “what changed”
- métricas de calidad editorial

### Entregables

- alerting útil
- archivo más navegable
- mayor valor para seguimiento recurrente

### Criterio de salida

Quant Pulse ya funciona como radar, no solo como frontend de resúmenes.

## 6. Prioridades inmediatas

## Prioridad alta

- validar `pulse.json` automáticamente contra `news.schema.json`
- sustituir enlaces `example.com`
- reforzar tests del feed y filtros
- documentar el flujo editorial manual de Fase 1B
- decidir idioma final del producto

## Prioridad media

- hacer el archivo navegable
- introducir histórico real de ediciones
- preparar scripts de generación/validación del feed

## Prioridad baja

- chat embebido
- personalización avanzada
- Actions públicas del GPT antes de tener backend real

## 7. Riesgos principales

- sobreinvertir en GPT/Actions antes de tener pipeline real
- mantener documentación muy madura con datos todavía demasiado demo
- perder consistencia editorial si el feed se edita sin validación
- publicar una UX que prometa “archivo” o “radar” sin tener aún esas capacidades resueltas

## 8. Siguiente paso recomendado

El siguiente paso más rentable no es añadir más UI.

Es este:

1. crear validación automática de `pulse.json`
2. documentar el flujo manual de publicación del feed
3. sustituir placeholders y convertir la demo en una Fase 1 sólida
4. solo después empezar el backend mínimo

## 9. Resumen ejecutivo

Quant Pulse pretende convertirse en un sistema editorial de inteligencia de señales para tech, crypto y macro.

El repositorio ya tiene:

- visión editorial
- taxonomía
- scoring
- frontend publicado
- feed estático funcional

Lo que falta es convertir esa base en un sistema operativo reproducible.

El roadmap correcto es:

- consolidar feed estático
- automatizar validación y publicación
- construir backend mínimo
- añadir Actions
- evolucionar a radar operativo completo
