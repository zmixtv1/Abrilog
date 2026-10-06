/**
 * GET  /api/occurrences  - lista com prioridade calculada (filtros opcionais)
 * POST /api/occurrences  - registra ocorrencia + pessoas afetadas + recomendacao
 */

import { createOccurrenceRecord } from '@/lib/data/mutations'
import { loadSnapshot } from '@/lib/data/snapshot'
import { occurrenceSchema } from '@/lib/validation/schemas'
import { parsePayload } from '@/lib/validation/parse'
import { fail, ok, readJson, withSession, withWriter } from '@/lib/api/http'
import { OCCURRENCE_STATUSES, OCCURRENCE_TYPES } from '@/types/domain'
import type { OccurrenceStatus, OccurrenceType } from '@/types/domain'

export async function GET(request: Request) {
  return withSession(async () => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')
    const city = url.searchParams.get('city')
    const minSeverity = Number(url.searchParams.get('min_severity') ?? '')
    const minScore = Number(url.searchParams.get('min_score') ?? '')
    const limit = Number(url.searchParams.get('limit') ?? '')

    if (status && !OCCURRENCE_STATUSES.includes(status as OccurrenceStatus)) {
      return fail(`Status invalido. Use: ${OCCURRENCE_STATUSES.join(', ')}.`, 400)
    }
    if (type && !OCCURRENCE_TYPES.includes(type as OccurrenceType)) {
      return fail(`Tipo invalido. Use: ${OCCURRENCE_TYPES.join(', ')}.`, 400)
    }

    const snapshot = await loadSnapshot()

    let items = snapshot.prioritized
    if (status) items = items.filter((item) => item.occurrence.status === status)
    if (type) items = items.filter((item) => item.occurrence.type === type)
    if (city) {
      const needle = city.toLowerCase()
      items = items.filter((item) => item.occurrence.city.toLowerCase().includes(needle))
    }
    if (Number.isFinite(minSeverity)) {
      items = items.filter((item) => item.occurrence.severity >= minSeverity)
    }
    if (Number.isFinite(minScore)) {
      items = items.filter((item) => item.priority.score >= minScore)
    }
    if (Number.isFinite(limit) && limit > 0) items = items.slice(0, limit)

    return ok({
      total: items.length,
      items: items.map((item) => ({
        ...item.occurrence,
        priority: item.priority,
        resource_demand: item.demand,
      })),
      generated_at: snapshot.generatedAt,
    })
  })
}

export async function POST(request: Request) {
  return withWriter(async (session) => {
    const body = await readJson(request)
    if (!body) return fail('Corpo da requisição deve ser um JSON válido.', 400)

    const parsed = parsePayload(occurrenceSchema, body)
    if (!parsed.success) return fail(parsed.message, 422, parsed.errors)

    const created = await createOccurrenceRecord(parsed.data, session.userId)

    return ok(
      {
        id: created.id,
        affected_people: created.affected_people,
        recommended_shelters: created.recommendations,
      },
      201,
    )
  })
}
