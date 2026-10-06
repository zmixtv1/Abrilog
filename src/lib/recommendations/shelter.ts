/**
 * MOTOR DE RECOMENDACAO DE ABRIGO
 *
 * abrigo_score = vagas x 0,35 + distancia x 0,30
 *              + infraestrutura x 0,20 + ocupacao x 0,15
 *
 * Criterios eliminatorios (o abrigo nem entra no ranking):
 *   1. abrigo indisponivel;
 *   2. abrigo sem vagas.
 *
 * O resultado e uma SUGESTAO para o operador - a decisao final e humana.
 */

import type { OccurrenceInput, ShelterInput } from '../../types/domain'
import { distanceKm } from '../calculations/geo'
import { clamp, round } from '../calculations/math'
import {
  DISTANCE_SCORE_CAP_KM,
  DISTANCE_SCORE_WHEN_UNKNOWN,
  MAX_SHELTER_RECOMMENDATIONS,
  SHELTER_WEIGHTS,
} from '../calculations/parameters'
import {
  canReceivePeople,
  infrastructureCount,
  infrastructureScore,
  occupancyPercentage,
  vacancies,
} from '../calculations/shelters'

export interface ShelterRecommendationComponents {
  vacancies: number
  distance: number
  infrastructure: number
  occupancy: number
}

export interface ShelterRecommendation {
  shelter_id: string
  shelter_name: string
  score: number
  /** null quando falta coordenada na ocorrencia ou no abrigo. */
  distance_km: number | null
  vacancies: number
  capacity: number
  occupancy_percentage: number
  infrastructure_items: number
  /** Percentual das pessoas afetadas que o abrigo consegue acolher. */
  coverage_percentage: number
  components: ShelterRecommendationComponents
  weights: typeof SHELTER_WEIGHTS
  reasons: string[]
}

/** Proximidade: 100 no local da ocorrencia, 0 a partir do limite configurado. */
export function distanceScore(km: number | null): number {
  if (km === null) return DISTANCE_SCORE_WHEN_UNKNOWN
  return clamp((1 - km / DISTANCE_SCORE_CAP_KM) * 100)
}

/** Cobertura da demanda: vagas suficientes para as pessoas afetadas = 100. */
export function vacanciesScore(availableVacancies: number, affectedPeople: number): number {
  if (affectedPeople <= 0) return availableVacancies > 0 ? 100 : 0
  return clamp((availableVacancies / affectedPeople) * 100)
}

function buildReasons(
  recommendation: Omit<ShelterRecommendation, 'reasons'>,
  affectedPeople: number,
): string[] {
  const reasons: string[] = []

  if (recommendation.distance_km !== null) {
    reasons.push(`${recommendation.distance_km.toFixed(1).replace('.', ',')} km da ocorrencia`)
  } else {
    reasons.push('Distancia nao calculada (coordenada ausente)')
  }

  reasons.push(`${recommendation.vacancies} vagas livres`)

  if (affectedPeople > 0) {
    reasons.push(
      recommendation.coverage_percentage >= 100
        ? 'Comporta todas as pessoas afetadas'
        : `Comporta ${recommendation.coverage_percentage.toFixed(0)}% das pessoas afetadas`,
    )
  }

  reasons.push(`Ocupacao atual de ${recommendation.occupancy_percentage.toFixed(0)}%`)
  reasons.push(`${recommendation.infrastructure_items} de 4 itens de infraestrutura`)

  return reasons
}

/**
 * Ranking dos melhores abrigos para uma ocorrencia.
 * Retorna no maximo `limit` abrigos (default 3).
 */
export function recommendShelters(
  occurrence: Pick<OccurrenceInput, 'latitude' | 'longitude' | 'affected_people'>,
  shelters: ShelterInput[],
  limit: number = MAX_SHELTER_RECOMMENDATIONS,
): ShelterRecommendation[] {
  const affectedPeople = Math.max(0, occurrence.affected_people ?? 0)

  const ranked = shelters.filter(canReceivePeople).map((shelter) => {
    const available = vacancies(shelter)
    const occupancy = occupancyPercentage(shelter)
    const km = distanceKm(occurrence, shelter)

    const components: ShelterRecommendationComponents = {
      vacancies: round(vacanciesScore(available, affectedPeople), 1),
      distance: round(distanceScore(km), 1),
      infrastructure: infrastructureScore(shelter),
      occupancy: round(clamp(100 - occupancy), 1),
    }

    const score = round(
      clamp(
        components.vacancies * SHELTER_WEIGHTS.vacancies +
          components.distance * SHELTER_WEIGHTS.distance +
          components.infrastructure * SHELTER_WEIGHTS.infrastructure +
          components.occupancy * SHELTER_WEIGHTS.occupancy,
      ),
      1,
    )

    const base: Omit<ShelterRecommendation, 'reasons'> = {
      shelter_id: shelter.id,
      shelter_name: shelter.name,
      score,
      distance_km: km,
      vacancies: available,
      capacity: shelter.capacity,
      occupancy_percentage: occupancy,
      infrastructure_items: infrastructureCount(shelter),
      coverage_percentage:
        affectedPeople > 0 ? round(clamp((available / affectedPeople) * 100), 1) : 100,
      components,
      weights: SHELTER_WEIGHTS,
    }

    return { ...base, reasons: buildReasons(base, affectedPeople) }
  })

  return ranked
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.distance_km ?? Number.POSITIVE_INFINITY) - (b.distance_km ?? Number.POSITIVE_INFINITY) ||
        a.shelter_name.localeCompare(b.shelter_name),
    )
    .slice(0, Math.max(1, limit))
}
