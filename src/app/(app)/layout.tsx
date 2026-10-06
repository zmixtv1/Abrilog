import { AppShell } from '@/components/layout/app-shell'
import { requireSession } from '@/lib/auth/session'

/**
 * Dados operacionais mudam a cada registro: nenhuma tela interna e pre-renderizada.
 */
export const dynamic = 'force-dynamic'

/**
 * Layout das telas internas. A sessao e exigida aqui (alem do proxy), para que
 * nenhuma pagina interna renderize sem usuario autenticado.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()

  return <AppShell session={session}>{children}</AppShell>
}
