/**
 * Infraestrutura dos Route Handlers.
 *
 * Os endpoints existem para o que NAO deve ficar no cliente: regras de
 * negocio, agregacoes, recomendacoes e calculos. CRUD simples tambem e
 * exposto para permitir integracao externa, sempre atras de autenticacao.
 */

import { NextResponse } from 'next/server'

import { getSession, type SessionContext } from '@/lib/auth/session'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { DataError } from '@/lib/data/query'
import type { FieldErrors } from '@/lib/validation/parse'

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function fail(message: string, status: number, errors?: FieldErrors): NextResponse {
  return NextResponse.json({ error: message, ...(errors ? { fields: errors } : {}) }, { status })
}

type Handler = (session: SessionContext) => Promise<NextResponse>

/** Exige usuario autenticado. Converte excecoes em resposta JSON tratada. */
export async function withSession(handler: Handler): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return fail('Configuração do servidor indisponível: Supabase não configurado.', 503)
  }

  let session: SessionContext | null

  try {
    session = await getSession()
  } catch (error) {
    console.error('[abrigolog] falha ao resolver a sessao:', error)
    return fail('Configuração do servidor indisponível.', 503)
  }

  if (!session) return fail('Autenticação necessária.', 401)

  try {
    return await handler(session)
  } catch (error) {
    if (error instanceof DataError) return fail(error.message, error.status)
    console.error('[abrigolog] erro inesperado na API:', error)
    return fail('Erro interno ao processar a requisição.', 500)
  }
}

/** Exige perfil com permissao de escrita (admin ou operador). */
export async function withWriter(handler: Handler): Promise<NextResponse> {
  return withSession(async (session) => {
    if (!session.canWrite) {
      return fail('Perfil sem permissão de escrita.', 403)
    }
    return handler(session)
  })
}

/** Corpo JSON da requisicao; retorna null quando o corpo e invalido. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}
