import Link from 'next/link'
import {
  BarChart3,
  Building,
  CheckCircle2,
  ChevronRight,
  Flame,
  Package,
} from 'lucide-react'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { ChartSlice, ShelterOccupancySlice } from '@/lib/data/dashboard'
import type { DashboardCountersRow } from '@/types/domain'

interface TacticalChartsGridProps {
  occurrencesByType: ChartSlice[]
  occurrencesBySeverity: ChartSlice[]
  shelterOccupancy: ShelterOccupancySlice[]
  resourceDeficits: ChartSlice[]
  counters: DashboardCountersRow
}

export function TacticalChartsGrid({
  occurrencesByType,
  occurrencesBySeverity,
  shelterOccupancy,
  resourceDeficits,
  counters,
}: TacticalChartsGridProps) {
  const maxType = occurrencesByType.reduce((acc, item) => Math.max(acc, item.value), 0)
  const maxSeverity = occurrencesBySeverity.reduce((acc, item) => Math.max(acc, item.value), 0)
  const maxDeficit = resourceDeficits.reduce((acc, item) => Math.max(acc, item.value), 0)

  const severityColors: Record<string, { bar: string; text: string; bg: string }> = {
    '5': { bar: 'bg-red-500', text: 'text-red-700 font-bold', bg: 'bg-red-50 border-red-200' },
    '4': { bar: 'bg-orange-500', text: 'text-orange-700 font-bold', bg: 'bg-orange-50 border-orange-200' },
    '3': { bar: 'bg-amber-500', text: 'text-amber-700 font-bold', bg: 'bg-amber-50 border-amber-200' },
    '2': { bar: 'bg-blue-500', text: 'text-blue-700 font-medium', bg: 'bg-blue-50 border-blue-200' },
    '1': { bar: 'bg-slate-400', text: 'text-slate-600 font-medium', bg: 'bg-slate-50 border-slate-200' },
  }

  const globalCapacity = Number(counters.total_capacity) || 1
  const globalOccupancy = Number(counters.total_occupancy) || 0
  const globalOccupancyPct = Math.min(100, Math.round((globalOccupancy / globalCapacity) * 100))

  return (
    <div className="mt-6 space-y-6">
      {/* Barra de Resumo de Capacidade da Rede de Abrigos em Glassmorphism Claro */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
              <Building className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                Capacidade Consolidada da Rede de Acolhimento
              </h3>
              <p className="text-[11px] text-slate-500">
                Monitoramento contínuo de vagas e ocupação em todos os abrigos do DF
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-600">
              Capacidade: <strong className="font-mono text-slate-900">{formatNumber(globalCapacity)}</strong>
            </span>
            <span className="text-slate-600">
              Ocupação: <strong className="font-mono text-slate-900">{formatNumber(globalOccupancy)}</strong>
            </span>
            <span className="text-slate-600">
              Vagas Livres:{' '}
              <strong className="font-mono text-emerald-700 font-bold">
                {formatNumber(counters.available_vacancies)}
              </strong>
            </span>
            <span className="rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-800 shadow-2xs">
              {globalOccupancyPct}% Ocupado
            </span>
          </div>
        </div>

        <div className="mt-3.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              globalOccupancyPct >= 90
                ? 'bg-red-500'
                : globalOccupancyPct >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
            }`}
            style={{ width: `${globalOccupancyPct}%` }}
          />
        </div>
      </div>

      {/* Grid Principal dos 4 Graficos Analiticos em Glassmorphism Claro */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Ocorrencias por tipo */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                  Ocorrências por tipo
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">Somente ocorrências ativas.</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4.5">
              {occurrencesByType.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Nenhuma ocorrência ativa.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {occurrencesByType.map((item) => {
                    const pct = maxType > 0 ? (item.value / maxType) * 100 : 0
                    return (
                      <li key={item.label}>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-semibold text-slate-800">{item.label}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {formatNumber(item.value)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/40">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 text-right">
            <Link
              href="/ocorrencias"
              className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              <span>Ver todas ocorrências</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Ocorrencias por severidade */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                  Ocorrências por severidade
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">1 = baixa · 5 = crítica.</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                <Flame className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4.5">
              {occurrencesBySeverity.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Nenhuma ocorrência ativa.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {occurrencesBySeverity.map((item) => {
                    const sevDigit = item.label.charAt(0)
                    const colorStyle = severityColors[sevDigit] ?? {
                      bar: 'bg-blue-600',
                      text: 'text-blue-700',
                      bg: 'bg-slate-50 border-slate-200',
                    }
                    const pct = maxSeverity > 0 ? (item.value / maxSeverity) * 100 : 0

                    return (
                      <li key={item.label}>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className={`font-semibold ${colorStyle.text}`}>
                            {item.label}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {formatNumber(item.value)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/40">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${colorStyle.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 text-right">
            <span className="text-[11px] font-medium text-slate-500">
              Classificação Cobrade / Defesa Civil
            </span>
          </div>
        </div>

        {/* 3. Ocupacao dos abrigos */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                  Ocupação dos abrigos
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Vagas e percentual são sempre calculados a partir de capacidade e ocupação.
                </p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Building className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4.5">
              {shelterOccupancy.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="font-semibold text-slate-800">Nenhum abrigo cadastrado</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Cadastre abrigos para habilitar a recomendação.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {shelterOccupancy.map((shelter) => {
                    const isHigh = shelter.percentage >= 95
                    const isMed = shelter.percentage >= 75
                    const barColor = isHigh
                      ? 'bg-red-500'
                      : isMed
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'

                    return (
                      <li key={shelter.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 shadow-2xs">
                        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-xs">
                          <Link
                            href={`/abrigos/${shelter.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {shelter.name}
                          </Link>
                          <span className="font-mono text-slate-600">
                            {formatNumber(shelter.occupancy)}/{formatNumber(shelter.capacity)} ·{' '}
                            <span className="font-bold text-emerald-800">
                              {formatNumber(shelter.vacancies)} vagas
                            </span>{' '}
                            ({formatPercent(shelter.percentage)})
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white border border-slate-200/50">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${Math.min(100, Math.max(0, shelter.percentage))}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 text-right">
            <Link
              href="/abrigos"
              className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              <span>Gerenciar todos os abrigos</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Recursos em deficit */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                  Recursos em déficit
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Demanda estimada acima do estoque disponível na rede.
                </p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <Package className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4.5">
              {resourceDeficits.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center text-emerald-900">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                  <p className="mt-2 text-xs font-bold">
                    Nenhum recurso em déficit: o estoque cobre a demanda estimada.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {resourceDeficits.map((item) => {
                    const pct = maxDeficit > 0 ? (item.value / maxDeficit) * 100 : 0
                    return (
                      <li key={item.label} className="rounded-xl border border-red-200/70 bg-red-50/40 p-3 shadow-2xs">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-bold text-slate-900">{item.label}</span>
                          <span className="font-mono font-bold text-red-700">
                            -{formatNumber(item.value)} unidades
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white border border-slate-200/50">
                          <div
                            className="h-full rounded-full bg-red-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {item.hint ? (
                          <p className="mt-1 text-[11px] font-medium text-slate-500">
                            {item.hint}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 text-right">
            <Link
              href="/logistica"
              className="inline-flex items-center gap-1 font-semibold text-xs text-blue-700 hover:text-blue-900 hover:underline"
            >
              <span>Resolver na Central Logística</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
