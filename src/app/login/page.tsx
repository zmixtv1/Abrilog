import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, LifeBuoy, ExternalLink } from 'lucide-react'

import { LoginSlider } from '@/components/auth/login-slider'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const metadata: Metadata = { title: 'Acesso Operacional · AbrigoLog' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams
  const configured = isSupabaseConfigured()

  return (
    <main className="relative min-h-screen min-h-dvh flex flex-col justify-between items-center px-4 py-3 md:py-2.5 overflow-x-hidden bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/50">
      {/* Elementos decorativos de luz e glassmorphism de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-300/10 blur-[120px]"
      />

      {/* Topo institucional - visivel no desktop; no mobile o card tem seu proprio topo esmeralda */}
      <header className="hidden md:flex relative z-10 w-full max-w-5xl shrink-0 items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                Abrigo<span className="text-emerald-600">Log</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded border border-emerald-300/60">
                DF
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Defesa Civil do Distrito Federal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 rounded-full px-2.5 py-0.5 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Operação Ativa · </span>PN-PDC
          </span>
        </div>
      </header>

      {/* Núcleo do Login: Container Deslizante com suporte total a Mobile e Desktop */}
      <section className="relative z-10 my-auto flex w-full items-center justify-center py-2 md:py-0">
        <LoginSlider redirectTo={redirectTo} configured={configured} />
      </section>

      {/* Rodapé institucional responsivo */}
      <footer className="relative z-10 w-full max-w-5xl shrink-0 pt-2 pb-2 md:pt-1 md:pb-1 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left text-[10px] text-slate-500 font-medium">
        <p>
          AbrigoLog · Apoio à Decisão Operacional em Emergências · Protótipo com dados oficiais demonstrativos (Brasília/DF).
        </p>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">PN-PDC 2025–2035</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 font-semibold">Decisão Humana Auditável</span>
        </div>
      </footer>
    </main>
  )
}
