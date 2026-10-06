/**
 * MOTOR DE RECOMENDACAO LOGISTICA
 *
 * Para cada recurso em deficit, sugere UMA acao concreta:
 *   - transferencia: existe abrigo com estoque sobrando -> move o que for possivel;
 *   - entrada: nao existe estoque na rede -> aquisicao/doacao externa.
 *
 * Destino preferencial: abrigo recomendado para a ocorrencia de maior
 * prioridade. Empates sao resolvidos por maior ocupacao (quem esta mais
 * pressionado recebe primeiro).
 */

import type { MovementType, PriorityLevel, ShelterInput } from '../../types/domain'
import type { ResourceBalance } from '../calculations/deficit'
import { stockByShelter } from '../calculations/demand'
import { occupancyPercentage } from '../calculations/shelters'
import { MAX_DISTRIBUTION_SUGGESTIONS } from '../calculations/parameters'
import { round } from '../calculations/math'

export interface DistributionTarget {
  shelter_id: string
  occurrence_id: string
  occurrence_title: string
  priority_score: number
  priority_level: PriorityLevel
}

export interface DistributionSuggestion {
  resource_id: string
  resource_name: string
  unit: string
  quantity: number
  movement_type: Extract<MovementType, 'entrada' | 'transferencia'>
  origin_shelter_id: string | null
  origin_shelter_name: string | null
  destination_shelter_id: string
  destination_shelter_name: string
  deficit: number
  priority: PriorityLevel
  occurrence_id: string | null
  occurrence_title: string | null
  reason: string
}

export interface DistributionInput {
  balances: ResourceBalance[]
  stock: Array<{ shelter_id: string; resource_id: string; quantity: number }>
  shelters: ShelterInput[]
  /** Abrigos recomendados, do mais prioritario para o menos prioritario. */
  targets: DistributionTarget[]
}

/** Abrigo que mais precisa receber recurso quando nao ha recomendacao vinculada. */
function fallbackDestination(shelters: ShelterInput[]): ShelterInput | null {
  const operational = shelters.filter((shelter) => shelter.status !== 'indisponivel')
  if (operational.length === 0) return null

  return [...operational].sort(
    (a, b) => occupancyPercentage(b) - occupancyPercentage(a) || a.name.localeCompare(b.name),
  )[0]
}

/**
 * Sugestoes de distribuicao, da mais urgente para a menos urgente.
 * Considera o estoque ja comprometido dentro da propria rodada de sugestoes,
 * evitando propor duas vezes a mesma unidade do mesmo abrigo.
 */
export function suggestDistribution({
  balances,
  stock,
  shelters,
  targets,
}: DistributionInput): DistributionSuggestion[] {
  const shelterById = new Map(shelters.map((shelter) => [shelter.id, shelter]))
  const reserved = new Map<string, number>() // `${shelter_id}:${resource_id}` -> reservado
  const suggestions: DistributionSuggestion[] = []

  const deficits = balances
    .filter((balance) => balance.deficit > 0)
    .sort((a, b) => b.deficitScore - a.deficitScore || b.deficit - a.deficit)

  // Abrigos recomendados, sem repeticao, mantendo a ordem de prioridade.
  const candidates: DistributionTarget[] = []
  for (const target of targets) {
    if (!shelterById.has(target.shelter_id)) continue
    if (candidates.some((item) => item.shelter_id === target.shelter_id)) continue
    candidates.push(target)
  }

  for (const balance of deficits) {
    if (suggestions.length >= MAX_DISTRIBUTION_SUGGESTIONS) break

    const perShelter = stockByShelter(stock, balance.resource_id)

    // Destino: entre os abrigos recomendados, aquele com MENOS estoque deste
    // recurso - e onde a falta pesa mais. Empate resolvido pela prioridade da
    // ocorrencia (os candidatos ja vem ordenados por score).
    let target: DistributionTarget | null = null
    let lowestStock = Number.POSITIVE_INFINITY
    for (const candidate of candidates) {
      const available = perShelter.get(candidate.shelter_id) ?? 0
      if (available < lowestStock) {
        lowestStock = available
        target = candidate
      }
    }

    const destination = target
      ? (shelterById.get(target.shelter_id) as ShelterInput)
      : fallbackDestination(shelters)

    if (!destination) continue

    // Origem: maior estoque disponivel do recurso, fora do destino.
    let origin: { shelter: ShelterInput; available: number } | null = null

    for (const [shelterId, quantity] of perShelter) {
      if (shelterId === destination.id) continue
      const shelter = shelterById.get(shelterId)
      if (!shelter) continue

      const available = quantity - (reserved.get(`${shelterId}:${balance.resource_id}`) ?? 0)
      if (available <= 0) continue
      if (!origin || available > origin.available) origin = { shelter, available }
    }

    const quantity = origin ? Math.min(balance.deficit, origin.available) : balance.deficit
    if (quantity <= 0) continue

    const movementType: DistributionSuggestion['movement_type'] = origin
      ? 'transferencia'
      : 'entrada'

    if (origin) {
      const key = `${origin.shelter.id}:${balance.resource_id}`
      reserved.set(key, (reserved.get(key) ?? 0) + quantity)
    }

    const reasonParts = [
      `Deficit de ${balance.deficit} ${balance.unit} (${round(balance.deficitScore, 0)}% da demanda sem cobertura)`,
      `ocupacao do abrigo destino em ${round(occupancyPercentage(destination), 0)}%`,
    ]
    if (target) {
      reasonParts.push(
        `ocorrencia prioritaria: ${target.occurrence_title} (score ${round(target.priority_score, 1)})`,
      )
    }
    if (!origin) {
      reasonParts.push('sem estoque disponivel na rede - requer aquisicao ou doacao externa')
    }

    suggestions.push({
      resource_id: balance.resource_id,
      resource_name: balance.resource_name,
      unit: balance.unit,
      quantity,
      movement_type: movementType,
      origin_shelter_id: origin ? origin.shelter.id : null,
      origin_shelter_name: origin ? origin.shelter.name : null,
      destination_shelter_id: destination.id,
      destination_shelter_name: destination.name,
      deficit: balance.deficit,
      priority: balance.priority,
      occurrence_id: target ? target.occurrence_id : null,
      occurrence_title: target ? target.occurrence_title : null,
      reason: `${reasonParts.join(' + ')}.`,
    })
  }

  return suggestions
}
