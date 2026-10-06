import Link from 'next/link'
import {
  Calculator,
  ChevronRight,
  House,
  Package,
  Siren,
  Sliders,
  Truck,
  ArrowRight,
} from 'lucide-react'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { DashboardCards } from '@/lib/data/dashboard'
import type { SystemIndicators } from '@/lib/calculations/indicators'

interface AdminHubDecisionChainProps {
  cards: DashboardCards
  indicators: SystemIndicators
}

export function AdminHubDecisionChain({ cards, indicators }: AdminHubDecisionChainProps) {
  const steps = [
    {
      num: '1',
      title: 'Triagem Inicial',
      icon: Siren,
      mainText: `${formatNumber(cards.activeOccurrences)} ativas`,
      subText: `${formatNumber(cards.affectedPeople)} pessoas`,
      color: 'border-blue-100 bg-blue-50/40 text-blue-900',
      iconBg: 'bg-blue-100 text-blue-700',
      tag: 'Entrada',
    },
    {
      num: '2',
      title: 'Cálculo PN-PDC',
      icon: Sliders,
      mainText: `${formatNumber(cards.criticalOccurrences)} críticas`,
      subText: 'Score determinístico',
      color: 'border-red-100 bg-red-50/40 text-red-900',
      iconBg: 'bg-red-100 text-red-700',
      tag: '0–100',
    },
    {
      num: '3',
      title: 'Alocação Abrigos',
      icon: House,
      mainText: `${formatNumber(cards.availableVacancies)} vagas`,
      subText: `${formatPercent(indicators.shelterOccupancyRate)} ocupado`,
      color: 'border-emerald-100 bg-emerald-50/40 text-emerald-950',
      iconBg: 'bg-emerald-100 text-emerald-800',
      tag: 'Capacidade',
    },
    {
      num: '4',
      title: 'Déficit Recursos',
      icon: Package,
      mainText: `${formatNumber(cards.resourcesInDeficit)} em déficit`,
      subText: `${formatPercent(indicators.logisticsCoverageRate)} cobertura`,
      color: 'border-amber-100 bg-amber-50/40 text-amber-900',
      iconBg: 'bg-amber-100 text-amber-800',
      tag: '72 Horas',
    },
    {
      num: '5',
      title: 'Despacho & Ação',
      icon: Truck,
      mainText: 'Central Logística',
      subText: 'Ações recomendadas',
      href: '/logistica',
      color: 'border-teal-100 bg-teal-50/40 text-teal-900',
      iconBg: 'bg-teal-100 text-teal-800',
      tag: 'Execução',
    },
  ]

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm anime-entry anime-delay-5 anime-card">
      {/* Header do Card no Estilo AdminHub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs anime-icon-bounce">
            <Calculator className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Cadeia de Decisão PN-PDC 2025–2035
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fluxo determinístico auditável do motor de regras da Defesa Civil
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 self-start sm:self-auto">
          Auditabilidade 100%
        </span>
      </div>

      {/* Grid Horizontal dos 5 Passos Conectados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const content = (
            <div
              className={`relative rounded-2xl border ${step.color} p-4 transition-all h-full flex flex-col justify-between anime-card group shadow-2xs`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 text-xs font-mono font-black text-slate-700 shadow-2xs group-hover:scale-105 transition-transform">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {step.tag}
                    </span>
                  </div>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${step.iconBg} anime-icon-bounce`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                  {step.title}
                </h3>
                <div className="text-sm font-black font-mono text-slate-900">
                  {step.mainText}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
                <span>{step.subText}</span>
                {step.href ? (
                  <ArrowRight className="h-3 w-3 text-teal-700" />
                ) : null}
              </div>
            </div>
          )

          if (step.href) {
            return (
              <Link key={step.num} href={step.href} className="block">
                {content}
              </Link>
            )
          }

          return <div key={step.num}>{content}</div>
        })}
      </div>
    </div>
  )
}
