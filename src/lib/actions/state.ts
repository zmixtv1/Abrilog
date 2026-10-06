/**
 * Estado compartilhado das Server Actions (usado com `useActionState`).
 *
 * Este arquivo NAO leva 'use server': modulos de server action so podem
 * exportar funcoes assincronas, por isso tipos e constantes ficam separados.
 */

import type { FieldErrors } from '@/lib/validation/parse'

export interface ActionState {
  status: 'idle' | 'success' | 'error'
  message: string
  errors?: FieldErrors
  /** Id do registro criado/atualizado, quando util para a interface. */
  id?: string
}

export const IDLE_STATE: ActionState = { status: 'idle', message: '' }

export function successState(message: string, id?: string): ActionState {
  return { status: 'success', message, id }
}

export function errorState(message: string, errors?: FieldErrors): ActionState {
  return { status: 'error', message, errors }
}

/** Mensagem padrao quando o perfil nao tem permissao de escrita. */
export const READ_ONLY_MESSAGE =
  'Seu perfil tem acesso somente leitura. Solicite o papel de operador para registrar alterações.'
