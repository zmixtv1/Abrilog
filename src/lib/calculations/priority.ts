/**
 * MOTOR DE PRIORIZACAO DE OCORRENCIAS
 *
 * score = severidade x 0,40 + pessoas_afetadas x 0,30
 *       + deficit_recursos x 0,20 + urgencia x 0,10
 *
 * Algoritmo deterministico baseado em regras (sem IA/ML): a mesma entrada
 * sempre produz o mesmo score, o que permite auditar a decisao.
 */

import type { OccurrenceInput, PriorityLevel } from '../../types/domain'
import { clamp, round } from './math'
import {
  AFFECTED_PEOPLE_BANDS,
  PRIORITY_THRESHOLDS,
  PRIORITY_WEIGHTS,
  SEVERITY_SCORE,
  URGENCY_SATURATION_HOURS,
} from './parameters'

export interface PriorityComponents {
  severity: number
  affectedPeople: number
  resourceDeficit: number
  urgency: number
}

export interface PriorityResult {
  score: number
  level: PriorityLevel
  components: PriorityComponents
  weights: typeof PRIORITY_WEIGHTS
  hoursOpen: number
}

/** Severidade 1-5 -> 20/40/60/80/100. */
export function severityScore(severity: number): number {
  const normalized = Math.round(clamp(severity, 1, 5))
  return SEVERITY_SCORE[normalized] ?? 0
}

/** Pessoas afetadas -> escala por faixas (0 pessoas = 0 ponto). */
export function affectedPeopleScore(people: number): number {
  if (!Number.isFinite(people) || people <= 0) return 0
  const band = AFFECTED_PEOPLE_BANDS.find((item) => people <= item.upTo)
  return band ? band.score : 100
}

/** Horas decorridas desde a abertura da ocorrencia (nunca negativo). */
export function hoursSince(createdAt: string | Date, now: Date = new Date()): number {
  const opened = createdAt instanceof Date ? createdAt : new Date(createdAt)
  const openedMs = opened.getTime()
  if (!Number.isFinite(openedMs)) return 0
  return Math.max(0, (now.getTime() - openedMs) / 3_600_000)
}

/**
 * Urgencia pelo tempo em aberto: cresce linearmente ate saturar em 100.
 * Ocorrencia encerrada nao acumula urgencia.
 */
export function urgencyScore(
  createdAt: string | Date,
  now: Date = new Date(),
  isClosed = false,
): number {
  if (isClosed) return 0
  const hours = hoursSince(createdAt, now)
  return clamp((hours / URGENCY_SATURATION_HOURS) * 100)
}

/** Classifica o score: 0-39 baixa | 40-59 moderada | 60-79 alta | 80-100 critica. */
export function priorityLevel(score: number): PriorityLevel {
  const value = clamp(score)
  const band = PRIORITY_THRESHOLDS.find((item) => value >= item.min)
  return band ? band.level : 'baixa'
}

/**
 * Calcula a prioridade de uma ocorrencia.
 *
 * @param deficitScore 0-100, parcela da demanda da ocorrencia sem cobertura de
 *   estoque (vem do motor de deficit). Default 0 quando nao informado.
 */
export function calculateOccurrencePriority(
  occurrence: OccurrenceInput,
  deficitScore = 0,
  now: Date = new Date(),
): PriorityResult {
  const isClosed = occurrence.status === 'encerrada'

  const components: PriorityComponents = {
    severity: severityScore(occurrence.severity),
    affectedPeople: affectedPeopleScore(occurrence.affected_people),
    resourceDeficit: clamp(deficitScore),
    urgency: urgencyScore(occurrence.created_at, now, isClosed),
  }

  const score =
    components.severity * PRIORITY_WEIGHTS.severity +
    components.affectedPeople * PRIORITY_WEIGHTS.affectedPeople +
    components.resourceDeficit * PRIORITY_WEIGHTS.resourceDeficit +
    components.urgency * PRIORITY_WEIGHTS.urgency

  const rounded = round(clamp(score), 1)

  return {
    score: rounded,
    level: priorityLevel(rounded),
    components: {
      severity: round(components.severity, 1),
      affectedPeople: round(components.affectedPeople, 1),
      resourceDeficit: round(components.resourceDeficit, 1),
      urgency: round(components.urgency, 1),
    },
    weights: PRIORITY_WEIGHTS,
    hoursOpen: round(hoursSince(occurrence.created_at, now), 1),
  }
}

/** Ordena ocorrencias da mais critica para a menos critica. */
export function sortByPriority<T extends { priority: PriorityResult }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.priority.score - a.priority.score)
}
