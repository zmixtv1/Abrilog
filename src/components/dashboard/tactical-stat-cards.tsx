import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  House,
  Package,
  Siren,
  Users,
} from 'lucide-react'

import { formatNumber } from '@/lib/utils/format'
import type { DashboardCards } from '@/lib/data/dashboard'

interface TacticalStatCardsProps {
  cards: DashboardCards
}

export function TacticalStatCards({ cards }: TacticalStatCardsProps) {
  const isCriticalDanger = cards.criticalOccurrences > 0
  const isDeficitWarning = cards.resourcesInDeficit > 0

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* =====================================================================
          PILAR 1: INCIDENTES & PESSOAS AFETADAS (Foco na Emergencia)
          ===================================================================== */}
      <div className="flex flex-col justify-between rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/40 via-white/85 to-white/90 p-4.5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
              <Siren className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold tracking-wider text-blue-950 uppercase">
              1. Incidentes & População
            </span>
          </div>
          <Link
            href="/ocorrencias"
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline"
          >
            <span>Ver Ocorrências</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Metricas do Pilar 1 */}
        <div className="mt-3.5 grid grid-cols-3 gap-2.5">
          {/* Ocorrencias ativas */}
          <Link
            href="/ocorrencias"
            className="group rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs transition hover:border-blue-300 hover:shadow-xs"
          >
            <span className="block truncate text-[11px] font-semibold text-slate-500 uppercase">
              Ativas
            </span>
            <span className="mt-1 block font-mono text-2xl font-extrabold text-slate-900 group-hover:text-blue-700">
              {formatNumber(cards.activeOccurrences)}
            </span>
            <span className="mt-0.5 block truncate text-[10px] text-slate-500">
              Não encerradas
            </span>
          </Link>

          {/* Ocorrencias criticas */}
          <Link
            href="/ocorrencias"
            className={`group rounded-xl border p-3 shadow-2xs transition ${
              isCriticalDanger
                ? 'border-red-300 bg-red-50/70 hover:border-red-400'
                : 'border-slate-200/80 bg-white/90 hover:border-emerald-300'
            }`}
          >
            <span className="block truncate text-[11px] font-semibold text-slate-500 uppercase">
              Críticas
            </span>
            <span
              className={`mt-1 block font-mono text-2xl font-extrabold ${
                isCriticalDanger ? 'text-red-700' : 'text-slate-900'
              }`}
            >
              {formatNumber(cards.criticalOccurrences)}
            </span>
            <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">
              Score ≥ 80
            </span>
          </Link>

          {/* Pessoas afetadas */}
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
            <span className="block truncate text-[11px] font-semibold text-slate-500 uppercase">
              Pessoas
            </span>
            <span className="mt-1 block font-mono text-2xl font-extrabold text-slate-900">
              {formatNumber(cards.affectedPeople)}
            </span>
            <span className="mt-0.5 block truncate text-[10px] text-slate-500">
              Em ativas
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PILAR 2: REDE DE ACOLHIMENTO & ABRIGOS (Foco na Resposta e Vagas)
          ===================================================================== */}
      <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 via-white/85 to-white/90 p-4.5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
              <House className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold tracking-wider text-emerald-950 uppercase">
              2. Rede de Acolhimento
            </span>
          </div>
          <Link
            href="/abrigos"
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            <span>Ver Abrigos</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Metricas do Pilar 2 */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          {/* Vagas disponiveis em destaque */}
          <Link
            href="/abrigos"
            className="group rounded-xl border border-emerald-300/80 bg-emerald-50/70 p-3 shadow-2xs transition hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900 uppercase">
                Vagas Disponíveis
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            </div>
            <span className="mt-1 block font-mono text-2xl font-extrabold text-emerald-900 group-hover:text-emerald-700">
              {formatNumber(cards.availableVacancies)}
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold text-emerald-800">
              Prontas para acolhimento
            </span>
          </Link>

          {/* Abrigos ativos */}
          <Link
            href="/abrigos"
            className="group rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs transition hover:border-emerald-300 hover:shadow-xs"
          >
            <span className="block truncate text-[11px] font-semibold text-slate-500 uppercase">
              Abrigos Ativos
            </span>
            <span className="mt-1 block font-mono text-2xl font-extrabold text-slate-900 group-hover:text-emerald-700">
              {formatNumber(cards.activeShelters)}
            </span>
            <span className="mt-0.5 block truncate text-[10px] text-slate-500">
              Unidades operacionais
            </span>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          PILAR 3: LOGISTICA & ESTOQUE DE RECURSOS (Foco no Abastecimento)
          ===================================================================== */}
      <div className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white/85 to-white/90 p-4.5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-600 text-white shadow-2xs">
              <Package className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold tracking-wider text-amber-950 uppercase">
              3. Cadeia de Suprimentos
            </span>
          </div>
          <Link
            href="/logistica"
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 hover:underline"
          >
            <span>Central Logística</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Metricas do Pilar 3 */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          {/* Recursos em deficit */}
          <Link
            href="/logistica"
            className={`group rounded-xl border p-3 shadow-2xs transition ${
              isDeficitWarning
                ? 'border-amber-300 bg-amber-50/70 hover:border-amber-400'
                : 'border-emerald-300/80 bg-emerald-50/70 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase">
                Recursos em Déficit
              </span>
              {isDeficitWarning ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              )}
            </div>
            <span
              className={`mt-1 block font-mono text-2xl font-extrabold ${
                isDeficitWarning ? 'text-amber-800' : 'text-emerald-900'
              }`}
            >
              {formatNumber(cards.resourcesInDeficit)}
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold text-slate-600">
              {isDeficitWarning ? 'Demanda > Estoque' : 'Estoque regular'}
            </span>
          </Link>

          {/* Atalho de Reposicao */}
          <Link
            href="/logistica"
            className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs transition hover:border-amber-300 hover:shadow-xs"
          >
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Ações Logísticas
              </span>
              <span className="mt-1 block text-xs font-bold text-slate-800 group-hover:text-amber-800">
                {isDeficitWarning ? 'Despacho Recomendado' : 'Equilíbrio da Rede'}
              </span>
            </div>
            <span className="mt-1 block text-[10px] font-medium text-emerald-700">
              Consultar transferências →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
