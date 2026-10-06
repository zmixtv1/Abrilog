/**
 * GET /api/map - marcadores do mapa operacional.
 *
 * Cor do marcador de ocorrencia segue a prioridade calculada:
 * critica = vermelho | alta = laranja | demais = amarelo. Abrigos = azul.
 */

import { occupancyPercentage, vacancies } from '@/lib/calculations/shelters'
import { activeOccurrences, loadSnapshot } from '@/lib/data/snapshot'
import { ok, withSession } from '@/lib/api/http'
import type { PriorityLevel } from '@/types/domain'

function markerColor(level: PriorityLevel): string {
  if (level === 'critica') return 'vermelho'
  if (level === 'alta') return 'laranja'
  return 'amarelo'
}

export async function GET() {
  return withSession(async () => {
    const snapshot = await loadSnapshot()

    const occurrences = activeOccurrences(snapshot)
      .filter((item) => item.occurrence.latitude !== null && item.occurrence.longitude !== null)
      .map((item) => ({
        id: item.occurrence.id,
        kind: 'ocorrencia' as const,
        title: item.occurrence.title,
        type: item.occurrence.type,
        severity: item.occurrence.severity,
        status: item.occurrence.status,
        affected_people: item.occurrence.affected_people,
        priority_level: item.priority.level,
        priority_score: item.priority.score,
        marker_color: markerColor(item.priority.level),
        latitude: item.occurrence.latitude,
        longitude: item.occurrence.longitude,
      }))

    const shelters = snapshot.shelters
      .filter((shelter) => shelter.latitude !== null && shelter.longitude !== null)
      .map((shelter) => ({
        id: shelter.id,
        kind: 'abrigo' as const,
        name: shelter.name,
        status: shelter.status,
        capacity: shelter.capacity,
        occupancy: shelter.current_occupancy,
        vacancies: vacancies(shelter),
        occupancy_percentage: occupancyPercentage(shelter),
        marker_color: 'azul',
        latitude: shelter.latitude,
        longitude: shelter.longitude,
      }))

    return ok({
      occurrences,
      shelters,
      center: { latitude: -15.7939, longitude: -47.8828 },
      generated_at: snapshot.generatedAt,
    })
  })
}
