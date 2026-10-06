import Link from 'next/link'
import { PlusCircle, Truck, MapPin, Shield, Clock } from 'lucide-react'

import { formatDateTime } from '@/lib/utils/format'

interface AdminHubHeaderProps {
  generatedAt: string
  criticalCount: number
  activeCount: number
}

export function AdminHubHeader({
  generatedAt,
  criticalCount,
  activeCount,
}: AdminHubHeaderProps) {
  const isEmergency = criticalCount > 0

  return (
    <div className="anime-entry flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
      {/* Título & Migalhas no estilo oficial do AdminHub */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60 shadow-2xs">
            <Shield className="h-3 w-3 text-emerald-700" />
            <span>Defesa Civil · Distrito Federal</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">|</span>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            PN-PDC 2025–2035
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Centro de Comando Operacional
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
          Triagem determinística, monitoramento de ocorrências e logística de acolhimento.
        </p>
      </div>

      {/* Ações Rápidas no Tema Verde Esmeralda com Efeito Anime.js */}
      <div className="flex flex-wrap items-center gap-2.5 sm:self-start md:self-auto">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs font-mono">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          <span>{formatDateTime(generatedAt).slice(11, 16)}</span>
          <span className="text-slate-300">·</span>
          <span className="relative flex h-2 w-2">
            <span className="anime-beacon absolute inline-flex h-full w-full rounded-full bg-emerald-400 text-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="text-[11px] font-sans font-semibold text-slate-700">Ativo</span>
        </div>

        <Link
          href="/logistica"
          className="anime-card inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white text-slate-700 hover:text-emerald-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
        >
          <Truck className="h-4 w-4 text-emerald-600" />
          <span>Logística</span>
        </Link>

        <Link
          href="/mapa"
          className="anime-card inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white text-slate-700 hover:text-emerald-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
        >
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span>Mapa</span>
        </Link>

        <Link
          href="/ocorrencias/nova"
          className="anime-btn-glow inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nova Ocorrência</span>
        </Link>
      </div>
    </div>
  )
}
