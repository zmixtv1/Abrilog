/**
 * GET  /api/movements - historico logistico
 * POST /api/movements - registra movimentacao e atualiza o estoque (transacional)
 */

import { registerMovementRecord } from '@/lib/data/mutations'
import { attachNames, listMovements } from '@/lib/data/logistics'
import { loadSnapshot } from '@/lib/data/snapshot'
import { movementSchema } from '@/lib/validation/schemas'
import { parsePayload } from '@/lib/validation/parse'
import { fail, ok, readJson, withSession, withWriter } from '@/lib/api/http'

export async function GET(request: Request) {
  return withSession(async () => {
    const url = new URL(request.url)
    const limitParam = Number(url.searchParams.get('limit') ?? '')
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : 30

    const [snapshot, movements] = await Promise.all([loadSnapshot(), listMovements(limit)])

    return ok({
      total: movements.length,
      items: attachNames(movements, snapshot.resources, snapshot.shelters),
    })
  })
}

export async function POST(request: Request) {
  return withWriter(async () => {
    const body = await readJson(request)
    if (!body) return fail('Corpo da requisição deve ser um JSON válido.', 400)

    const parsed = parsePayload(movementSchema, body)
    if (!parsed.success) return fail(parsed.message, 422, parsed.errors)

    const id = await registerMovementRecord(parsed.data)
    return ok({ id, registered: true }, 201)
  })
}
