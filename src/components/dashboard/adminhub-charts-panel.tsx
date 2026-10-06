import Link from 'next/link'
import { BarChart3, AlertTriangle, ChevronRight, PieChart } from 'lucide-react'

import { formatNumber } from '@/lib/utils/format'
import type { ChartSlice } from '@/lib/data/dashboard'

interface AdminHubChartsPanelProps {
  occurrencesByType: ChartSlice[]
  occurrencesBySeverity: ChartSlice[]
}

export function AdminHubChartsPanel({
  occurrencesByType,
  occurrencesBySeverity,
}: AdminHubChartsPanelProps) {
  const maxType = occurrencesByType.reduce((acc, item) => Math.max(acc, item.value), 0)
  const maxSeverity = occurrencesBySeverity.reduce((acc, item) => Math.max(acc, item.value), 0)

  const severityMeta: Record<string, { label: string; bar: string; text: string }> = {
    '5': { label: 'Grau 5 · Extrema Catástrofe', bar: 'bg-red-500', text: 'text-red-700' },
    '4': { label: 'Grau 4 · Severidade Alta', bar: 'bg-orange-500', text: 'text-orange-700' },
    '3': { label: 'Grau 3 · Severidade Média', bar: 'bg-amber-500', text: 'text-amber-700' },
    '2': { label: 'Grau 2 · Moderado', bar: 'bg-blue-500', text: 'text-blue-700' },
    '1': { label: 'Grau 1 · Baixo Impacto', bar: 'bg-slate-400', text: 'text-slate-600' },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Ocorrências por Tipo */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between anime-entry anime-delay-7 anime-card">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs anime-icon-bounce">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Ocorrências por Tipologia
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Classificação das ocorrências ativas em atendimento
                </p>
              </div>
            </div>

            <Link
              href="/ocorrencias"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition bg-emerald-50/80 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/60"
            >
              <span>Filtrar</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {occurrencesByType.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Nenhuma ocorrência ativa no momento.
              </p>
            ) : (
              occurrencesByType.map((item) => {
                const pct = maxType > 0 ? (item.value / maxType) * 100 : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatNumber(item.value)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-700 anime-progress-bar"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Categorização COBRADE / Defesa Civil</span>
          <span className="font-mono font-semibold text-slate-500">DF em Alerta</span>
        </div>
      </div>

      {/* 2. Ocorrências por Severidade */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between anime-entry anime-delay-8 anime-card">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700 shadow-2xs anime-icon-bounce">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Distribuição por Severidade
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Classificação de risco de 1 (baixo) a 5 (crítico)
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Escala 1–5
            </span>
          </div>

          <div className="space-y-3.5">
            {occurrencesBySeverity.map((item) => {
              const sevKey = item.label.slice(0, 1)
              const meta = severityMeta[sevKey] ?? {
                label: item.label,
                bar: 'bg-slate-400',
                text: 'text-slate-600',
              }
              const pct = maxSeverity > 0 ? (item.value / maxSeverity) * 100 : 0

              return (
                <div key={item.label}>
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{meta.label}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${meta.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Critério determinístico de gravidade</span>
          <span className="font-mono font-semibold text-slate-500">PN-PDC 2025–2035</span>
        </div>
      </div>
    </div>
  )
}
