# Quant Pulse — Formato JSON canónico

## Objetivo

Definir el contrato canónico de una noticia procesada por Quant Pulse.

## Campos obligatorios

- id
- title
- source
- sourceTier
- url
- linkType
- publishedAt
- section
- category
- summary
- whyItMatters
- impact
- signalVsNoise
- priority
- relevanceScore
- scoreJustification
- tags
- dedupeKey

## Ejemplo canónico

```json
{
  "id": "2026-04-04_btc-etf-inflows_bloomberg",
  "title": "Los ETF de Bitcoin registran nuevas entradas netas",
  "source": "Bloomberg",
  "sourceTier": "tier_1",
  "url": "https://www.bloomberg.com/crypto",
  "linkType": "source-section",
  "publishedAt": "2026-04-04T09:12:00Z",
  "section": "Crypto & Markets",
  "category": "ETFs",
  "summary": "Los ETF al contado de Bitcoin han vuelto a registrar entradas netas tras varias sesiones más débiles.",
  "whyItMatters": "Esto refuerza la narrativa de demanda institucional y mejora el sentimiento de corto plazo.",
  "impact": "Señal positiva para el sentimiento de BTC.",
  "signalVsNoise": "signal",
  "priority": "P1",
  "relevanceScore": 88,
  "scoreJustification": {
    "recency": 10,
    "marketImpact": 25,
    "structuralImpact": 20,
    "sourceQuality": 12,
    "crossValidation": 10,
    "thematicRelevance": 10,
    "rationale": "La reversión de flujos afecta directamente a una narrativa prioritaria."
  },
  "tags": ["BTC", "ETF", "flows", "institutional"],
  "dedupeKey": "btc-etf-inflows"
}
```

## Reglas por campo

### id

Identificador único y estable.

### title

Titular limpio, claro y no sensacionalista.

### source

Nombre normalizado de la fuente.

### sourceTier

Calidad editorial de la fuente.

### url

Enlace real a artículo, sección o fuente oficial. No usar placeholders.

### linkType

Tipo de enlace:

- article
- source-section
- source-home


### publishedAt

Fecha ISO 8601 en UTC.

### section

Valores permitidos:

- Technology
- Crypto & Markets
- Macro

### category

Categoría principal de la noticia (debe existir en la taxonomía de su sección; ver `category-taxonomy.es.md`).

### summary

Resumen factual breve.

### whyItMatters

Explicación de valor editorial.

### impact

Conclusión breve y accionable.

### signalVsNoise

Valores permitidos:

- signal
- noise

### priority

Valores permitidos:

- P1
- P2
- P3

### relevanceScore

Número entre 0 y 100.

### scoreJustification

Desglose editorial del score por bloques y una explicación corta del porqué.

### tags

Lista de etiquetas auxiliares (recomendado entre 2 y 6).

### dedupeKey

Clave estable para deduplicación.

## Bundle de feed en Pages (`pulse.json`)

Para la web estática, los ítems canónicos se agrupan en `public/data/pulse.json` junto con:

- `executiveBrief`: objetos con `id`, `itemId` y `text`
- `watchItems`: eventos con trazabilidad mínima (`section`, `source`, `url`, `whyWatch`)
- metadatos `version` / `updatedAt`

Cada elemento de `items` debe cumplir los campos obligatorios de este documento, con `featured`, `imageUrl`, `imageAlt`, `imageSource` y `editorialOverride` como campos opcionales.

## Validación en repo

El esquema JSON en `config/news.schema.json` puede usarse para validar cada ítem de `items` (p. ej. en pipelines o con herramientas de agentes).

## Reglas de estilo del contenido

- summary: 1 o 2 frases
- whyItMatters: 1 o 2 frases
- impact: una frase corta
- evitar párrafos largos
- el texto debe poder leerse en voz alta sin sonar extraño
