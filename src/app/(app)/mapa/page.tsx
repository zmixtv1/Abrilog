import type { Metadata } from 'next'

import { activeOccurrences, loadSnapshot } from '@/lib/data/snapshot'
import { occupancyPercentage, vacancies } from '@/lib/calculations/shelters'
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/primitives'
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
    <>
      <PageHeader
        title="Mapa operacional"
        description="Ocorrências ativas e abrigos sobre base cartográfica do OpenStreetMap. Clique em um marcador para ver os detalhes."
      />

      <Card>
        <CardHeader
          title={`${occurrences.length} ocorrência(s) e ${shelters.length} abrigo(s) no mapa`}
          action={
            <ul className="flex flex-wrap gap-3 text-xs text-muted">
              <li className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-red-600" aria-hidden /> Crítica
              </li>
              <li className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-orange-600" aria-hidden /> Alta
              </li>
              <li className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-yellow-600" aria-hidden />{' '}
                Moderada/baixa
              </li>
              <li className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-blue-700" aria-hidden /> Abrigo
              </li>
            </ul>
          }
        />
        <CardBody>
          <MapView occurrences={occurrences} shelters={shelters} center={DF_CENTER} />
          {occurrences.length === 0 && shelters.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Nenhum registro com coordenadas. Informe latitude e longitude ao cadastrar ocorrências e
              abrigos para que apareçam no mapa.
            </p>
          ) : null}
        </CardBody>
      </Card>
    </>
  )
}
