'use server'

/** Server Actions de abrigos (cadastro, atualizacao e ocupacao). */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireSession } from '@/lib/auth/session'
import { createShelterRecord, updateShelterRecord } from '@/lib/data/mutations'
import { DataError } from '@/lib/data/query'
import { createClient } from '@/lib/supabase/server'
import { shelterSchema, shelterUpdateSchema } from '@/lib/validation/schemas'
import {
  formBoolean,
  formNumber,
  formText,
  numberOr,
  parsePayload,
  requiredNumber,
} from '@/lib/validation/parse'
import { READ_ONLY_MESSAGE, errorState, successState, type ActionState } from './state'

function revalidateShelters(id?: string): void {
  revalidatePath('/dashboard')
  revalidatePath('/abrigos')
  revalidatePath('/logistica')
  revalidatePath('/mapa')
  if (id) revalidatePath(`/abrigos/${id}`)
}

function asErrorState(error: unknown): ActionState {
  if (error instanceof DataError) return errorState(error.message)
  throw error
}

function readShelterForm(formData: FormData) {
  return {
    name: formText(formData, 'name') ?? '',
    description: formText(formData, 'description'),
    address: formText(formData, 'address'),
    city: formText(formData, 'city') ?? 'Brasilia',
    state: formText(formData, 'state') ?? 'DF',
    latitude: formNumber(formData, 'latitude'),
    longitude: formNumber(formData, 'longitude'),
    capacity: requiredNumber(formData, 'capacity'),
    current_occupancy: numberOr(formData, 'current_occupancy', 0),
    status: formText(formData, 'status') ?? 'disponivel',
    has_water: formBoolean(formData, 'has_water'),
    has_food: formBoolean(formData, 'has_food'),
    has_medical_support: formBoolean(formData, 'has_medical_support'),
    has_accessibility: formBoolean(formData, 'has_accessibility'),
  }
}

export async function createShelter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const parsed = parsePayload(shelterSchema, readShelterForm(formData))
  if (!parsed.success) return errorState(parsed.message, parsed.errors)

  let shelterId: string
  try {
    shelterId = await createShelterRecord(parsed.data)
  } catch (error) {
    return asErrorState(error)
  }

  revalidateShelters(shelterId)
  redirect(`/abrigos/${shelterId}`)
}

export async function updateShelter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const id = formText(formData, 'id')
  if (!id) return errorState('Abrigo não identificado.')

  const parsed = parsePayload(shelterSchema, readShelterForm(formData))
  if (!parsed.success) return errorState(parsed.message, parsed.errors)

  try {
    await updateShelterRecord(id, parsed.data)
  } catch (error) {
    return asErrorState(error)
  }

  revalidateShelters(id)
  return successState('Abrigo atualizado com sucesso.')
}

/**
 * Atualiza apenas a ocupacao (uso tipico no dia a dia do abrigo).
 * A validacao garante ocupacao <= capacidade antes de ir ao banco; o banco
 * tem a constraint equivalente como ultima linha de defesa.
 */
export async function updateShelterOccupancy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const id = formText(formData, 'id')
  if (!id) return errorState('Abrigo não identificado.')

  const supabase = await createClient()
  const current = await supabase.from('abrigos').select('capacity').eq('id', id).maybeSingle()
  if (current.error || !current.data) return errorState('Abrigo não encontrado.')

  const status = formText(formData, 'status')
  const parsed = parsePayload(shelterUpdateSchema, {
    current_occupancy: requiredNumber(formData, 'current_occupancy'),
    capacity: Number(current.data.capacity),
    ...(status ? { status } : {}),
  })

  if (!parsed.success) return errorState(parsed.message, parsed.errors)

  try {
    await updateShelterRecord(id, {
      current_occupancy: parsed.data.current_occupancy,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    })
  } catch (error) {
    return asErrorState(error)
  }

  revalidateShelters(id)
  return successState('Ocupação atualizada. Status recalculado automaticamente.')
}
