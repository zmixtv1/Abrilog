'use server'

/** Autenticacao: login, logout e atualizacao do proprio perfil. */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { credentialsSchema, profileSchema } from '@/lib/validation/schemas'
import { formText, parsePayload } from '@/lib/validation/parse'
import { errorState, successState, type ActionState } from './state'

/** Mensagens do Supabase traduzidas para o operador. */
function translateAuthError(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (normalized.includes('email not confirmed')) {
    return 'E-mail ainda não confirmado. Confirme o cadastro no painel do Supabase.'
  }
  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.'
  }
  return 'Não foi possível entrar. Tente novamente.'
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parsePayload(credentialsSchema, {
    email: formText(formData, 'email') ?? '',
    password: formText(formData, 'password') ?? '',
  })

  if (!parsed.success) {
    return errorState(parsed.message, parsed.errors)
  }

  let supabase
  try {
    supabase = await createClient()
  } catch {
    return errorState(
      'Supabase não configurado. Defina as variáveis de ambiente (ver .env.example).',
    )
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    console.error('[abrigolog] falha de login:', error.message)
    return errorState(translateAuthError(error.message))
  }

  const redirectTo = formText(formData, 'redirect')
  const target = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'

  revalidatePath('/', 'layout')
  redirect(target)
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession()

  const parsed = parsePayload(profileSchema, {
    full_name: formText(formData, 'full_name') ?? '',
    organization: formText(formData, 'organization'),
  })

  if (!parsed.success) {
    return errorState(parsed.message, parsed.errors)
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      organization: parsed.data.organization,
    })
    .eq('id', session.userId)

  if (error) {
    console.error('[abrigolog] falha ao atualizar perfil:', error.message)
    return errorState('Não foi possível salvar o perfil. Tente novamente.')
  }

  revalidatePath('/configuracoes')
  revalidatePath('/', 'layout')
  return successState('Perfil atualizado com sucesso.')
}
