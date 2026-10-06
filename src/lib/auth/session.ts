/**
 * Sessao e autorizacao.
 *
 * A autorizacao real acontece no banco (RLS + funcao can_write()); estas
 * funcoes servem para a aplicacao decidir o que mostrar e para devolver
 * mensagens de erro claras antes de bater no banco.
 */

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { ProfileRow, UserRole } from '@/types/domain'

export interface SessionContext {
  userId: string
  email: string | null
  profile: ProfileRow | null
  role: UserRole
  canWrite: boolean
}

/** Perfis que podem gravar (espelha public.can_write() no banco). */
export function roleCanWrite(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'operador'
}

/** Sessao atual ou null quando nao houver usuario autenticado. */
export async function getSession(): Promise<SessionContext | null> {
  // Sem variaveis de ambiente nao existe sessao possivel: a tela de login
  // mostra o aviso de configuracao em vez de estourar um erro.
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, organization, created_at')
    .eq('id', user.id)
    .maybeSingle()

  const role: UserRole = profile?.role ?? 'visualizador'

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
    role,
    canWrite: roleCanWrite(role),
  }
}

/** Sessao obrigatoria: redireciona para /login quando nao houver. */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}
