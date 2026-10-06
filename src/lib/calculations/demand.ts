/**
 * ESTIMATIVA DE DEMANDA DE RECURSOS
 *
 * demanda(recurso) = ceil(pessoas_afetadas x demand_per_person)
 *
 * `demand_per_person` fica no catalogo de recursos (tabela recursos), o que
 * permite recalibrar o parametro sem alterar codigo. Exemplos usados no
 * prototipo: agua 5 L/pessoa, refeicoes 3/pessoa/dia, cobertor 1/pessoa.
 */

import type { OccurrenceInput, ResourceInput } from '../../types/domain'
import { DEMAND_STATUSES } from './parameters'
import { toNumber } from './math'

export interface DemandLine {
  resource_id: string
  resource_name: string
  unit: string
  demand_per_person: number
  people: number
  demand: number
}

/** Demanda de cada recurso para um contingente de pessoas. */
export function estimateDemand(resources: ResourceInput[], people: number): DemandLine[] {
  const total = Math.max(0, Math.trunc(toNumber(people)))

  return resources.map((resource) => {
    const perPerson = Math.max(0, toNumber(resource.demand_per_person))
    return {
      resource_id: resource.id,
      resource_name: resource.name,
      unit: resource.unit,
      demand_per_person: perPerson,
      people: total,
      demand: total === 0 || perPerson === 0 ? 0 : Math.ceil(total * perPerson),
    }
  })
}

/** True quando a ocorrencia ainda gera demanda (nao encerrada). */
export function generatesDemand(occurrence: Pick<OccurrenceInput, 'status'>): boolean {
  return DEMAND_STATUSES.includes(occurrence.status ?? 'aberta')
}

/**
 * Demanda total por recurso, somando todas as ocorrencias em curso.
 * O arredondamento e feito por ocorrencia (cada ocorrencia precisa de itens
 * inteiros), por isso o total nao e simplesmente o total de pessoas x taxa.
 */
export function totalDemandByResource(
  occurrences: OccurrenceInput[],
  resources: ResourceInput[],
): Map<string, number> {
  const totals = new Map<string, number>(resources.map((resource) => [resource.id, 0]))

  for (const occurrence of occurrences) {
    if (!generatesDemand(occurrence)) continue
    for (const line of estimateDemand(resources, occurrence.affected_people)) {
      totals.set(line.resource_id, (totals.get(line.resource_id) ?? 0) + line.demand)
    }
  }

  return totals
}

/** Estoque consolidado por recurso (soma de todos os abrigos informados). */
export function totalStockByResource(
  stock: Array<{ resource_id: string; quantity: number }>,
): Map<string, number> {
  const totals = new Map<string, number>()
  for (const row of stock) {
    totals.set(row.resource_id, (totals.get(row.resource_id) ?? 0) + toNumber(row.quantity))
  }
  return totals
}

/** Estoque de um recurso especifico, agrupado por abrigo. */
export function stockByShelter(
  stock: Array<{ shelter_id: string; resource_id: string; quantity: number }>,
  resourceId: string,
): Map<string, number> {
  const totals = new Map<string, number>()
  for (const row of stock) {
    if (row.resource_id !== resourceId) continue
    totals.set(row.shelter_id, (totals.get(row.shelter_id) ?? 0) + toNumber(row.quantity))
  }
  return totals
}
