import Link from 'next/link'
import { Building, ChevronRight, Users, CheckCircle2, AlertTriangle } from 'lucide-react'

import { formatNumber } from '@/lib/utils/format'
import type { ShelterOccupancySlice } from '@/lib/data/dashboard'
import type { DashboardCountersRow } from '@/types/domain'

interface AdminHubShelterCardProps {
  shelterOccupancy: ShelterOccupancySlice[]
  counters: DashboardCountersRow
}

export function AdminHubShelterCard({
  shelterOccupancy,
  counters,
}: AdminHubShelterCardProps) {
  const globalCapacity = Number(counters.total_capacity) || 1
  const globalOccupancy = Number(counters.total_occupancy) || 0
  const globalOccupancyPct = Math.min(100, Math.round((globalOccupancy / globalCapacity) * 100))
  const freeVacancies = Number(counters.available_vacancies) || 0

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between anime-entry anime-delay-4 anime-card">
      <div>
        {/* Header no estilo AdminHub */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-2xs anime-icon-bounce">
              <Building className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Rede de Acolhimento & Abrigos
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Capacidade instalada e ocupação em tempo real no DF
              </p>
            </div>
          </div>

          <Link
            href="/abrigos"
            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition bg-teal-50/80 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200/60"
          >
            <span>Ver Abrigos</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Barra de Progresso Global Consolidada */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-600">
              Taxa de Ocupação da Rede:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900">
                {formatNumber(globalOccupancy)} / {formatNumber(globalCapacity)} acolhidos
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                  globalOccupancyPct >= 85
                    ? 'bg-red-100 text-red-800'
                    : globalOccupancyPct >= 70
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {globalOccupancyPct}%
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className={`h-full rounded-full transition-all duration-700 anime-progress-bar ${
                globalOccupancyPct >= 85
                  ? 'bg-red-500'
                  : globalOccupancyPct >= 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${globalOccupancyPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>{freeVacancies} vagas livres disponíveis</span>
            <span>Meta de segurança: &lt; 85%</span>
          </div>
        </div>

        {/* Lista dos Principais Abrigos */}
        <div className="space-y-3">
          {shelterOccupancy.slice(0, 4).map((shelter) => {
            const isFull = shelter.percentage >= 95
            const isWarning = shelter.percentage >= 80

            return (
              <div
                key={shelter.id}
                className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all hover:translate-x-1"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">
                    {shelter.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {shelter.occupancy}/{shelter.capacity}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isFull
                          ? 'bg-red-50 text-red-700'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {shelter.percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull
                        ? 'bg-red-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, shelter.percentage)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Monitoramento contínuo de leitos</span>
        <Link
          href="/abrigos"
          className="inline-block py-1 text-teal-700 hover:underline font-semibold"
        >
          Gerenciar abrigos e vagas ➔
        </Link>
      </div>
    </div>
  )
}
