/**
 * Calculos derivados de abrigo.
 *
 * vagas e taxa de ocupacao NUNCA sao armazenados no banco: sao sempre
 * calculados a partir de capacity e current_occupancy.
 */

import type { ShelterInput, ShelterStatus } from '../../types/domain'
import { INFRASTRUCTURE_FEATURES } from './parameters'
import { clamp, percentage, round, toNumber } from './math'

type ShelterLike = Pick<ShelterInput, 'capacity' | 'current_occupancy'> &
  Partial<Pick<ShelterInput, 'status'>>

/** vagas = capacidade - ocupacao (nunca negativo). */
export function vacancies(shelter: ShelterLike): number {
  const capacity = Math.max(0, toNumber(shelter.capacity))
  const occupancy = Math.max(0, toNumber(shelter.current_occupancy))
  return Math.max(0, capacity - occupancy)
}

/** Taxa de ocupacao em percentual (0-100). */
export function occupancyPercentage(shelter: ShelterLike): number {
  const capacity = Math.max(0, toNumber(shelter.capacity))
  if (capacity === 0) return 100
  return percentage(Math.min(toNumber(shelter.current_occupancy), capacity), capacity)
}

/**
 * Status derivado de capacidade x ocupacao.
 * `indisponivel` e decisao do operador e por isso e preservado
 * (mesma regra da trigger fn_abrigos_derive_status no banco).
 */
export function deriveShelterStatus(shelter: ShelterLike): ShelterStatus {
  if (shelter.status === 'indisponivel') return 'indisponivel'
  if (vacancies(shelter) === 0) return 'lotado'
  if (toNumber(shelter.current_occupancy) > 0) return 'parcialmente_ocupado'
  return 'disponivel'
}

/** Quantos itens de infraestrutura o abrigo possui (0-4). */
export function infrastructureCount(shelter: ShelterInput): number {
  return INFRASTRUCTURE_FEATURES.reduce(
    (count, feature) => count + (shelter[feature] ? 1 : 0),
    0,
  )
}

/** Score de infraestrutura 0-100 (peso igual entre os quatro itens). */
export function infrastructureScore(shelter: ShelterInput): number {
  return round(
    clamp((infrastructureCount(shelter) / INFRASTRUCTURE_FEATURES.length) * 100),
    1,
  )
}

/** Abrigo apto a receber pessoas: operacional e com vaga. */
export function canReceivePeople(shelter: ShelterInput): boolean {
  return shelter.status !== 'indisponivel' && vacancies(shelter) > 0
}
