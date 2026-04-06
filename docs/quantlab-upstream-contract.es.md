# Quant Pulse — Contrato upstream para QuantLab

## Propósito

Quant Pulse actúa como capa upstream de señales para QuantLab.

No es:

- un motor de picks
- un controlador de ejecución
- un sustituto del research de QuantLab

Su valor existe solo cuando una señal puede traducirse de forma útil para QuantLab.

## Relación de producto

Quant Pulse emite **intenciones de research priorizadas**.

QuantLab consume esas intenciones mediante:

- workflows de research
- disciplina de paper trading o validación
- límites controlados de ejecución

QuantLab sigue siendo la autoridad sobre:

- qué hipótesis probar
- qué filtros de riesgo imponer
- qué señales ignorar
- qué decisiones de ejecución no deben derivarse de Quant Pulse

## Scope primario

Quant Pulse cubre prioritariamente:

- Crypto & Markets
- estructura de mercado Web3
- riesgo de execution venues y broker rails
- Technology solo cuando afecte infraestructura, seguridad o market structure
- Macro solo cuando afecte materialmente las condiciones de crypto o tecnología

## Non-goals

Quant Pulse no:

- decide trades
- gobierna QuantLab
- reemplaza el research de QuantLab
- convierte contexto editorial en instrucción de ejecución

## Regla de comportamiento obligatoria

Si una señal de Quant Pulse no puede traducirse en alguna de estas salidas para QuantLab:

- hipótesis de research comprobable
- validación estructurada
- control de riesgo
- prioridad de producto o instrumentación

entonces debe permanecer como **context only** y no debe conducir comportamiento downstream en QuantLab.

## Contrato de intake de señales

Toda señal que aspire a cruzar de Quant Pulse hacia QuantLab debe poder expresarse con estos campos:

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

## Interpretación operativa de los campos

- `signal_summary`: resumen corto de la señal y del cambio relevante
- `priority`: urgencia editorial y operativa de intake
- `affected_universe`: activos, venues, rails, sectores o sistemas afectados
- `bias`: sesgo tentativo a validar, no instrucción de trading
- `horizon`: ventana temporal relevante para research o monitorización
- `hypothesis_type`: tipo de hipótesis que QuantLab debería considerar
- `validation_goal`: qué evidencia debe buscarse para aceptar o descartar la señal
- `invalidation_condition`: condición observable que invalida la hipótesis
- `risk_filter_hint`: posible implicación para filtros o límites de riesgo
- `product_priority_hint`: posible implicación para instrumentación, cobertura o tooling

## Regla de autoridad

Cuando haya ambigüedad de scope, este contrato restringe la interpretación del resto de documentación editorial.

Eso significa:

- Technology no debe tratarse como cobertura generalista
- Macro no debe tratarse como cobertura amplia sin relación material con crypto o tecnología
- el output de Quant Pulse no debe leerse como recomendación de ejecución
