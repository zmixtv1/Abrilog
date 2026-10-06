/**
 * GET   /api/shelters/[id] - detalhe com estoque, movimentacoes e vinculos
 * PATCH /api/shelters/[id] - atualizacao parcial (inclui ocupacao)
 */

import { updateShelterRecord } from '@/lib/data/mutations'
import { getShelterDetail } from '@/lib/data/shelters'
import { shelterUpdateSchema } from '@/lib/validation/schemas'
import { definedFields, parsePayload } from '@/lib/validation/parse'
import { fail, ok, readJson, withSession, withWriter } from '@/lib/api/http'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  return withSession(async () => {
    const { id } = await params
    const detail = await getShelterDetail(id)
    if (!detail) return fail('Abrigo não encontrado.', 404)

    return ok({
      shelter: detail.shelter,
      vacancies: detail.vacancies,
      occupancy_percentage: detail.occupancyPercentage,
      stock: detail.stock.map((line) => ({
        resource_id: line.resource.id,
        resource_name: line.resource.name,
        unit: line.resource.unit,
        quantity: line.quantity,
        minimum_stock: line.resource.minimum_stock,
        below_minimum: line.belowMinimum,
      })),
      movements: detail.movements,
      linked_occurrences: detail.linkedOccurrences.map((item) => ({
        id: item.occurrence.id,
        title: item.occurrence.title,
        status: item.occurrence.status,
        score: item.score,
        distance_km: item.distance_km,
      })),
    })
  })
}

export async function PATCH(request: Request, { params }: Context) {
  return withWriter(async () => {
    const { id } = await params
    const body = await readJson(request)
    if (!body) return fail('Corpo da requisição deve ser um JSON válido.', 400)

    const parsed = parsePayload(shelterUpdateSchema, body)
    if (!parsed.success) return fail(parsed.message, 422, parsed.errors)

    const patch = definedFields(parsed.data)
    if (Object.keys(patch).length === 0) {
      return fail('Informe ao menos um campo para atualizar.', 400)
    }

    await updateShelterRecord(id, patch)
    return ok({ id, updated: true })
  })
}
