/**
 * Parametros do Motor de Priorizacao e Recomendacao baseado em regras.
 *
 * IMPORTANTE (contexto academico): os valores abaixo sao parametros
 * DEMONSTRATIVOS do prototipo, calibrados para a apresentacao. Nao sao normas
 * oficiais da Defesa Civil. Todo o comportamento do motor e deterministico:
 * a mesma entrada produz sempre a mesma saida (nao ha IA/ML envolvida).
 *
 * Alterar um valor aqui muda o comportamento de todo o sistema - e o unico
 * lugar que precisa ser ajustado para recalibrar os criterios.
 */

import type { OccurrenceStatus, PriorityLevel } from '../../types/domain'

// -----------------------------------------------------------------------------
// 1. Priorizacao de ocorrencias (score 0-100)
// -----------------------------------------------------------------------------

/** Pesos da formula de prioridade. A soma deve ser 1. */
export const PRIORITY_WEIGHTS = {
  severity: 0.4,
  affectedPeople: 0.3,
  resourceDeficit: 0.2,
  urgency: 0.1,
} as const

/** Severidade 1-5 convertida para escala 0-100. */
export const SEVERITY_SCORE: Readonly<Record<number, number>> = {
  1: 20,
  2: 40,
  3: 60,
  4: 80,
  5: 100,
}

/** Faixas de pessoas afetadas convertidas para escala 0-100. */
export const AFFECTED_PEOPLE_BANDS: ReadonlyArray<{ upTo: number; score: number }> = [
  { upTo: 10, score: 20 },
  { upTo: 50, score: 40 },
  { upTo: 100, score: 60 },
  { upTo: 500, score: 80 },
  { upTo: Number.POSITIVE_INFINITY, score: 100 },
]

/** Tempo em aberto no qual a urgencia atinge 100. */
export const URGENCY_SATURATION_HOURS = 24

/** Limites inferiores de cada classificacao de prioridade. */
export const PRIORITY_THRESHOLDS: ReadonlyArray<{ min: number; level: PriorityLevel }> = [
  { min: 80, level: 'critica' },
  { min: 60, level: 'alta' },
  { min: 40, level: 'moderada' },
  { min: 0, level: 'baixa' },
]

// -----------------------------------------------------------------------------
// 2. Recomendacao de abrigo (score 0-100)
// -----------------------------------------------------------------------------

/** Pesos da formula de recomendacao de abrigo. A soma deve ser 1. */
export const SHELTER_WEIGHTS = {
  vacancies: 0.35,
  distance: 0.3,
  infrastructure: 0.2,
  occupancy: 0.15,
} as const

/** Distancia (km) a partir da qual o score de proximidade e zero. */
export const DISTANCE_SCORE_CAP_KM = 30

/** Score neutro usado quando falta coordenada na ocorrencia ou no abrigo. */
export const DISTANCE_SCORE_WHEN_UNKNOWN = 50

/** Quantidade de abrigos sugeridos por ocorrencia. */
export const MAX_SHELTER_RECOMMENDATIONS = 3

/** Itens de infraestrutura avaliados no score (peso igual entre eles). */
export const INFRASTRUCTURE_FEATURES = [
  'has_water',
  'has_food',
  'has_medical_support',
  'has_accessibility',
] as const

// -----------------------------------------------------------------------------
// 3. Logistica
// -----------------------------------------------------------------------------

/** Status que geram demanda de recursos (ocorrencia ainda em curso). */
export const DEMAND_STATUSES: ReadonlyArray<OccurrenceStatus> = [
  'aberta',
  'em_atendimento',
  'controlada',
]

/** Status considerados "ocorrencia ativa" nos indicadores. */
export const ACTIVE_STATUSES: ReadonlyArray<OccurrenceStatus> = [
  'aberta',
  'em_atendimento',
  'controlada',
]

/** Status considerados "ocorrencia atendida" no indicador de atendimento. */
export const HANDLED_STATUSES: ReadonlyArray<OccurrenceStatus> = [
  'em_atendimento',
  'controlada',
  'encerrada',
]

/** Quantidade maxima de acoes logisticas sugeridas por vez. */
export const MAX_DISTRIBUTION_SUGGESTIONS = 6
