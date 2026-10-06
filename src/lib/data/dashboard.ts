/**
 * Monta a visao do dashboard a partir do snapshot operacional.
 * Usada pela pagina /dashboard e pelo endpoint GET /api/dashboard.
 */

import { occupancyPercentage, vacancies } from '@/lib/calculations/shelters'
import { OCCURRENCE_TYPES } from '@/types/domain'
import { OCCURRENCE_TYPE_LABELS, SEVERITY_LABELS } from '@/lib/utils/labels'
import type { SystemIndicators } from '@/lib/calculations/indicators'

import {
  activeOccurrences,
  criticalOccurrences,
  loadSnapshot,
  type OperationalSnapshot,
  type PrioritizedOccurrence,
} from './snapshot'

export interface DashboardCards {
  activeOccurrences: number
  affectedPeople: number
  activeShelters: number
  availableVacancies: number
  resourcesInDeficit: number
  criticalOccurrences: number
}

export interface ChartSlice {
  label: string
  value: number
  /** Texto auxiliar (unidade, percentual). */
  hint?: string
}

export interface ShelterOccupancySlice {
  id: string
  name: string
  capacity: number
  occupancy: number
  vacancies: number
  percentage: number
}

export interface DashboardView {
  cards: DashboardCards
  charts: {
    occurrencesByType: ChartSlice[]
    occurrencesBySeverity: ChartSlice[]
    shelterOccupancy: ShelterOccupancySlice[]
    resourceDeficits: ChartSlice[]
  }
  indicators: SystemIndicators
  criticals: PrioritizedOccurrence[]
  snapshot: OperationalSnapshot
}

export function buildDashboard(snapshot: OperationalSnapshot): DashboardView {
  const active = activeOccurrences(snapshot)
  const criticals = criticalOccurrences(snapshot)

  const occurrencesByType: ChartSlice[] = OCCURRENCE_TYPES.map((type) => ({
    label: OCCURRENCE_TYPE_LABELS[type],
    value: active.filter((item) => item.occurrence.type === type).length,
  })).filter((slice) => slice.value > 0)

  const occurrencesBySeverity: ChartSlice[] = [5, 4, 3, 2, 1].map((severity) => ({
    label: `${severity} - ${SEVERITY_LABELS[severity]}`,
    value: active.filter((item) => item.occurrence.severity === severity).length,
  }))

  const shelterOccupancy: ShelterOccupancySlice[] = snapshot.shelters
    .map((shelter) => ({
      id: shelter.id,
      name: shelter.name,
      capacity: shelter.capacity,
      occupancy: shelter.current_occupancy,
      vacancies: vacancies(shelter),
      percentage: occupancyPercentage(shelter),
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const resourceDeficits: ChartSlice[] = snapshot.deficits.map((balance) => ({
    label: balance.resource_name,
    value: balance.deficit,
    hint: `${balance.unit} · cobertura ${balance.coverage}%`,
  }))

  return {
    cards: {
      activeOccurrences: Number(snapshot.counters.active_occurrences),
      affectedPeople: Number(snapshot.counters.affected_people),
      activeShelters: Number(snapshot.counters.active_shelters),
      availableVacancies: Number(snapshot.counters.available_vacancies),
      resourcesInDeficit: snapshot.deficits.length,
      criticalOccurrences: criticals.length,
    },
    charts: { occurrencesByType, occurrencesBySeverity, shelterOccupancy, resourceDeficits },
    indicators: snapshot.indicators,
    criticals,
    snapshot,
  }
}

export async function loadDashboard(): Promise<DashboardView> {
  return buildDashboard(await loadSnapshot())
}
