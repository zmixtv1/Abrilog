'use client'

/**
 * Mapa operacional com Leaflet + OpenStreetMap.
 *
 * Nao e um GIS: apenas localiza ocorrencias (por prioridade) e abrigos (azul).
 * Os marcadores sao desenhados em CSS/SVG, sem depender dos PNGs do Leaflet.
 */

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import {
  occurrenceStatusLabel,
  occurrenceTypeLabel,
  priorityLabel,
  severityLabel,
  shelterStatusLabel,
} from '@/lib/utils/labels'

import { SHELTER_COLOR, occurrenceColor, type MapData } from './types'

const shelterIcon = L.divIcon({
  className: '',
  html: `<span style="display:block;width:16px;height:16px;border-radius:4px;background:${SHELTER_COLOR};border:2px solid #ffffff;box-shadow:0 1px 3px rgba(15,23,42,.45)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
})

export default function LeafletMap({ occurrences, shelters, center }: MapData) {
  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={10}
      scrollWheelZoom
      className="h-[70vh] min-h-96 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {occurrences.map((occurrence) => (
        <CircleMarker
          key={occurrence.id}
          center={[occurrence.latitude, occurrence.longitude]}
          radius={9}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor: occurrenceColor(occurrence.priority_level),
            fillOpacity: 0.9,
          }}
        >
          <Tooltip>{occurrence.title}</Tooltip>
          <Popup>
            <strong className="block text-sm">{occurrence.title}</strong>
            <dl className="mt-1 space-y-0.5 text-xs">
              <div>
                <dt className="inline font-medium">Tipo: </dt>
                <dd className="inline">{occurrenceTypeLabel(occurrence.type)}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Severidade: </dt>
                <dd className="inline">
                  {occurrence.severity} - {severityLabel(occurrence.severity)}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Pessoas afetadas: </dt>
                <dd className="inline">{formatNumber(occurrence.affected_people)}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Prioridade: </dt>
                <dd className="inline">
                  {priorityLabel(occurrence.priority_level)} ({formatNumber(occurrence.priority_score, 1)})
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Status: </dt>
                <dd className="inline">{occurrenceStatusLabel(occurrence.status)}</dd>
              </div>
            </dl>
            <a className="mt-2 inline-block text-xs underline" href={`/ocorrencias/${occurrence.id}`}>
              Abrir ocorrência
            </a>
          </Popup>
        </CircleMarker>
      ))}

      {shelters.map((shelter) => (
        <Marker key={shelter.id} position={[shelter.latitude, shelter.longitude]} icon={shelterIcon}>
          <Tooltip>{shelter.name}</Tooltip>
          <Popup>
            <strong className="block text-sm">{shelter.name}</strong>
            <dl className="mt-1 space-y-0.5 text-xs">
              <div>
                <dt className="inline font-medium">Capacidade: </dt>
                <dd className="inline">{formatNumber(shelter.capacity)}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Ocupação: </dt>
                <dd className="inline">
                  {formatNumber(shelter.occupancy)} ({formatPercent(shelter.occupancy_percentage)})
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Vagas: </dt>
                <dd className="inline">{formatNumber(shelter.vacancies)}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Situação: </dt>
                <dd className="inline">{shelterStatusLabel(shelter.status)}</dd>
              </div>
            </dl>
            <a className="mt-2 inline-block text-xs underline" href={`/abrigos/${shelter.id}`}>
              Abrir abrigo
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
