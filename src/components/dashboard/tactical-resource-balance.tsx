import Link from 'next/link'
import { AlertCircle, CheckCircle2, ChevronRight, Layers } from 'lucide-react'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { ResourceBalance } from '@/lib/calculations/deficit'

interface TacticalResourceBalanceProps {
  balances: ResourceBalance[]
}

export function TacticalResourceBalance({ balances }: TacticalResourceBalanceProps) {
  if (!balances || balances.length === 0) return null

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-3.5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-2xs">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
              Balanço Estratégico de Recursos em Rede
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Comparativo entre a demanda estimada de todas as ocorrências ativas e o estoque nos abrigos.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/recursos"
            className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            <span>Ver Inventário</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link
            href="/logistica"
            className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline"
          >
            <span>Central Logística</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Grid de Recursos com Glassmorphism Claro */}
      <div className="mt-4.5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((item) => {
          const isDeficit = item.deficit > 0
          const coveragePercent = Math.min(100, Math.max(0, item.coverage))

          return (
            <div
              key={item.resource_id}
              className={`rounded-xl border p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isDeficit
                  ? 'border-red-200/90 bg-gradient-to-br from-red-50/70 to-white/90'
                  : 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white/80 to-white'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="truncate text-xs font-bold text-slate-900">
                  {item.resource_name}
                </span>
                {isDeficit ? (
                  <span className="flex items-center gap-1 rounded-md border border-red-200 bg-red-100/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-800">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    -{formatNumber(item.deficit)} {item.unit}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    100% Coberto
                  </span>
                )}
              </div>

              {/* Numeros: Estoque vs Demanda */}
              <div className="mt-2.5 flex items-baseline justify-between text-xs">
                <span className="text-slate-600">
                  Estoque: <strong className="font-mono font-bold text-slate-900">{formatNumber(item.stock)}</strong>
                </span>
                <span className="text-slate-600">
                  Demanda: <strong className="font-mono font-bold text-slate-900">{formatNumber(item.demand)}</strong>
                </span>
              </div>

              {/* Barra de Cobertura */}
              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDeficit
                        ? coveragePercent < 50
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] font-medium text-slate-500">
                  <span>Cobertura: {formatPercent(item.coverage)}</span>
                  <span>{item.unit}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
