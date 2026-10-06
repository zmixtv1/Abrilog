/** GET /api/logistics/deficits - demanda x estoque x deficit por recurso. */

import { loadSnapshot } from '@/lib/data/snapshot'
import { ok, withSession } from '@/lib/api/http'

export async function GET(request: Request) {
  return withSession(async () => {
    const url = new URL(request.url)
    const onlyDeficit = url.searchParams.get('only_deficit') === 'true'

    const snapshot = await loadSnapshot()
    const items = onlyDeficit ? snapshot.deficits : snapshot.balances

    return ok({
      total: items.length,
      items,
      summary: {
        system_deficit_score: snapshot.systemDeficitScore,
        logistics_coverage_rate: snapshot.indicators.logisticsCoverageRate,
        resources_in_deficit: snapshot.indicators.resourcesInDeficitCount,
        resources_below_minimum: snapshot.indicators.resourcesBelowMinimumCount,
        /** Soma bruta: unidades diferentes, serve como ordem de grandeza. */
        total_deficit_units: snapshot.indicators.totalDeficitUnits,
      },
      generated_at: snapshot.generatedAt,
    })
  })
}
