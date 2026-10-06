'use client'

import Link from 'next/link'
import { Siren, Users, House, ShieldAlert, ArrowUpRight } from 'lucide-react'

import { AnimatedCounter } from '@/components/ui/animated-counter'
import type { DashboardCards } from '@/lib/data/dashboard'

interface AdminHubStatCardsProps {
  cards: DashboardCards
}

export function AdminHubStatCards({ cards }: AdminHubStatCardsProps) {
  const statList = [
    {
      id: 'active',
      title: 'Ocorrências Ativas',
      rawNum: cards.activeOccurrences,
      subtext: 'Triagem e despacho em curso',
      icon: Siren,
      href: '/ocorrencias',
      delayClass: 'anime-delay-1',
      iconStyle: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badge: 'Monitoramento',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    },
    {
      id: 'affected',
      title: 'Pessoas Afetadas',
      rawNum: cards.affectedPeople,
      subtext: 'Em ocorrências ativas',
      icon: Users,
      href: '/ocorrencias',
      delayClass: 'anime-delay-2',
      iconStyle: 'bg-amber-50 text-amber-600 border border-amber-100',
      badge: 'População',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/60',
    },
    {
      id: 'shelters',
      title: 'Vagas em Abrigos',
      rawNum: cards.availableVacancies,
      subtext: `${cards.activeShelters} abrigos em operação`,
      icon: House,
      href: '/abrigos',
      delayClass: 'anime-delay-3',
      iconStyle: 'bg-teal-50 text-teal-600 border border-teal-100',
      badge: 'Capacidade',
      badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200/60',
    },
    {
      id: 'critical',
      title: 'Casos Críticos',
      rawNum: cards.criticalOccurrences,
      subtext: 'Prioridade máxima (Score ≥ 80)',
      icon: ShieldAlert,
      href: '/ocorrencias',
      delayClass: 'anime-delay-4',
      iconStyle: 'bg-red-50 text-red-600 border border-red-100',
      badge: cards.criticalOccurrences > 0 ? 'Alerta Imediato' : 'Regular',
      badgeStyle:
        cards.criticalOccurrences > 0
          ? 'bg-red-100 text-red-800 border-red-300'
          : 'bg-slate-100 text-slate-600 border-slate-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statList.map((stat) => {
        const Icon = stat.icon
        const isCriticalAlert = stat.id === 'critical' && stat.rawNum > 0

        return (
          <Link
            key={stat.id}
            href={stat.href}
            className={`adminhub-stat-card anime-card anime-entry ${stat.delayClass} group cursor-pointer relative overflow-hidden`}
          >
            {/* Ícone quadrado arredondado com efeito elástico Anime.js no hover */}
            <div
              className={`h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center anime-icon-bounce relative ${stat.iconStyle}`}
            >
              <Icon className="h-7 w-7" />
              {isCriticalAlert && (
                <span className="anime-beacon text-red-500 absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-600 ring-2 ring-white" />
              )}
            </div>

            {/* Conteúdo textual e contadores numéricos com rolagem elástica */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="truncate text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>

              <h3 className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                <AnimatedCounter value={stat.rawNum} duration={900} />
              </h3>

              <p className="mt-1.5 truncate text-[11px] font-medium text-slate-400">
                {stat.subtext}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
