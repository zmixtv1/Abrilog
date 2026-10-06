/** Marcadores do mapa operacional (montados no servidor, exibidos no cliente). */

import type { OccurrenceStatus, OccurrenceType, PriorityLevel, ShelterStatus } from '@/types/domain'

export interface OccurrenceMarker {
  id: string
  title: string
  type: OccurrenceType
  severity: number
  status: OccurrenceStatus
  affected_people: number
  priority_level: PriorityLevel
  priority_score: number
  latitude: number
  longitude: number
}

export interface ShelterMarker {
  id: string
  name: string
  status: ShelterStatus
  capacity: number
  occupancy: number
  vacancies: number
  occupancy_percentage: number
  latitude: number
  longitude: number
}

export interface MapData {
  occurrences: OccurrenceMarker[]
  shelters: ShelterMarker[]
  center: { latitude: number; longitude: number }
}

/** Vermelho = critica | laranja = alta | amarelo = demais. */
export function occurrenceColor(level: PriorityLevel): string {
  if (level === 'critica') return '#dc2626'
  if (level === 'alta') return '#ea580c'
  return '#ca8a04'
}

export const SHELTER_COLOR = '#1d4ed8'
