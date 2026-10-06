/** Consultas de ocorrencia: detalhe, demanda, deficit e recomendacoes. */

import { createClient } from '@/lib/supabase/server'
import { calculateResourceBalances, type ResourceBalance } from '@/lib/calculations/deficit'
import { totalStockByResource, type DemandLine } from '@/lib/calculations/demand'
import type { PriorityResult } from '@/lib/calculations/priority'
import type { ShelterRecommendation } from '@/lib/recommendations/shelter'
import type { AffectedPeopleRow, OccurrenceRow, ShelterRow } from '@/types/domain'

import { loadSnapshot, sheltersForOccurrence, type OperationalSnapshot } from './snapshot'
import { AFFECTED_COLUMNS, RECOMMENDATION_COLUMNS, mapRecommendation, unwrap } from './query'

export interface SavedRecommendation {
  id: string
  shelter_id: string
  shelter_name: string
  shelter_status: ShelterRow['status']
  distance_km: number | null
  score: number | null
  created_at: string
}

export interface OccurrenceDetail {
  occurrence: OccurrenceRow
  affected: AffectedPeopleRow | null
  priority: PriorityResult
  /** Demanda estimada desta ocorrencia, recurso por recurso. */
  demand: DemandLine[]
  /** Demanda da ocorrencia x estoque da rede. */
  balances: ResourceBalance[]
  /** Melhores abrigos calculados agora. */
  recommendations: ShelterRecommendation[]
  /** Recomendacoes persistidas em occurrence_shelters. */
  savedRecommendations: SavedRecommendation[]
  snapshot: OperationalSnapshot
}

export async function getOccurrenceDetail(id: string): Promise<OccurrenceDetail | null> {
  const supabase = await createClient()
  const snapshot = await loadSnapshot()

  const entry = snapshot.prioritized.find((item) => item.occurrence.id === id)
  if (!entry) return null

  const [affectedResult, savedResult] = await Promise.all([
    supabase.from('pessoas_afetadas').select(AFFECTED_COLUMNS).eq('occurrence_id', id).maybeSingle(),
    supabase
      .from('occurrence_shelters')
      .select(RECOMMENDATION_COLUMNS)
      .eq('occurrence_id', id)
      .order('score', { ascending: false }),
  ])

  if (affectedResult.error) {
    console.error('[abrigolog] falha ao carregar pessoas afetadas:', affectedResult.error.message)
  }

  const sheltersById = new Map(snapshot.shelters.map((shelter) => [shelter.id, shelter]))
  const savedRecommendations = unwrap(savedResult, 'carregar as recomendacoes salvas')
    .map(mapRecommendation)
    .map((row) => {
      const shelter = sheltersById.get(row.shelter_id)
      return {
        id: row.id,
        shelter_id: row.shelter_id,
        shelter_name: shelter?.name ?? 'Abrigo removido',
        shelter_status: shelter?.status ?? 'indisponivel',
        distance_km: row.distance_km,
        score: row.score,
        created_at: row.created_at,
      }
    })

  const demandByResource = new Map(entry.demand.map((line) => [line.resource_id, line.demand]))

  return {
    occurrence: entry.occurrence,
    affected: affectedResult.data ?? null,
    priority: entry.priority,
    demand: entry.demand,
    balances: calculateResourceBalances({
      resources: snapshot.resources,
      demandByResource,
      stockByResource: totalStockByResource(snapshot.stock),
    }),
    recommendations: sheltersForOccurrence(snapshot, entry.occurrence),
    savedRecommendations,
    snapshot,
  }
}

/**
 * Substitui as recomendacoes persistidas da ocorrencia pelas recem-calculadas.
 * Mantem o historico simples: uma recomendacao vigente por abrigo.
 */
export async function replaceRecommendations(
  occurrenceId: string,
  recommendations: ShelterRecommendation[],
): Promise<void> {
  const supabase = await createClient()

  const { error: deleteError } = await supabase
    .from('occurrence_shelters')
    .delete()
    .eq('occurrence_id', occurrenceId)

  if (deleteError) {
    console.error('[abrigolog] falha ao limpar recomendacoes:', deleteError.message)
    throw new Error('Nao foi possivel atualizar as recomendacoes.')
  }

  if (recommendations.length === 0) return

  const { error: insertError } = await supabase.from('occurrence_shelters').insert(
    recommendations.map((item) => ({
      occurrence_id: occurrenceId,
      shelter_id: item.shelter_id,
      recommended: true,
      distance_km: item.distance_km,
      score: item.score,
    })),
  )

  if (insertError) {
    console.error('[abrigolog] falha ao salvar recomendacoes:', insertError.message)
    throw new Error('Nao foi possivel salvar as recomendacoes.')
  }
}
