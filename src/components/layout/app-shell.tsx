/**
 * Estrutura das telas internas: barra lateral (sidebar) + conteudo.
 * Em telas pequenas a navegacao vira uma barra horizontal rolavel.
 */

import Link from 'next/link'
import { LogOut } from 'lucide-react'

import { signOut } from '@/lib/actions/auth'
import { roleLabel } from '@/lib/utils/labels'
import type { SessionContext } from '@/lib/auth/session'

import { Nav } from './nav'

export function AppShell({
  session,
  children,
}: {
  session: SessionContext
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-4 bg-brand-dark px-3 py-4 text-white md:w-64 md:min-h-screen md:gap-6">
        <Link href="/dashboard" className="px-2">
          <span className="block text-lg font-semibold tracking-tight">AbrigoLog</span>
          <span className="block text-xs text-blue-200">
            Gestão de abrigos e logística de emergência
          </span>
        </Link>

        <div className="md:flex-1">
          <Nav />
        </div>

        <footer className="border-t border-white/15 px-2 pt-3">
          <p className="truncate text-sm font-medium">
            {session.profile?.full_name ?? session.email ?? 'Usuário'}
          </p>
          <p className="text-xs text-blue-200">{roleLabel(session.role)}</p>
          {session.profile?.organization ? (
            <p className="truncate text-xs text-blue-200">{session.profile.organization}</p>
          ) : null}

          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-blue-100 transition hover:bg-white/10"
            >
              <LogOut size={16} aria-hidden />
              Sair
            </button>
          </form>
        </footer>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
