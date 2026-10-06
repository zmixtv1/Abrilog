import { Activity, Clock, ShieldCheck, Target, Truck } from 'lucide-react'

import { formatHours, formatNumber, formatPercent } from '@/lib/utils/format'
import type { SystemIndicators } from '@/lib/calculations/indicators'

interface AdminHubKpiCardProps {
  indicators: SystemIndicators
}

export function AdminHubKpiCard({ indicators }: AdminHubKpiCardProps) {
  const kpis = [
    {
      id: '1',
      title: 'Ocupação dos Abrigos',
      value: formatPercent(indicators.shelterOccupancyRate),
      subtext: 'Acolhidos / Capacidade total',
      numeric: indicators.shelterOccupancyRate,
      icon: Target,
      tag: 'Capacidade',
      barColor:
        indicators.shelterOccupancyRate >= 90
          ? 'bg-red-500'
          : indicators.shelterOccupancyRate >= 75
          ? 'bg-amber-500'
          : 'bg-emerald-600',
      benchmark: 'Alvo: < 85%',
      iconStyle: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: '2',
      title: 'Ocorrências Atendidas',
      value: formatPercent(indicators.occurrencesHandledRate),
      subtext: 'Em socorro ou controladas',
      numeric: indicators.occurrencesHandledRate,
      icon: ShieldCheck,
      tag: 'Eficácia',
      barColor:
        indicators.occurrencesHandledRate >= 70
          ? 'bg-emerald-600'
          : indicators.occurrencesHandledRate >= 40
          ? 'bg-amber-500'
          : 'bg-red-500',
      benchmark: 'Alvo: > 80%',
      iconStyle: 'bg-blue-100 text-blue-700',
    },
    {
      id: '3',
      title: 'Cobertura Logística (72h)',
      value: formatPercent(indicators.logisticsCoverageRate),
      subtext: `${formatNumber(indicators.totalDeficitUnits)} un. pendentes`,
      numeric: indicators.logisticsCoverageRate,
      icon: Truck,
      tag: 'Suprimentos',
      barColor:
        indicators.logisticsCoverageRate >= 90
          ? 'bg-emerald-600'
          : indicators.logisticsCoverageRate >= 60
          ? 'bg-amber-500'
          : 'bg-red-500',
      benchmark: 'Alvo: 100%',
      iconStyle: 'bg-amber-100 text-amber-800',
    },
    {
      id: '4',
      title: 'Tempo Médio de Resposta',
      value:
        indicators.averageResponseHours === null
          ? 'Em monitoramento'
          : formatHours(indicators.averageResponseHours),
      subtext:
        indicators.averageResponseHours === null
          ? 'Aguardando encerramentos'
          : 'Abertura ao encerramento',
      numeric: null,
      icon: Clock,
      tag: 'Prontidão',
      barColor: 'bg-emerald-600',
      benchmark: 'Meta: < 24h',
      iconStyle: 'bg-teal-100 text-teal-800',
    },
  ]

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm anime-entry anime-delay-6 anime-card">
      {/* Header do Card no Estilo AdminHub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-2xs anime-icon-bounce">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Indicadores Mensuráveis de Eficácia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Métricas quantitativas oficiais de resposta humanitária e prontidão
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/60 self-start sm:self-auto">
          Painel PN-PDC
        </span>
      </div>

      {/* Grid com os 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const percent = kpi.numeric !== null ? Math.min(100, Math.max(0, kpi.numeric)) : null

          return (
            <div
              key={kpi.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 shadow-2xs flex flex-col justify-between anime-card group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {kpi.tag}
                  </span>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${kpi.iconStyle} anime-icon-bounce`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                  {kpi.value}
                </div>

                <h3 className="text-xs font-bold text-slate-700 mt-1">
                  {kpi.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {kpi.subtext}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50">
                {percent !== null ? (
                  <div className="mb-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60">
                      <div
                        className={`h-full rounded-full transition-all duration-700 anime-progress-bar ${kpi.barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="text-[10.5px] font-semibold text-slate-500 font-mono text-right">
                  {kpi.benchmark}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
