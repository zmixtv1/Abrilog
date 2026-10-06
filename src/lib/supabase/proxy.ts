/**
 * Renovacao de sessao + guarda de rotas, usada por src/proxy.ts.
 *
 * No Next.js 16 o antigo `middleware` passou a se chamar `proxy` (runtime
 * nodejs). E aqui que o token do Supabase e renovado e reescrito nos cookies -
 * Server Components nao conseguem gravar cookies.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/types/database'
import { getSupabaseEnv, isSupabaseConfigured } from './env'

/** Rotas acessiveis sem sessao. */
const PUBLIC_PATHS = ['/login', '/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Sem configuracao do Supabase a aplicacao ainda precisa subir (a tela de
  // login explica o que falta configurar).
  if (!isSupabaseConfigured()) return NextResponse.next({ request })

  let response = NextResponse.next({ request })
  const { url, publishableKey } = getSupabaseEnv()

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
        // Impede que CDN/proxy guarde em cache uma resposta com Set-Cookie.
        for (const [key, headerValue] of Object.entries(headers)) {
          response.headers.set(key, headerValue)
        }
      },
    },
  })

  // Precisa ser chamado antes de gerar a resposta, senao a renovacao do token
  // se perde e o usuario e deslogado aleatoriamente.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = pathname === '/' ? '' : `?redirect=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}
