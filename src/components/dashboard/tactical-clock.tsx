'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, RefreshCw } from 'lucide-react'

export function TacticalClock({ generatedAt }: { generatedAt: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // Primeira leitura tambem no intervalo: evita setState sincrono no efeito
    // (que gera render em cascata) e mantem servidor e cliente consistentes.
    const tick = () => setNow(new Date())
    const frame = requestAnimationFrame(tick)
    const interval = setInterval(tick, 1000)
    return () => {
      cancelAnimationFrame(frame)
      clearInterval(interval)
    }
  }, [])

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const timeString = now
    ? now.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--'

  const dateString = now
    ? now.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '---'

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Indicador de monitoramento ativo 24/7 em verde esmeralda */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-1.5 text-xs text-emerald-900 shadow-2xs backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
        </span>
        <span className="font-semibold text-xs tracking-wide">
          Monitoramento Ativo 24/7
        </span>
      </div>

      {/* Relogio Oficial de Brasilia com Glassmorphism Claro */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/85 px-3 py-1.5 text-slate-800 shadow-2xs backdrop-blur-md">
        <Clock className="h-3.5 w-3.5 text-emerald-600" />
        <span className="font-mono text-xs font-bold tracking-wider text-slate-900">
          {timeString}
        </span>
        <span className="hidden text-[11px] font-medium text-slate-500 uppercase sm:inline">
          BRT · {dateString}
        </span>
      </div>

      {/* Botao de sincronizacao manual */}
      <button
        onClick={handleRefresh}
        disabled={isPending}
        title="Atualizar dados operacionais do banco"
        className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-900 disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isPending ? 'animate-spin' : ''}`} />
        <span>{isPending ? 'Sincronizando...' : 'Atualizar'}</span>
      </button>
    </div>
  )
}
