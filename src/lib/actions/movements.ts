'use server'

/**
 * Server Action de movimentacao de recursos.
 *
 * A gravacao e delegada a funcao registrar_movimentacao() no PostgreSQL, que
 * atualiza estoque e historico na mesma transacao - por isso nunca sobra
 * estoque negativo, mesmo com dois operadores registrando ao mesmo tempo.
 */

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/session'
import { registerMovementRecord } from '@/lib/data/mutations'
import { DataError } from '@/lib/data/query'
import { movementSchema } from '@/lib/validation/schemas'
import { formText, parsePayload, requiredNumber } from '@/lib/validation/parse'
import { READ_ONLY_MESSAGE, errorState, successState, type ActionState } from './state'

export async function registerMovement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const parsed = parsePayload(movementSchema, {
    resource_id: formText(formData, 'resource_id') ?? '',
    movement_type: formText(formData, 'movement_type') ?? '',
    quantity: requiredNumber(formData, 'quantity'),
    origin_shelter_id: formText(formData, 'origin_shelter_id'),
    destination_shelter_id: formText(formData, 'destination_shelter_id'),
    reason: formText(formData, 'reason'),
  })

  if (!parsed.success) return errorState(parsed.message, parsed.errors)

  let movementId: string
  try {
    movementId = await registerMovementRecord(parsed.data)
  } catch (error) {
    if (error instanceof DataError) return errorState(error.message)
    throw error
  }

  revalidatePath('/dashboard')
  revalidatePath('/logistica')
  revalidatePath('/recursos')
  revalidatePath('/abrigos')

  return successState('Movimentação registrada e estoque atualizado.', movementId)
}
