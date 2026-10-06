/** GET /api/logistics/recommendations - acoes de distribuicao sugeridas. */

import { distributionSuggestions, loadSnapshot } from '@/lib/data/snapshot'
import { ok, withSession } from '@/lib/api/http'

export async function GET() {
  return withSession(async () => {
    const snapshot = await loadSnapshot()
    const suggestions = distributionSuggestions(snapshot)

    return ok({
      total: suggestions.length,
      items: suggestions,
      context: {
        system_deficit_score: snapshot.systemDeficitScore,
        logistics_coverage_rate: snapshot.indicators.logisticsCoverageRate,
      },
      generated_at: snapshot.generatedAt,
    })
  })
}
