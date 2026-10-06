import Link from 'next/link'
import { Package, ChevronRight, AlertCircle, CheckCircle2, Truck } from 'lucide-react'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { ResourceBalance } from '@/lib/calculations/deficit'
import type { SystemIndicators } from '@/lib/calculations/indicators'

interface AdminHubLogisticsCardProps {
  balances: ResourceBalance[]
  indicators: SystemIndicators
}

export function AdminHubLogisticsCard({
  balances,
  indicators,
}: AdminHubLogisticsCardProps) {
  const coverageRate = indicators.logisticsCoverageRate
  const totalDeficits = balances.filter((b) => b.deficit > 0).length

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between anime-entry anime-delay-4 anime-card">
      <div>
        {/* Header no estilo AdminHub */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-2xs anime-icon-bounce">
              <Package className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Balanço Logístico de Recursos
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Demanda estimada x Estoque em rede para as próximas 72h
              </p>
            </div>
          </div>

          <Link
            href="/logistica"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 transition bg-amber-50/80 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60"
          >
            <span>Central Logística</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Barra de Cobertura Global de Suprimentos */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-600">
              Cobertura Logística Geral:
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                  coverageRate >= 90
                    ? 'bg-emerald-100 text-emerald-800'
                    : coverageRate >= 60
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {formatPercent(coverageRate)}
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className={`h-full rounded-full transition-all duration-700 anime-progress-bar ${
                coverageRate >= 90
                  ? 'bg-emerald-600'
                  : coverageRate >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, coverageRate)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>
              {totalDeficits === 0
                ? 'Estoque pleno em todos os itens'
                : `${totalDeficits} categoria(s) com déficit projetado`}
            </span>
            <span>Meta PN-PDC: 100%</span>
          </div>
        </div>

        {/* Lista dos Principais Recursos */}
        <div className="space-y-3">
          {balances.slice(0, 4).map((res) => {
            const hasDeficit = res.deficit > 0
            const coverage = Math.min(100, Math.max(0, res.coverage))

            return (
              <div
                key={res.resource_id}
                className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all hover:translate-x-1"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        hasDeficit ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold text-slate-800 truncate max-w-[180px]">
                      {res.resource_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatNumber(res.stock)} / {formatNumber(res.demand)} {res.unit}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        hasDeficit
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {hasDeficit ? `-${formatNumber(res.deficit)}` : '100%'}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      hasDeficit ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${coverage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Cálculo determinístico de insumos</span>
        <Link
          href="/logistica"
          className="inline-block py-1 text-amber-800 hover:underline font-semibold"
        >
          Planejar transferências de estoque ➔
        </Link>
      </div>
    </div>
  )
}
