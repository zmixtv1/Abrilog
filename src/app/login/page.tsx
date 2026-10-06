import type { Metadata } from 'next'

import { LoginForm } from '@/components/auth/forms'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const metadata: Metadata = { title: 'Entrar · AbrigoLog' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams
  const configured = isSupabaseConfigured()

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Apresentacao */}
      <section className="bg-brand-dark px-6 py-10 text-white lg:w-1/2 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-200 uppercase">
            PN-PDC 2025-2035
          </p>
          <h1 className="mt-3 text-3xl font-semibold lg:text-4xl">AbrigoLog</h1>
          <p className="mt-2 text-lg text-blue-100">
            Plataforma de gestão de abrigos, ocorrências e logística de emergência.
          </p>

          <p className="mt-8 text-sm text-blue-100">
            Sistema de <strong className="text-white">apoio à decisão</strong> para equipes de Defesa
            Civil. O motor de priorização e recomendação é baseado em regras determinísticas — a
            decisão final permanece com a equipe responsável.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-blue-100">
            <li>• Priorização automática de ocorrências (score 0–100)</li>
            <li>• Recomendação dos 3 melhores abrigos por ocorrência</li>
            <li>• Déficit de recursos e sugestão de distribuição</li>
            <li>• Indicadores operacionais e mapa de situação</li>
          </ul>

          <p className="mt-10 text-xs text-blue-300">
            Protótipo acadêmico com dados demonstrativos (Brasília/DF).
          </p>
        </div>
      </section>

      {/* Acesso */}
      <section className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold text-foreground">Acesso restrito</h2>
          <p className="mt-1 mb-6 text-sm text-muted">
            Informe as credenciais cadastradas no Supabase Auth.
          </p>

          {configured ? null : (
            <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
              <strong className="block">Supabase não configurado</strong>
              Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
              <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> no arquivo{' '}
              <code>.env.local</code> (veja <code>.env.example</code>) e reinicie o servidor.
            </div>
          )}

          <LoginForm redirectTo={redirectTo} />

          <p className="mt-6 text-xs text-muted">
            O cadastro de usuários é feito pelo painel do Supabase (Authentication → Users). Todo
            novo usuário recebe o perfil <strong>operador</strong> automaticamente.
          </p>
        </div>
      </section>
    </div>
  )
}
