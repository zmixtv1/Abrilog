/**
 * GET  /api/shelters - abrigos com vagas e ocupacao derivadas
 * POST /api/shelters - cadastro de abrigo
 */

import { occupancyPercentage, vacancies } from '@/lib/calculations/shelters'
import { createShelterRecord } from '@/lib/data/mutations'
import { loadSnapshot } from '@/lib/data/snapshot'
import { shelterSchema } from '@/lib/validation/schemas'
import { parsePayload } from '@/lib/validation/parse'
import { fail, ok, readJson, withSession, withWriter } from '@/lib/api/http'
import { SHELTER_STATUSES, type ShelterStatus } from '@/types/domain'

export async function GET(request: Request) {
  return withSession(async () => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const onlyAvailable = url.searchParams.get('available') === 'true'

    if (status && !SHELTER_STATUSES.includes(status as ShelterStatus)) {
      return fail(`Status invalido. Use: ${SHELTER_STATUSES.join(', ')}.`, 400)
    }

    const snapshot = await loadSnapshot()

    let shelters = snapshot.shelters
    if (status) shelters = shelters.filter((shelter) => shelter.status === status)
    if (onlyAvailable) {
      shelters = shelters.filter(
        (shelter) => shelter.status !== 'indisponivel' && vacancies(shelter) > 0,
      )
    }

    return ok({
      total: shelters.length,
      items: shelters.map((shelter) => ({
        ...shelter,
        vacancies: vacancies(shelter),
        occupancy_percentage: occupancyPercentage(shelter),
      })),
      totals: {
        capacity: snapshot.counters.total_capacity,
        occupancy: snapshot.counters.total_occupancy,
        available_vacancies: snapshot.counters.available_vacancies,
        occupancy_rate: snapshot.indicators.shelterOccupancyRate,
      },
    })
  })
}

export async function POST(request: Request) {
  return withWriter(async () => {
    const body = await readJson(request)
    if (!body) return fail('Corpo da requisição deve ser um JSON válido.', 400)

    const parsed = parsePayload(shelterSchema, body)
    if (!parsed.success) return fail(parsed.message, 422, parsed.errors)

    const id = await createShelterRecord(parsed.data)
    return ok({ id, created: true }, 201)
  })
}
