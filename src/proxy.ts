/**
 * Proxy do Next.js 16 (equivalente ao antigo middleware.ts).
 *
 * Responsabilidades:
 *   1. renovar a sessao do Supabase em cada requisicao;
 *   2. barrar acesso as rotas internas sem usuario autenticado.
 */

import type { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, menos arquivos estaticos e imagens.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
