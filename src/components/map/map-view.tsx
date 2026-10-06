'use client'

/**
 * MapView: carrega o Leaflet somente no browser.
 * O Leaflet depende de `window`, por isso o import dinamico com ssr desligado.
 */

import dynamic from 'next/dynamic'

import { LoadingState } from '@/components/ui/primitives'
import type { MapData } from './types'

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => <LoadingState label="Carregando mapa operacional..." />,
})

export function MapView(props: MapData) {
  return <LeafletMap {...props} />
}
