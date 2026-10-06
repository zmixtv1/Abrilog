import type { Metadata } from 'next'
import { Building, Flame, MapPin } from 'lucide-react'

import { activeOccurrences, loadSnapshot } from '@/lib/data/snapshot'
import { occupancyPercentage, vacancies } from '@/lib/calculations/shelters'
import { PageHeader } from '@/components/ui/primitives'
import { MapView } from '@/components/map/map-view'
import type { OccurrenceMarker, ShelterMarker } from '@/components/map/types'

export const metadata: Metadata = { title: 'Mapa operacional · AbrigoLog' }

/** Centro aproximado do Distrito Federal (contexto demonstrativo). */
const DF_CENTER = { latitude: -15.7939, longitude: -47.8828 }

export default async function MapPage() {
  const snapshot = await loadSnapshot()

  const occurrences: OccurrenceMarker[] = activeOccurrences(snapshot)
    .filter((item) => item.occurrence.latitude !== null && item.occurrence.longitude !== null)
    .map((item) => ({
      id: item.occurrence.id,
      title: item.occurrence.title,
      type: item.occurrence.type,
      severity: item.occurrence.severity,
      status: item.occurrence.status,
      affected_people: item.occurrence.affected_people,
      priority_level: item.priority.level,
      priority_score: item.priority.score,
      latitude: item.occurrence.latitude as number,
      longitude: item.occurrence.longitude as number,
    }))

  const shelters: ShelterMarker[] = snapshot.shelters
    .filter((shelter) => shelter.latitude !== null && shelter.longitude !== null)
    .map((shelter) => ({
      id: shelter.id,
      name: shelter.name,
      status: shelter.status,
      capacity: shelter.capacity,
      occupancy: shelter.current_occupancy,
      vacancies: vacancies(shelter),
      occupancy_percentage: occupancyPercentage(shelter),
      latitude: shelter.latitude as number,
      longitude: shelter.longitude as number,
    }))

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Mapa Situacional Operacional"
        description="Visualização georreferenciada de ocorrências ativas e abrigos sobre a base cartográfica do OpenStreetMap. Clique em um marcador para inspecionar os detalhes."
      />

      {/* Resumo e Legenda Tática em Glassmorphism */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm anime-card anime-entry">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              {occurrences.length} ocorrência(s) e {shelters.length} abrigo(s) georreferenciados
            </span>
          </div>

          <ul className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
            <li className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2 py-0.5 text-red-900">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden />
              <span>Prioridade Crítica</span>
            </li>
            <li className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/70 px-2 py-0.5 text-orange-900">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-600" aria-hidden />
              <span>Prioridade Alta</span>
            </li>
            <li className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-2 py-0.5 text-amber-900">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />
              <span>Moderada / Baixa</span>
            </li>
            <li className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2 py-0.5 text-emerald-900">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" aria-hidden />
              <span>Abrigo da Rede</span>
            </li>
          </ul>
        </div>

        {/* Container do Mapa */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/90 shadow-inner">
          <MapView occurrences={occurrences} shelters={shelters} center={DF_CENTER} />
        </div>

        {occurrences.length === 0 && shelters.length === 0 ? (
          <p className="mt-3 text-center text-xs text-slate-500">
            Nenhum registro com coordenadas. Cadastre ocorrências e abrigos com latitude e longitude para plotagem automática.
          </p>
        ) : null}
      </div>
    </div>
  )
}
