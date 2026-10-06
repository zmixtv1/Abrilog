import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Flame,
  MapPin,
  ShieldAlert,
} from 'lucide-react'

import { formatNumber } from '@/lib/utils/format'
import { occurrenceTypeLabel, severityLabel } from '@/lib/utils/labels'
import { OccurrenceStatusBadge, PriorityBadge } from '@/components/ui/primitives'
import type { PrioritizedOccurrence } from '@/lib/data/snapshot'

interface TacticalCriticalTableProps {
  criticals: PrioritizedOccurrence[]
}

export function TacticalCriticalTable({ criticals }: TacticalCriticalTableProps) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      {/* Header do Bloco */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white shadow-2xs">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
              Ocorrências críticas
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Prioridade calculada igual ou acima de 80 pontos pelo motor determinístico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-mono text-xs font-bold text-red-800 shadow-2xs">
            {criticals.length} ocorrência(s) prioritária(s)
          </span>
          <Link
            href="/ocorrencias"
            className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            <span>Ver todas</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabela com Glassmorphism Claro */}
      {criticals.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">
            Nenhuma ocorrência crítica neste momento
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            As ocorrências ativas estão abaixo de 80 pontos de prioridade.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-700">
                <th scope="col" className="px-5 py-3.5">Ocorrência</th>
                <th scope="col" className="hidden px-4 py-3.5 md:table-cell">Tipo</th>
                <th scope="col" className="hidden px-4 py-3.5 sm:table-cell">Severidade</th>
                <th scope="col" className="px-4 py-3.5 text-right">Pessoas</th>
                <th scope="col" className="px-4 py-3.5 text-center">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Prioridade</th>
                <th scope="col" className="px-5 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criticals.map((item) => {
                const occ = item.occurrence
                const score = item.priority.score
                const isUrgent = occ.status === 'aberta'

                return (
                  <tr
                    key={occ.id}
                    className="transition-colors hover:bg-emerald-50/40"
                  >
                    {/* Titulo + Localizacao */}
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-start gap-2.5">
                        {isUrgent ? (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600 tactical-pulse-red" />
                        ) : (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                        )}
                        <div>
                          <Link
                            href={`/ocorrencias/${occ.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {occ.title}
                          </Link>
                          {occ.neighborhood || occ.city ? (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
                              <span className="truncate max-w-xs font-medium">
                                {[occ.neighborhood, `${occ.city}/${occ.state}`].filter(Boolean).join(' · ')}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="hidden px-4 py-4 align-middle md:table-cell">
                      <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs">
                        {occurrenceTypeLabel(occ.type)}
                      </span>
                    </td>

                    {/* Severidade */}
                    <td className="hidden px-4 py-4 align-middle sm:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-mono text-xs font-bold text-red-800 shadow-2xs">
                        <Flame className="h-3.5 w-3.5 text-red-600" />
                        {occ.severity} · {severityLabel(occ.severity)}
                      </span>
                    </td>

                    {/* Pessoas afetadas */}
                    <td className="px-4 py-4 text-right align-middle">
                      <span className="font-mono font-bold text-slate-900">
                        {formatNumber(occ.affected_people)}
                      </span>
                      <span className="block text-[10px] text-slate-500">afetadas</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center align-middle">
                      <OccurrenceStatusBadge status={occ.status} />
                    </td>

                    {/* Prioridade */}
                    <td className="px-4 py-4 text-right align-middle">
                      <div className="flex flex-col items-end gap-1">
                        <PriorityBadge level={item.priority.level} score={score} />
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Acoes Rapidas */}
                    <td className="px-5 py-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/mapa`}
                          title="Ver localização no mapa"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                        </Link>
                        <Link
                          href={`/ocorrencias/${occ.id}`}
                          title="Abrir detalhes e recomendações"
                          className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-800"
                        >
                          <span>Ficha</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
