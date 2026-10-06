/** Consultas de abrigo: detalhe com estoque, movimentacoes e ocorrencias ligadas. */

import { createClient } from '@/lib/supabase/server'
import { occupancyPercentage, vacancies } from '@/lib/calculations/shelters'
import type { OccurrenceRow, ResourceRow, ShelterRow } from '@/types/domain'

import { MOVEMENT_COLUMNS, mapMovement, unwrap } from './query'
import { attachNames, type MovementWithNames } from './logistics'
import { loadSnapshot, type OperationalSnapshot } from './snapshot'

export interface ShelterStockLine {
  resource: ResourceRow
  quantity: number
  belowMinimum: boolean
}

export interface LinkedOccurrence {
  occurrence: OccurrenceRow
  score: number | null
  distance_km: number | null
}

export interface ShelterDetail {
  shelter: ShelterRow
  vacancies: number
  occupancyPercentage: number
  stock: ShelterStockLine[]
  movements: MovementWithNames[]
  linkedOccurrences: LinkedOccurrence[]
  snapshot: OperationalSnapshot
}

export async function getShelterDetail(id: string): Promise<ShelterDetail | null> {
  const supabase = await createClient()
  const snapshot = await loadSnapshot()

  const shelter = snapshot.shelters.find((item) => item.id === id)
  if (!shelter) return null

  const [movementsResult, linksResult] = await Promise.all([
    supabase
      .from('movimentacoes')
      .select(MOVEMENT_COLUMNS)
      .or(`origin_shelter_id.eq.${id},destination_shelter_id.eq.${id}`)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('occurrence_shelters')
      .select('occurrence_id, score, distance_km')
      .eq('shelter_id', id)
      .order('score', { ascending: false }),
  ])

  const movements = unwrap(movementsResult, 'carregar as movimentacoes do abrigo').map(mapMovement)
  const links = unwrap(linksResult, 'carregar as ocorrencias vinculadas')

  const occurrenceById = new Map(snapshot.occurrences.map((item) => [item.id, item]))
  const resourceById = new Map(snapshot.resources.map((item) => [item.id, item]))

  const stock: ShelterStockLine[] = snapshot.stock
    .filter((row) => row.shelter_id === id)
    .map((row) => {
      const resource = resourceById.get(row.resource_id)
      return resource
        ? {
            resource,
            quantity: row.quantity,
            belowMinimum: row.quantity < resource.minimum_stock,
          }
        : null
    })
    .filter((line): line is ShelterStockLine => line !== null)
    .sort((a, b) => a.resource.name.localeCompare(b.resource.name))

  const linkedOccurrences: LinkedOccurrence[] = links
    .map((link) => {
      const occurrence = occurrenceById.get(link.occurrence_id)
      return occurrence
        ? {
            occurrence,
            score: link.score === null ? null : Number(link.score),
            distance_km: link.distance_km === null ? null : Number(link.distance_km),
          }
        : null
    })
    .filter((item): item is LinkedOccurrence => item !== null)

  return {
    shelter,
    vacancies: vacancies(shelter),
    occupancyPercentage: occupancyPercentage(shelter),
    stock,
    movements: attachNames(movements, snapshot.resources, snapshot.shelters),
    linkedOccurrences,
    snapshot,
  }
}
