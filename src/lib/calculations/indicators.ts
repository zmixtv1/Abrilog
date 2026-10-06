/**
 * INDICADORES MENSURAVEIS DO SISTEMA
 *
 * 1. Taxa de ocupacao dos abrigos  = ocupacao / capacidade x 100
 * 2. Taxa de ocorrencias atendidas = (em atendimento + controladas + encerradas) / total x 100
 * 3. Cobertura logistica           = min(estoque, demanda) / demanda x 100
 * 4. Tempo medio de atendimento    = media(encerramento - abertura) em horas
 *                                    (null quando ainda nao ha dados -> indicador futuro)
 */

import type { DashboardCountersRow } from '../../types/domain'
import type { ResourceBalance } from './deficit'
import { percentage, round, toNumber } from './math'

export interface SystemIndicators {
  /** Indicador 1 (%) */
  shelterOccupancyRate: number
  /** Indicador 2 (%) */
  occurrencesHandledRate: number
  /** Indicador 3 (%) - quanto da demanda estimada o estoque atual cobre */
  logisticsCoverageRate: number
  /** Indicador 4 (horas) - null = sem dados suficientes */
  averageResponseHours: number | null
  /** Apoio: quantos recursos estao em deficit */
  resourcesInDeficitCount: number
  /** Apoio: quantos recursos estao abaixo do estoque minimo */
  resourcesBelowMinimumCount: number
  /**
   * Apoio: soma bruta das unidades faltantes. Observacao: soma unidades de
   * medida diferentes (litros, kits, pecas), por isso serve apenas como
   * ordem de grandeza - a leitura correta e sempre por recurso.
   */
  totalDeficitUnits: number
}

export function calculateIndicators(
  counters: DashboardCountersRow,
  balances: ResourceBalance[],
): SystemIndicators {
  const totalDemand = balances.reduce((sum, item) => sum + item.demand, 0)
  const covered = balances.reduce((sum, item) => sum + Math.min(item.stock, item.demand), 0)
  const avgResponse = counters.avg_response_hours

  return {
    shelterOccupancyRate: percentage(
      toNumber(counters.total_occupancy),
      toNumber(counters.total_capacity),
    ),
    occurrencesHandledRate: percentage(
      toNumber(counters.handled_occurrences),
      toNumber(counters.total_occurrences),
    ),
    logisticsCoverageRate: totalDemand === 0 ? 100 : percentage(covered, totalDemand),
    averageResponseHours:
      avgResponse === null || avgResponse === undefined ? null : round(toNumber(avgResponse), 1),
    resourcesInDeficitCount: balances.filter((item) => item.deficit > 0).length,
    resourcesBelowMinimumCount: balances.filter((item) => item.belowMinimum).length,
    totalDeficitUnits: balances.reduce((sum, item) => sum + item.deficit, 0),
  }
}
