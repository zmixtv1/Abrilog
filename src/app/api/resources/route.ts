/**
 * GET  /api/resources - catalogo com estoque consolidado, demanda e deficit
 * POST /api/resources - cadastro de recurso
 */

import { createResourceRecord } from '@/lib/data/mutations'
import { loadSnapshot } from '@/lib/data/snapshot'
import { resourceSchema } from '@/lib/validation/schemas'
import { parsePayload } from '@/lib/validation/parse'
import { fail, ok, readJson, withSession, withWriter } from '@/lib/api/http'

export async function GET() {
  return withSession(async () => {
    const snapshot = await loadSnapshot()

    return ok({
      total: snapshot.balances.length,
      items: snapshot.balances,
      stock_by_shelter: snapshot.stock,
      system_deficit_score: snapshot.systemDeficitScore,
      generated_at: snapshot.generatedAt,
    })
  })
}

export async function POST(request: Request) {
  return withWriter(async () => {
    const body = await readJson(request)
    if (!body) return fail('Corpo da requisição deve ser um JSON válido.', 400)

    const parsed = parsePayload(resourceSchema, body)
    if (!parsed.success) return fail(parsed.message, 422, parsed.errors)

    const id = await createResourceRecord(parsed.data)
    return ok({ id, created: true }, 201)
  })
}
