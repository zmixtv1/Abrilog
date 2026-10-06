import Link from 'next/link'
import {
  Calculator,
  ChevronRight,
  House,
  Package,
  Siren,
  Sliders,
  Truck,
} from 'lucide-react'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { DashboardCards } from '@/lib/data/dashboard'
import type { SystemIndicators } from '@/lib/calculations/indicators'

interface TacticalDecisionChainProps {
  cards: DashboardCards
  indicators: SystemIndicators
}

export function TacticalDecisionChain({ cards, indicators }: TacticalDecisionChainProps) {
  const steps = [
    {
      num: '1',
      title: 'Ocorrência',
      icon: Siren,
      mainText: `${formatNumber(cards.activeOccurrences)} ativas`,
      subText: `${formatNumber(cards.affectedPeople)} pessoas afetadas`,
      color: 'border-blue-200/80 bg-blue-50/50 text-blue-900',
      iconBg: 'bg-blue-100 text-blue-700',
      tag: 'Entrada Bruta',
    },
    {
      num: '2',
      title: 'Priorização',
      icon: Sliders,
      mainText: `${formatNumber(cards.criticalOccurrences)} críticas`,
      subText: 'severidade + pessoas + déficit + urgência',
      color: 'border-red-200/80 bg-red-50/50 text-red-900',
      iconBg: 'bg-red-100 text-red-700',
      tag: 'Score 0–100',
    },
    {
      num: '3',
      title: 'Abrigos',
      icon: House,
      mainText: `${formatNumber(cards.availableVacancies)} vagas`,
      subText: `ocupação em ${formatPercent(indicators.shelterOccupancyRate)}`,
      color: 'border-emerald-200/80 bg-emerald-50/60 text-emerald-950',
      iconBg: 'bg-emerald-100 text-emerald-800',
      tag: 'Capacidade',
    },
    {
      num: '4',
      title: 'Déficit',
      icon: Package,
      mainText: `${formatNumber(cards.resourcesInDeficit)} recursos`,
      subText: `cobertura logística ${formatPercent(indicators.logisticsCoverageRate)}`,
      color: 'border-amber-200/80 bg-amber-50/50 text-amber-900',
      iconBg: 'bg-amber-100 text-amber-800',
      tag: 'Balanço',
    },
    {
      num: '5',
      title: 'Distribuição',
      icon: Truck,
      mainText: 'Central Logística',
      subText: 'ações sugeridas com justificativa',
      href: '/logistica',
      color: 'border-indigo-200/80 bg-indigo-50/50 text-indigo-900',
      iconBg: 'bg-indigo-100 text-indigo-700',
      tag: 'Despacho',
    },
  ]

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      {/* Header do Bloco */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-2xs">
              <Calculator className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
              Cadeia de decisão do motor de regras
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Processamento determinístico, sem Machine Learning: cada etapa alimenta a seguinte.
          </p>
        </div>

        {/* Badge da Formula do Motor com Fundo Verde Suave */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 font-mono text-xs text-emerald-900 shadow-2xs">
          <span className="font-bold text-emerald-800">Fórmula de Prioridade:</span>
          <span className="font-medium text-slate-700">Sev·0,40 + Pess·0,30 + Déf·0,20 + Urg·0,10</span>
        </div>
      </div>

      {/* Grid de Passos em Pipeline */}
      <ol className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step) => {
          const Icon = step.icon
          const content = (
            <div
              className={`relative flex h-full flex-col justify-between rounded-xl border p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md ${step.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-bold text-slate-900 text-xs shadow-2xs">
                      {step.num}
                    </span>
                    {step.title}
                  </span>
                  <span className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 shadow-2xs">
                    {step.tag}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2.5">
                  <div className={`rounded-lg p-1.5 shadow-2xs ${step.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate font-mono text-base font-extrabold text-slate-900">
                    {step.mainText}
                  </span>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-200/60 pt-2.5">
                <span className="block text-xs leading-snug text-slate-600">
                  {step.subText}
                </span>
                {step.href ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 font-semibold text-xs text-emerald-700 hover:text-emerald-900 hover:underline">
                    Acessar Central <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </div>
            </div>
          )

          return (
            <li key={step.num} className="relative">
              {step.href ? (
                <Link href={step.href} className="block h-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
