'use server'

/** Server Actions de ocorrencias (registro, status, exclusao e recomendacao). */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireSession } from '@/lib/auth/session'
import {
  computeAndSaveRecommendations,
  createOccurrenceRecord,
  deleteOccurrenceRecord,
  updateOccurrenceStatusRecord,
} from '@/lib/data/mutations'
import { DataError } from '@/lib/data/query'
import { occurrenceSchema } from '@/lib/validation/schemas'
import { OCCURRENCE_STATUSES, type OccurrenceStatus } from '@/types/domain'
import { formNumber, formText, numberOr, parsePayload, requiredNumber } from '@/lib/validation/parse'
import { READ_ONLY_MESSAGE, errorState, successState, type ActionState } from './state'

/** Revalida todas as telas afetadas por uma mudanca em ocorrencias. */
function revalidateOccurrences(id?: string): void {
  revalidatePath('/dashboard')
  revalidatePath('/ocorrencias')
  revalidatePath('/logistica')
  revalidatePath('/mapa')
  if (id) revalidatePath(`/ocorrencias/${id}`)
}

/** Converte DataError em estado de formulario; repassa o resto (ex.: redirect). */
function asErrorState(error: unknown): ActionState {
  if (error instanceof DataError) return errorState(error.message)
  throw error
}

function readOccurrenceForm(formData: FormData) {
  return {
    title: formText(formData, 'title') ?? '',
    description: formText(formData, 'description'),
    type: formText(formData, 'type') ?? '',
    severity: requiredNumber(formData, 'severity'),
    status: formText(formData, 'status') ?? 'aberta',
    city: formText(formData, 'city') ?? 'Brasilia',
    state: formText(formData, 'state') ?? 'DF',
    neighborhood: formText(formData, 'neighborhood'),
    latitude: formNumber(formData, 'latitude'),
    longitude: formNumber(formData, 'longitude'),
    affected_families: numberOr(formData, 'affected_families', 0),
    affected_people: numberOr(formData, 'affected_people', 0),
    affected: {
      adults: numberOr(formData, 'adults', 0),
      children: numberOr(formData, 'children', 0),
      elderly: numberOr(formData, 'elderly', 0),
      people_with_disabilities: numberOr(formData, 'people_with_disabilities', 0),
    },
  }
}

export async function createOccurrence(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const parsed = parsePayload(occurrenceSchema, readOccurrenceForm(formData))
  if (!parsed.success) return errorState(parsed.message, parsed.errors)

  let occurrenceId: string
  try {
    const created = await createOccurrenceRecord(parsed.data, session.userId)
    occurrenceId = created.id
  } catch (error) {
    return asErrorState(error)
  }

  revalidateOccurrences(occurrenceId)
  redirect(`/ocorrencias/${occurrenceId}`)
}

export async function updateOccurrenceStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const id = formText(formData, 'id')
  const status = formText(formData, 'status')

  if (!id) return errorState('Ocorrência não identificada.')
  if (!status || !OCCURRENCE_STATUSES.includes(status as OccurrenceStatus)) {
    return errorState('Selecione um status válido.')
  }

  try {
    await updateOccurrenceStatusRecord(id, status as OccurrenceStatus)
  } catch (error) {
    return asErrorState(error)
  }

  revalidateOccurrences(id)
  return successState('Status da ocorrência atualizado.')
}

export async function recalculateRecommendations(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const id = formText(formData, 'id')
  if (!id) return errorState('Ocorrência não identificada.')

  try {
    const recommendations = await computeAndSaveRecommendations(id)
    revalidateOccurrences(id)
    return successState(
      recommendations.length > 0
        ? `Recomendação recalculada: ${recommendations.length} abrigo(s) sugerido(s).`
        : 'Nenhum abrigo disponível atende aos critérios no momento.',
    )
  } catch (error) {
    return asErrorState(error)
  }
}

export async function deleteOccurrence(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const id = formText(formData, 'id')
  if (!id) return errorState('Ocorrência não identificada.')

  try {
    await deleteOccurrenceRecord(id)
  } catch (error) {
    return asErrorState(error)
  }

  revalidateOccurrences(id)
  redirect('/ocorrencias')
}
