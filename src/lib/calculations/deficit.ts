/**
 * MOTOR DE DEFICIT DE RECURSOS
 *
 * deficit = max(0, demanda_estimada - estoque_atual)   -> nunca negativo
 * cobertura = min(1, estoque / demanda)
 *
 * O deficit relativo (deficit / demanda) e reaproveitado como componente de
 * 0-100 na priorizacao das ocorrencias e na classificacao do recurso.
 */

import type { PriorityLevel, ResourceInput } from '../../types/domain'
import type { DemandLine } from './demand'
import { clamp, percentage, round, toNumber } from './math'
import { priorityLevel } from './priority'

export interface ResourceBalance {
  resource_id: string
  resource_name: string
  unit: string
  category: string | null
  minimum_stock: number
  demand: number
  stock: number
  /** Nunca negativo. */
  deficit: number
  /** Excedente quando o estoque supera a demanda. */
  surplus: number
  /** 0-100: percentual da demanda atendida pelo estoque. */
  coverage: number
  /** 0-100: percentual da demanda sem cobertura (usado na priorizacao). */
  deficitScore: number
  priority: PriorityLevel
  belowMinimum: boolean
}

export interface ResourceBalanceInput {
  resources: ResourceInput[]
  demandByResource: Map<string, number>
  stockByResource: Map<string, number>
}

/**
 * Balanco de cada recurso (demanda x estoque), ordenado do deficit mais
 * severo para o menos severo.
 */
export function calculateResourceBalances({
  resources,
  demandByResource,
  stockByResource,
}: ResourceBalanceInput): ResourceBalance[] {
  const balances = resources.map<ResourceBalance>((resource) => {
    const demand = Math.max(0, Math.round(toNumber(demandByResource.get(resource.id))))
    const stock = Math.max(0, Math.round(toNumber(stockByResource.get(resource.id))))
    const deficit = Math.max(0, demand - stock)
    const minimumStock = Math.max(0, toNumber(resource.minimum_stock))
    const deficitScore = demand === 0 ? 0 : clamp((deficit / demand) * 100)

    return {
      resource_id: resource.id,
      resource_name: resource.name,
      unit: resource.unit,
      category: resource.category ?? null,
      minimum_stock: minimumStock,
      demand,
      stock,
      deficit,
      surplus: Math.max(0, stock - demand),
      coverage: demand === 0 ? 100 : percentage(Math.min(stock, demand), demand),
      deficitScore: round(deficitScore, 1),
      priority: priorityLevel(deficitScore),
      belowMinimum: stock < minimumStock,
    }
  })

  // Ordena pelo deficit RELATIVO (% da demanda sem cobertura) e nao pelo valor
  // absoluto: 600 litros de agua e 70 colchoes nao sao comparaveis entre si,
  // mas "60% da demanda descoberta" e "100% da demanda descoberta" sao.
  return balances.sort((a, b) => b.deficitScore - a.deficitScore || b.deficit - a.deficit)
}

/** Somente os recursos que estao faltando. */
export function resourcesInDeficit(balances: ResourceBalance[]): ResourceBalance[] {
  return balances.filter((balance) => balance.deficit > 0)
}

/**
 * Deficit sistemico (0-100): percentual da demanda total que o estoque nao
 * cobre, ponderado pelo tamanho da demanda de cada recurso.
 */
export function systemDeficitScore(balances: ResourceBalance[]): number {
  const totalDemand = balances.reduce((sum, item) => sum + item.demand, 0)
  if (totalDemand === 0) return 0
  const totalDeficit = balances.reduce((sum, item) => sum + item.deficit, 0)
  return round(clamp((totalDeficit / totalDemand) * 100), 1)
}

/** Cobertura de cada recurso em fracao 0-1 (usada no deficit por ocorrencia). */
export function coverageRatioByResource(balances: ResourceBalance[]): Map<string, number> {
  return new Map(balances.map((balance) => [balance.resource_id, balance.coverage / 100]))
}

/**
 * Deficit da ocorrencia (0-100): parcela da demanda DELA que ficaria sem
 * cobertura, usando a taxa de cobertura de cada recurso no sistema.
 *
 * Ocorrencia que demanda muito de um recurso escasso pontua mais alto do que
 * uma ocorrencia de mesmo porte cujos recursos estao disponiveis.
 */
export function occurrenceDeficitScore(
  demandLines: DemandLine[],
  coverageByResource: Map<string, number>,
): number {
  const totalDemand = demandLines.reduce((sum, line) => sum + line.demand, 0)
  if (totalDemand === 0) return 0

  const uncovered = demandLines.reduce((sum, line) => {
    const coverage = clamp(coverageByResource.get(line.resource_id) ?? 1, 0, 1)
    return sum + line.demand * (1 - coverage)
  }, 0)

  return round(clamp((uncovered / totalDemand) * 100), 1)
}
