/** Consultas da Central Logistica: movimentacoes e acoes sugeridas. */

import { createClient } from '@/lib/supabase/server'
import type { DistributionSuggestion } from '@/lib/recommendations/logistics'
import type { MovementRow, ResourceRow, ShelterRow } from '@/types/domain'

import { MOVEMENT_COLUMNS, mapMovement, unwrap } from './query'
import { distributionSuggestions, loadSnapshot, type OperationalSnapshot } from './snapshot'

export interface MovementWithNames extends MovementRow {
  resource_name: string
  resource_unit: string
  origin_name: string | null
  destination_name: string | null
}

export interface LogisticsView {
  snapshot: OperationalSnapshot
  suggestions: DistributionSuggestion[]
  movements: MovementWithNames[]
}

/** Ultimas movimentacoes registradas (sem join: os nomes vem do snapshot). */
export async function listMovements(limit = 20): Promise<MovementRow[]> {
  const supabase = await createClient()

  const result = await supabase
    .from('movimentacoes')
    .select(MOVEMENT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit)

  return unwrap(result, 'carregar as movimentacoes').map(mapMovement)
}

/** Enriquece as movimentacoes com nomes de recurso e abrigos. */
export function attachNames(
  movements: MovementRow[],
  resources: ResourceRow[],
  shelters: ShelterRow[],
): MovementWithNames[] {
  const resourceById = new Map(resources.map((item) => [item.id, item]))
  const shelterById = new Map(shelters.map((item) => [item.id, item]))

  return movements.map((movement) => ({
    ...movement,
    resource_name: resourceById.get(movement.resource_id)?.name ?? 'Recurso removido',
    resource_unit: resourceById.get(movement.resource_id)?.unit ?? '',
    origin_name: movement.origin_shelter_id
      ? (shelterById.get(movement.origin_shelter_id)?.name ?? 'Abrigo removido')
      : null,
    destination_name: movement.destination_shelter_id
      ? (shelterById.get(movement.destination_shelter_id)?.name ?? 'Abrigo removido')
      : null,
  }))
}

/** Tudo que a tela de logistica precisa, em duas idas ao banco. */
export async function loadLogistics(movementLimit = 20): Promise<LogisticsView> {
  const [snapshot, movements] = await Promise.all([loadSnapshot(), listMovements(movementLimit)])

  return {
    snapshot,
    suggestions: distributionSuggestions(snapshot),
    movements: attachNames(movements, snapshot.resources, snapshot.shelters),
  }
}
