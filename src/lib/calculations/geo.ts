/** Calculo de distancia geografica (formula de Haversine). */

import { round } from './math'

const EARTH_RADIUS_KM = 6371

type Coordinate = { latitude?: number | null; longitude?: number | null }

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** True quando o ponto possui latitude e longitude utilizaveis. */
export function hasCoordinates(point: Coordinate | null | undefined): boolean {
  return (
    point != null &&
    typeof point.latitude === 'number' &&
    typeof point.longitude === 'number' &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude)
  )
}

/**
 * Distancia em km entre dois pontos. Retorna null quando falta coordenada,
 * para que o motor possa aplicar um score neutro em vez de inventar um valor.
 */
export function distanceKm(
  from: Coordinate | null | undefined,
  to: Coordinate | null | undefined,
): number | null {
  if (!hasCoordinates(from) || !hasCoordinates(to)) return null

  const lat1 = from!.latitude as number
  const lon1 = from!.longitude as number
  const lat2 = to!.latitude as number
  const lon2 = to!.longitude as number

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2

  return round(2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a))), 2)
}
