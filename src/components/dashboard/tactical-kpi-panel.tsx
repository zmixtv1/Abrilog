import { Activity, Clock, ShieldCheck, Target, Truck } from 'lucide-react'

import { formatHours, formatNumber, formatPercent } from '@/lib/utils/format'
import type { SystemIndicators } from '@/lib/calculations/indicators'

interface TacticalKpiPanelProps {
  indicators: SystemIndicators
}

export function TacticalKpiPanel({ indicators }: TacticalKpiPanelProps) {
  const kpis = [
    {
      id: '1',
      title: '1. Ocupação dos abrigos',
      value: formatPercent(indicators.shelterOccupancyRate),
      subtext: 'ocupação total / capacidade total',
      numeric: indicators.shelterOccupancyRate,
      icon: Target,
      tag: 'Capacidade',
      barColor:
        indicators.shelterOccupancyRate >= 90
          ? 'bg-red-500'
          : indicators.shelterOccupancyRate >= 75
            ? 'bg-amber-500'
            : 'bg-emerald-600',
      benchmark: 'Limite seguro: < 85%',
      iconColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: '2',
      title: '2. Ocorrências atendidas',
      value: formatPercent(indicators.occurrencesHandledRate),
      subtext: 'em atendimento, controladas ou encerradas',
      numeric: indicators.occurrencesHandledRate,
      icon: ShieldCheck,
      tag: 'Eficácia',
      barColor:
        indicators.occurrencesHandledRate >= 70
          ? 'bg-emerald-600'
          : indicators.occurrencesHandledRate >= 40
            ? 'bg-amber-500'
            : 'bg-red-500',
      benchmark: 'Meta operacional: > 80%',
      iconColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: '3',
      title: '3. Cobertura logística',
      value: formatPercent(indicators.logisticsCoverageRate),
      subtext: `${formatNumber(indicators.totalDeficitUnits)} unidades em falta (soma bruta)`,
      numeric: indicators.logisticsCoverageRate,
      icon: Truck,
      tag: 'Suprimentos',
      barColor:
        indicators.logisticsCoverageRate >= 90
          ? 'bg-emerald-600'
          : indicators.logisticsCoverageRate >= 60
            ? 'bg-amber-500'
            : 'bg-red-500',
      benchmark: 'Equilíbrio pleno: 100%',
      iconColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: '4',
      title: '4. Tempo médio de atendimento',
      value:
        indicators.averageResponseHours === null
          ? 'Indicador futuro'
          : formatHours(indicators.averageResponseHours),
      subtext:
        indicators.averageResponseHours === null
          ? 'sem ocorrências encerradas ainda'
          : 'abertura até encerramento',
      numeric: null,
      icon: Clock,
      tag: 'Prontidão',
      barColor: 'bg-emerald-600',
      benchmark: 'Ciclo completo de socorro',
      iconColor: 'bg-amber-100 text-amber-800',
    },
  ]

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-3.5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-700 text-xs font-bold text-white shadow-2xs">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
              Indicadores mensuráveis
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Base quantitativa para avaliar o ganho operacional do sistema em emergências.
          </p>
        </div>

        <span className="rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-800 shadow-2xs">
          Métricas Oficiais PN-PDC 2025–2035
        </span>
      </div>

      <div className="mt-4.5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const percent = kpi.numeric !== null ? Math.min(100, Math.max(0, kpi.numeric)) : null

          return (
            <div
              key={kpi.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:border-emerald-300"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold tracking-wider text-slate-700 uppercase text-[11px]">
                    {kpi.title}
                  </span>
                  <div className={`rounded-lg p-1.5 shadow-2xs ${kpi.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="font-mono text-2xl font-extrabold text-slate-900">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 leading-snug">{kpi.subtext}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/60 pt-3">
                {percent !== null ? (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${kpi.barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] font-medium text-slate-500">
                      <span>{kpi.benchmark}</span>
                      <span className="font-bold text-slate-700">{percent}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-[10px] font-medium text-slate-500">
                    {kpi.benchmark}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
