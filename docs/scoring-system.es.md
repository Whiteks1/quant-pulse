# Quant Pulse — Sistema de scoring

## Objetivo

Asignar a cada noticia una puntuación de relevancia entre 0 y 100 para priorizar:

- alertas
- posición en el feed
- inclusión en briefs
- archivo

## Fórmula general

Puntuación total = suma de seis bloques:

1. Recencia: 0–20
2. Impacto de mercado: 0–25
3. Impacto estructural: 0–20
4. Calidad de fuente: 0–15
5. Validación cruzada: 0–10
6. Relevancia temática: 0–10

Total máximo: 100

## 1. Recencia (0–20)

- publicada en las últimas 2 horas → 20
- entre 2 y 6 horas → 15
- entre 6 y 24 horas → 10
- entre 24 y 72 horas → 5
- más de 72 horas → 0

## Regla operativa de recencia

En el runtime actual, la recencia solo puede validarse de forma reproducible cuando el ítem declara `scoredAt`.

- `publishedAt` describe cuándo se publicó la historia
- `scoredAt` describe cuándo quedó fijado el bloque de recencia
- si `scoredAt` no existe, el repo conserva compatibilidad con contenido histórico y no recalcula recencia automáticamente
- si `scoredAt` existe, `scoreJustification.recency` debe coincidir con la ventana `publishedAt -> scoredAt` salvo `editorialOverride` sobre `scoreJustification.recency`

## 2. Impacto de mercado (0–25)

### 25 puntos

- flujos ETF
- hack relevante
- colapso operativo
- anuncio institucional con impacto probable en BTC, ETH o sentimiento
- guidance/earnings de big tech con efecto claro

### 15 puntos

- impacto indirecto pero plausible
- mejora o deterioro moderado de narrativa

### 5 puntos

- interés informativo pero poco efecto esperable

### 0 puntos

- sin impacto observable o inferible

## 3. Impacto estructural (0–20)

### 20 puntos

- regulación oficial
- cambio de infraestructura
- lanzamiento tecnológico con efecto real
- cambio material en adopción o distribución

### 10 puntos

- novedad relevante, pero no transformadora

### 5 puntos

- novedad menor

### 0 puntos

- sin cambio estructural

## 4. Calidad de fuente (0–15)

### 15 puntos

- fuente primaria: empresa, regulador, comunicado oficial, filing

### 12 puntos

- medio Tier 1 muy fiable

### 8 puntos

- medio sólido, pero secundario

### 3 puntos

- medio de baja calidad o sin historial editorial fuerte

### 0 puntos

- rumor sin base verificable

## Regla operativa de enforcement

En el runtime actual, `sourceQuality` se interpreta así:

- `primary` → 15
- `tier_1` → 12
- `tier_2` → 8
- `tier_3` → 3

Para estos tiers explícitos, el valor ya es determinista y no solo un máximo.

`unlisted` ya no queda totalmente libre:

- sin `editorialOverride`, `sourceQuality` debe quedarse en `0–3`
- si editorialmente se quiere puntuar por encima de `3`, debe declararse `editorialOverride` sobre `scoreJustification.sourceQuality`
- esto no convierte `unlisted` en un tier determinista; solo fija un baseline prudente para fuentes no clasificadas

Si editorialmente se necesita romper esa regla en un tier explícito, debe quedar documentado con `editorialOverride` sobre `scoreJustification.sourceQuality`.

## 5. Validación cruzada (0–10)

- confirmado por varias fuentes de calidad → 10
- confirmado por una fuente fiable → 5
- sin confirmación suficiente → 0

## 6. Relevancia temática (0–10)

### 10 puntos

- BTC
- ETH
- ETFs
- regulación crypto
- seguridad
- execution venues
- broker rails
- market structure
- custody
- infra de IA
- chips
- cloud

### 5 puntos

- tema relacionado, pero periférico o dependiente de impacto indirecto

### 0 puntos

- fuera del foco estratégico de Quant Pulse

## Regla operativa de enforcement

En el runtime actual, `thematicRelevance` solo se valida de forma reproducible para los casos inequívocamente core.

Hoy el repo exige `10` sin `editorialOverride` cuando el ítem cae de forma clara en alguno de estos marcos:

- categorías core de `Technology`: `AI`, `Cybersecurity`, `Cloud`, `Chips`, `Infrastructure`
- categorías core de `Crypto & Markets`: `BTC`, `ETH`, `ETFs`, `Regulation`, `Security`, `Market Structure`, `Custody`
- categorías `Macro` del scope ya aprobado
- o texto/etiquetas que expresan de forma directa esos mismos temas core

Los casos ambiguos o intermedios siguen siendo editoriales por ahora. Este slice no automatiza todavía el `5` ni el `0` de forma completa.

## Reglas de ajuste

### Ajustes positivos

- +5 si la noticia abre una narrativa nueva
- +5 si altera un supuesto de mercado ampliamente aceptado

### Ajustes negativos

- -10 si es repetición sin novedad
- -10 si el titular es más fuerte que el contenido real
- -15 si depende de un rumor no verificado

## Uso operativo

- score 70–100 → candidato a P1
- score 40–69 → candidato a P2
- score 0–39 → candidato a P3

La prioridad final puede ajustarse por criterio editorial, pero cualquier override debe quedar documentado.

En particular, los desvíos manuales de recencia sobre un ítem con `scoredAt` deben justificarse con `editorialOverride`.
