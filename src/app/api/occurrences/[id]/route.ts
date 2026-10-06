/**
 * GET    /api/occurrences/[id] - detalhe com prioridade, demanda e recomendacoes
 * PATCH  /api/occurrences/[id] - atualizacao parcial
 * DELETE /api/occurrences/[id] - exclusao
 */

import { deleteOccurrenceRecord, updateOccurrenceRecord } from '@/lib/data/mutations'
import { getOccurrenceDetail } from '@/lib/data/occurrences'
import { occurrenceUpdateSchema } from '@/lib/validation/schemas'
import { parsePayload } from '@/lib/validation/parse'
import { fail, ok, readJson, withSession, withWriter } from '@/lib/api/http'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  return withSession(async () => {
    const { id } = await params
    const detail = await getOccurrenceDetail(id)
    if (!detail) return fail('Ocorrência não encontrada.', 404)

    return ok({
      occurrence: detail.occurrence,
      affected_people_breakdown: detail.affected,
      priority: detail.priority,
      resource_demand: detail.demand,
      resource_balances: detail.balances,
      recommended_shelters: detail.recommendations,
      saved_recommendations: detail.savedRecommendations,
    })
  })
}

export async function PATCH(request: Request, { params }: Context) {
  return withWriter(async () => {
    const { id } = await params
    const body = await readJson(request)
    if (!body) return fail('Corpo da requisição deve ser um JSON válido.', 400)

    const parsed = parsePayload(occurrenceUpdateSchema, body)
    if (!parsed.success) return fail(parsed.message, 422, parsed.errors)

    if (Object.keys(parsed.data).length === 0) {
      return fail('Informe ao menos um campo para atualizar.', 400)
    }

    await updateOccurrenceRecord(id, parsed.data)
    return ok({ id, updated: true })
  })
}

export async function DELETE(_request: Request, { params }: Context) {
  return withWriter(async () => {
    const { id } = await params
    await deleteOccurrenceRecord(id)
    return ok({ id, deleted: true })
  })
}
