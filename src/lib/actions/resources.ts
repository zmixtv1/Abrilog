'use server'

/** Server Actions do catalogo de recursos e do ajuste direto de estoque. */

import { revalidatePath } from 'next/cache'

import { requireSession } from '@/lib/auth/session'
import { createResourceRecord, setStockRecord } from '@/lib/data/mutations'
import { DataError } from '@/lib/data/query'
import { resourceSchema, stockSchema } from '@/lib/validation/schemas'
import { formText, numberOr, parsePayload, requiredNumber } from '@/lib/validation/parse'
import { READ_ONLY_MESSAGE, errorState, successState, type ActionState } from './state'

function revalidateResources(): void {
  revalidatePath('/dashboard')
  revalidatePath('/recursos')
  revalidatePath('/logistica')
  revalidatePath('/abrigos')
}

function asErrorState(error: unknown): ActionState {
  if (error instanceof DataError) return errorState(error.message)
  throw error
}

export async function createResource(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const parsed = parsePayload(resourceSchema, {
    name: formText(formData, 'name') ?? '',
    category: formText(formData, 'category') ?? '',
    unit: formText(formData, 'unit') ?? '',
    minimum_stock: numberOr(formData, 'minimum_stock', 0),
    demand_per_person: numberOr(formData, 'demand_per_person', 1),
  })

  if (!parsed.success) return errorState(parsed.message, parsed.errors)

  try {
    await createResourceRecord(parsed.data)
  } catch (error) {
    return asErrorState(error)
  }

  revalidateResources()
  return successState('Recurso cadastrado com sucesso.')
}

/**
 * Ajuste direto de estoque (carga inicial / correcao de inventario).
 * O fluxo do dia a dia e a movimentacao, que preserva historico.
 */
export async function setStockQuantity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession()
  if (!session.canWrite) return errorState(READ_ONLY_MESSAGE)

  const parsed = parsePayload(stockSchema, {
    shelter_id: formText(formData, 'shelter_id') ?? '',
    resource_id: formText(formData, 'resource_id') ?? '',
    quantity: requiredNumber(formData, 'quantity'),
  })

  if (!parsed.success) return errorState(parsed.message, parsed.errors)

  try {
    await setStockRecord(parsed.data)
  } catch (error) {
    return asErrorState(error)
  }

  revalidateResources()
  return successState('Estoque ajustado com sucesso.')
}
