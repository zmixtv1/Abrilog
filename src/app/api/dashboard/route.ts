/** GET /api/dashboard - cartoes, graficos e indicadores agregados. */

import { loadDashboard } from '@/lib/data/dashboard'
import { ok, withSession } from '@/lib/api/http'

export async function GET() {
  return withSession(async () => {
    const dashboard = await loadDashboard()

    return ok({
      cards: dashboard.cards,
      charts: dashboard.charts,
      indicators: dashboard.indicators,
      critical_occurrences: dashboard.criticals.map((item) => ({
        id: item.occurrence.id,
        title: item.occurrence.title,
        type: item.occurrence.type,
        severity: item.occurrence.severity,
        status: item.occurrence.status,
        affected_people: item.occurrence.affected_people,
        priority: item.priority,
      })),
      generated_at: dashboard.snapshot.generatedAt,
    })
  })
}
