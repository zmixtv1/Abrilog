/**
 * POST /api/recommendations/shelter
 *
 * Executa o motor de recomendacao para uma ocorrencia e devolve os 3 melhores
 * abrigos com score, distancia e justificativa. Com `persist: true`, grava o
 * resultado em occurrence_shelters (exige perfil com permissao de escrita).
 */

import { computeAndSaveRecommendations } from '@/lib/data/mutations'
import { loadSnapshot, sheltersForOccurrence } from '@/lib/data/snapshot'
import { recommendationRequestSchema } from '@/lib/validation/schemas'
import { parsePayload } from '@/lib/validation/parse'
import { fail, ok, readJson, withSession } from '@/lib/api/http'

export async function POST(request: Request) {
  return withSession(async (session) => {
    const body = await readJson(request)
    if (!body) return fail('Corpo da requisição deve ser um JSON válido.', 400)

    const parsed = parsePayload(recommendationRequestSchema, body)
    if (!parsed.success) return fail(parsed.message, 422, parsed.errors)

    const { occurrence_id: occurrenceId, persist } = parsed.data

    if (persist && !session.canWrite) {
      return fail('Perfil sem permissão para gravar recomendações.', 403)
    }

    const snapshot = await loadSnapshot()
    const entry = snapshot.prioritized.find((item) => item.occurrence.id === occurrenceId)
    if (!entry) return fail('Ocorrência não encontrada.', 404)

    const recommendations = persist
      ? await computeAndSaveRecommendations(occurrenceId, {
          latitude: entry.occurrence.latitude,
          longitude: entry.occurrence.longitude,
          affected_people: entry.occurrence.affected_people,
        })
      : sheltersForOccurrence(snapshot, entry.occurrence)

    return ok({
      occurrence: {
        id: entry.occurrence.id,
        title: entry.occurrence.title,
        affected_people: entry.occurrence.affected_people,
        priority: entry.priority,
      },
      persisted: persist,
      total: recommendations.length,
      items: recommendations,
      generated_at: snapshot.generatedAt,
    })
  })
}
