# Quant Pulse — Formato de signal intent para QuantLab

## Objetivo

Definir el artefacto downstream que Quant Pulse debería emitir cuando una historia deja de ser solo contexto y pasa a ser útil para QuantLab.

Este documento no cambia el contrato actual del feed público de Fase 1.

Su función es:

- convertir el contrato upstream en un artefacto operativo
- estandarizar el handoff hacia QuantLab
- evitar que Quant Pulse emita señales ambiguas o demasiado editoriales

## Naturaleza del artefacto

Un **signal intent** es una traducción disciplinada de una historia o conjunto de señales hacia una posible acción de research, validación, riesgo o producto en QuantLab.

No es:

- una orden de trading
- una recomendación de ejecución
- una prueba cuantitativa concluida

## Cuándo debe existir

Un signal intent solo debe emitirse cuando una historia pueda traducirse de forma útil en al menos una de estas salidas:

- hipótesis de research comprobable
- filtro de riesgo
- prioridad de producto o instrumentación

Si no se cumple esa condición, la historia debe permanecer como **context only**.

## Relación con el feed de Fase 1

En el estado actual del repo:

- `content/pulse.source.json` es la fuente editorial
- `public/data/pulse.json` es el feed publicado

El signal intent es un artefacto downstream adicional.

Por ahora:

- no forma parte obligatoria de `public/data/pulse.json`
- no forma parte obligatoria de `config/news.schema.json`
- no debe asumirse como implementado en runtime hasta que una slice posterior lo introduzca explícitamente

## Campos canónicos

Todo signal intent debe poder expresarse con estos campos:

- `signal_summary`
- `priority`
- `affected_universe`
- `bias`
- `horizon`
- `hypothesis_type`
- `validation_goal`
- `invalidation_condition`
- `risk_filter_hint`
- `product_priority_hint`

## Interpretación de campos

### `signal_summary`

Resumen corto del cambio relevante que QuantLab debe considerar.

### `priority`

Nivel de urgencia del handoff.

Valores esperados:

- `P1`
- `P2`
- `P3`

### `affected_universe`

Lista de activos, venues, rails, estrategias, sectores o sistemas afectados.

### `bias`

Sesgo tentativo a validar.

No es una instrucción de trading.

Ejemplos:

- `bullish`
- `bearish`
- `risk-off`
- `neutral`
- `operational-risk`

### `horizon`

Ventana temporal esperada para la validación o monitorización.

Ejemplos:

- `intraday`
- `days`
- `weeks`
- `structural`

### `hypothesis_type`

Tipo de hipótesis o salida downstream.

Valores sugeridos:

- `trend`
- `mean_reversion`
- `event_driven`
- `risk_filter`
- `rotation`
- `product_priority`

### `validation_goal`

Qué evidencia debe buscar QuantLab para aceptar o descartar la hipótesis.

### `invalidation_condition`

Qué condición observable invalida el intent.

### `risk_filter_hint`

Posible implicación para límites, exclusiones, reducciones de exposición o gating operativo.

### `product_priority_hint`

Posible implicación para cobertura, instrumentación, alerting o tooling.

## Reglas de traducción desde el feed

La traducción desde una historia del feed a un signal intent debe seguir estas reglas:

1. partir de hechos y no de hype
2. respetar `signalVsNoise`
3. respetar `priority`
4. preservar la taxonomía relevante (`section`, `category`, `tags`)
5. producir un intent solo si existe una utilidad clara para QuantLab

Regla operativa:

- una historia `noise` no debería convertirse en signal intent salvo caso excepcional y muy justificado
- una historia `P3` normalmente permanece en contexto, salvo que exponga un riesgo operativo o una prioridad de producto clara

## Estructura conceptual mínima

Ejemplo canónico:

```json
{
  "signal_summary": "Deterioro operativo en un exchange centralizado relevante con posible impacto en liquidez y confianza.",
  "priority": "P1",
  "affected_universe": ["BTC", "ETH", "centralized exchanges", "crypto liquidity"],
  "bias": "risk-off",
  "horizon": "days",
  "hypothesis_type": "risk_filter",
  "validation_goal": "Comprobar si el deterioro operativo se traduce en ampliación de spreads, caída de profundidad y desplazamiento de flujos a otros venues.",
  "invalidation_condition": "La incidencia queda acotada, la operativa se normaliza rápido y no aparecen señales de contagio en liquidez o flujos.",
  "risk_filter_hint": "Reducir confianza en venues afectados y elevar vigilancia sobre exposición operativa y dependencias de ejecución.",
  "product_priority_hint": "Priorizar instrumentación sobre salud de venues, latencia operativa y calidad de ejecución."
}
```

## Mapeo orientativo desde historias

### Historia de flows o momentum confirmado

Salida probable:

- `hypothesis_type: trend`

### Historia de sobreextensión, rumor o reversión post-evento

Salida probable:

- `hypothesis_type: mean_reversion`

### Historia de hack, venue stress o deterioro de liquidez

Salida probable:

- `hypothesis_type: risk_filter`

### Historia que expone un gap de visibilidad, cobertura o tooling

Salida probable:

- `hypothesis_type: product_priority`

## Regla de autoridad

Cuando haya conflicto:

1. `AGENTS.md`
2. `docs/quantlab-upstream-contract.es.md`
3. este documento
4. contrato actual del feed y documentación editorial restante

## Estado de implementación

Este documento define el siguiente artefacto lógico del sistema.

No implica todavía:

- cambio de `news.schema.json`
- cambio de `pulse.json`
- cambio del pipeline runtime
- integración automática con QuantLab

Eso debe llegar solo mediante slices explícitas posteriores.
