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
- OpenAI
- NVIDIA
- Microsoft
- Google
- Apple
- Amazon
- Meta
- infra de IA
- big tech earnings

### 5 puntos

- tema relacionado, pero periférico

### 0 puntos

- fuera del foco estratégico de Quant Pulse

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
