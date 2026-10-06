/**
 * Client do Supabase para uso no SERVIDOR:
 * Server Components, Server Actions e Route Handlers.
 *
 * Um client novo por requisicao (nunca compartilhar entre requisicoes) e
 * `cookies()` assincrono, conforme exigido pelo Next.js 16.
 */

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import type { Database } from '@/types/database'
import { getSupabaseEnv } from './env'

export async function createClient() {
  // `cookies()` vem primeiro de proposito: marca a rota como dinamica antes de
  // qualquer validacao, evitando que o build tente pre-renderizar a pagina.
  const cookieStore = await cookies()
  const { url, publishableKey } = getSupabaseEnv()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components nao podem escrever cookies: a renovacao da sessao
          // e feita no proxy (src/proxy.ts), portanto ignorar aqui e seguro.
        }
      },
    },
  })
}
