import Link from 'next/link'
import {
  AlertTriangle,
  House,
  MapPin,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from 'lucide-react'

import { formatDateTime } from '@/lib/utils/format'
import { TacticalClock } from './tactical-clock'

interface TacticalHudHeaderProps {
  generatedAt: string
  criticalCount: number
  deficitCount: number
  activeOccurrences: number
}

export function TacticalHudHeader({
  generatedAt,
  criticalCount,
  deficitCount,
  activeOccurrences,
}: TacticalHudHeaderProps) {
  const isCritical = criticalCount > 0
  const hasDeficit = deficitCount > 0

  const threatLevel = isCritical
    ? {
        level: 'NÍVEL 4 · ALERTA CRÍTICO',
        desc: `${criticalCount} ocorrência(s) com prioridade máxima (Score ≥ 80) aguardando atendimento imediato`,
        color: 'border-red-200/90 bg-gradient-to-r from-red-50/90 via-white/80 to-red-50/40 text-red-950',
        badge: 'bg-red-600 text-white tactical-pulse-red',
        icon: ShieldAlert,
        iconColor: 'text-red-600 bg-red-100',
      }
    : hasDeficit
      ? {
          level: 'NÍVEL 3 · ALERTA LOGÍSTICO',
          desc: `${deficitCount} categoria(s) de suprimentos com demanda estimada acima do estoque disponível`,
          color: 'border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-white/80 to-amber-50/40 text-amber-950',
          badge: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 bg-amber-100',
        }
      : {
          level: 'NÍVEL 1 · REGULARIDADE',
          desc: 'Operações e rede de acolhimento sob pleno equilíbrio de estoque e vagas',
          color: 'border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-white/80 to-emerald-50/40 text-emerald-950',
          badge: 'bg-emerald-600 text-white',
          icon: ShieldCheck,
          iconColor: 'text-emerald-700 bg-emerald-100',
        }

  const ThreatIcon = threatLevel.icon

  return (
    <div className="mb-6 space-y-4">
      {/* Top Banner de Sala de Situacao com Glassmorphism Claro */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-emerald-700 px-2.5 py-1 font-mono text-[11px] font-bold tracking-widest text-white uppercase shadow-2xs">
              DEFESA CIVIL · CICC
            </span>
            <span className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-800 shadow-2xs">
              PROTOCOLO PN-PDC 2025–2035
            </span>
            <span className="text-xs font-medium text-slate-500">
              Auditável · Processamento Determinístico
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Painel operacional
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 leading-relaxed">
            Situação consolidada das ocorrências, abrigos e recursos. Os números são recalculados
            a cada acesso pelo motor de regras.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Atualizado em <span className="font-semibold text-slate-700">{formatDateTime(generatedAt)}</span>
          </p>
        </div>

        {/* Relogio tatico e status 24/7 */}
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <TacticalClock generatedAt={generatedAt} />
          <span className="text-[11px] font-medium text-slate-500">
            Sessão segura · Sincronização em tempo real
          </span>
        </div>
      </div>

      {/* Faixa de Alerta Tatico + Atalhos Operacionais */}
      <div className="grid gap-3 lg:grid-cols-12">
        {/* Nivel de Alerta da Sala de Comando */}
        <div
          className={`flex items-center gap-3.5 rounded-2xl border p-4 shadow-2xs backdrop-blur-md lg:col-span-7 ${threatLevel.color}`}
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-2xs ${threatLevel.iconColor}`}>
            <ThreatIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${threatLevel.badge}`}>
                {threatLevel.level}
              </span>
              <span className="font-semibold text-xs text-slate-700">
                {activeOccurrences} incidentes ativos
              </span>
            </div>
            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {threatLevel.desc}
            </p>
          </div>
        </div>

        {/* Launchpad: Acoes Rapidas do Operador em Glassmorphism */}
        <div className="flex flex-wrap items-center justify-start gap-2 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-2xs backdrop-blur-md lg:col-span-5 lg:justify-end">
          <Link
            href="/ocorrencias/nova"
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nova Ocorrência</span>
          </Link>
          <Link
            href="/logistica"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-2xs transition hover:bg-emerald-100"
          >
            <Truck className="h-4 w-4 text-emerald-700" />
            <span>Central Logística</span>
          </Link>
          <Link
            href="/mapa"
            className="flex items-center gap-1.5 rounded-xl border border-blue-200/80 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 shadow-2xs transition hover:bg-blue-100"
          >
            <MapPin className="h-4 w-4 text-blue-700" />
            <span>Mapa Tático</span>
          </Link>
          <Link
            href="/abrigos"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <House className="h-4 w-4 text-slate-600" />
            <span>Abrigos</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
