/**
 * SNAPSHOT OPERACIONAL
 *
 * Carrega, em uma unica passada, tudo que o motor de regras precisa e executa
 * a cadeia de decisao:
 *
 *   ocorrencias + abrigos + recursos + estoque
 *        -> demanda estimada
 *        -> deficit por recurso
 *        -> prioridade de cada ocorrencia
 *        -> recomendacao de abrigo
 *        -> indicadores
 *
 * Dashboard, logistica, mapa e listagens reutilizam este snapshot, evitando
 * consultas repetidas (e qualquer N+1).
 */

import { createClient } from '@/lib/supabase/server'
import {
  calculateResourceBalances,
  coverageRatioByResource,
  occurrenceDeficitScore,
  resourcesInDeficit,
  systemDeficitScore,
  type ResourceBalance,
} from '@/lib/calculations/deficit'
import {
  estimateDemand,
  generatesDemand,
  totalDemandByResource,
  totalStockByResource,
  type DemandLine,
} from '@/lib/calculations/demand'
import { calculateIndicators, type SystemIndicators } from '@/lib/calculations/indicators'
import { calculateOccurrencePriority, type PriorityResult } from '@/lib/calculations/priority'
import { ACTIVE_STATUSES } from '@/lib/calculations/parameters'
import { recommendShelters, type ShelterRecommendation } from '@/lib/recommendations/shelter'
import {
  suggestDistribution,
  type DistributionSuggestion,
  type DistributionTarget,
} from '@/lib/recommendations/logistics'
import type {
  DashboardCountersRow,
  OccurrenceRow,
  ResourceRow,
  ShelterRow,
  StockRow,
} from '@/types/domain'

import {
  OCCURRENCE_COLUMNS,
  RESOURCE_COLUMNS,
  SHELTER_COLUMNS,
  STOCK_COLUMNS,
  mapOccurrence,
  mapResource,
  mapShelter,
  mapStock,
  unwrap,
} from './query'

export interface PrioritizedOccurrence {
  occurrence: OccurrenceRow
  priority: PriorityResult
  /** Demanda estimada de cada recurso para esta ocorrencia. */
  demand: DemandLine[]
  /** 0-100: parcela da demanda desta ocorrencia sem cobertura de estoque. */
  deficitScore: number
}

export interface OperationalSnapshot {
  occurrences: OccurrenceRow[]
  shelters: ShelterRow[]
  resources: ResourceRow[]
  stock: StockRow[]
  counters: DashboardCountersRow
  balances: ResourceBalance[]
  deficits: ResourceBalance[]
  indicators: SystemIndicators
  /** Ocorrencias com prioridade, da mais critica para a menos critica. */
  prioritized: PrioritizedOccurrence[]
  systemDeficitScore: number
  generatedAt: string
}

const EMPTY_COUNTERS: DashboardCountersRow = {
  active_occurrences: 0,
  total_occurrences: 0,
  handled_occurrences: 0,
  affected_people: 0,
  active_shelters: 0,
  total_capacity: 0,
  total_occupancy: 0,
  available_vacancies: 0,
  avg_response_hours: null,
}

/** Carrega os dados e roda o motor de regras. */
export async function loadSnapshot(now: Date = new Date()): Promise<OperationalSnapshot> {
  const supabase = await createClient()

  const [occurrencesResult, sheltersResult, resourcesResult, stockResult, countersResult] =
    await Promise.all([
      supabase.from('ocorrencias').select(OCCURRENCE_COLUMNS).order('created_at', { ascending: false }),
      supabase.from('abrigos').select(SHELTER_COLUMNS).order('name'),
      supabase.from('recursos').select(RESOURCE_COLUMNS).order('name'),
      supabase.from('estoque').select(STOCK_COLUMNS),
      supabase.from('vw_dashboard_counters').select('*').maybeSingle(),
    ])

  const occurrences = unwrap(occurrencesResult, 'carregar as ocorrencias').map(mapOccurrence)
  const shelters = unwrap(sheltersResult, 'carregar os abrigos').map(mapShelter)
  const resources = unwrap(resourcesResult, 'carregar o catalogo de recursos').map(mapResource)
  const stock = unwrap(stockResult, 'carregar o estoque').map(mapStock)

  if (countersResult.error) {
    console.error('[abrigolog] falha ao carregar os contadores:', countersResult.error.message)
  }
  const counters = countersResult.data ?? EMPTY_COUNTERS

  // --- demanda x estoque -----------------------------------------------------
  const demandByResource = totalDemandByResource(occurrences, resources)
  const stockByResource = totalStockByResource(stock)
  const balances = calculateResourceBalances({ resources, demandByResource, stockByResource })
  const coverage = coverageRatioByResource(balances)

  // --- prioridade de cada ocorrencia ----------------------------------------
  const prioritized: PrioritizedOccurrence[] = occurrences
    .map((occurrence) => {
      const demand = generatesDemand(occurrence)
        ? estimateDemand(resources, occurrence.affected_people)
        : []
      const deficitScore = occurrenceDeficitScore(demand, coverage)

      return {
        occurrence,
        demand,
        deficitScore,
        priority: calculateOccurrencePriority(occurrence, deficitScore, now),
      }
    })
    .sort((a, b) => b.priority.score - a.priority.score)

  return {
    occurrences,
    shelters,
    resources,
    stock,
    counters,
    balances,
    deficits: resourcesInDeficit(balances),
    indicators: calculateIndicators(counters, balances),
    prioritized,
    systemDeficitScore: systemDeficitScore(balances),
    generatedAt: now.toISOString(),
  }
}

/** Ocorrencias ainda em curso, da mais critica para a menos critica. */
export function activeOccurrences(snapshot: OperationalSnapshot): PrioritizedOccurrence[] {
  return snapshot.prioritized.filter((item) => ACTIVE_STATUSES.includes(item.occurrence.status))
}

/** Ocorrencias classificadas como criticas pelo motor. */
export function criticalOccurrences(snapshot: OperationalSnapshot): PrioritizedOccurrence[] {
  return activeOccurrences(snapshot).filter((item) => item.priority.level === 'critica')
}

/**
 * Acoes logisticas sugeridas: usa o abrigo mais bem pontuado de cada ocorrencia
 * prioritaria como destino preferencial da distribuicao.
 */
export function distributionSuggestions(
  snapshot: OperationalSnapshot,
): DistributionSuggestion[] {
  const targets: DistributionTarget[] = []

  for (const item of activeOccurrences(snapshot)) {
    const [best] = recommendShelters(item.occurrence, snapshot.shelters, 1)
    if (!best) continue
    targets.push({
      shelter_id: best.shelter_id,
      occurrence_id: item.occurrence.id,
      occurrence_title: item.occurrence.title,
      priority_score: item.priority.score,
      priority_level: item.priority.level,
    })
  }

  return suggestDistribution({
    balances: snapshot.balances,
    stock: snapshot.stock,
    shelters: snapshot.shelters,
    targets,
  })
}

/** Recomendacoes de abrigo para uma ocorrencia do snapshot. */
export function sheltersForOccurrence(
  snapshot: OperationalSnapshot,
  occurrence: OccurrenceRow,
  limit?: number,
): ShelterRecommendation[] {
  return recommendShelters(occurrence, snapshot.shelters, limit)
}
