/** Helpers de consulta: colunas explicitas e tratamento de erro padronizado. */

import { toNumber } from '@/lib/calculations/math'
import type {
  MovementRow,
  OccurrenceRow,
  OccurrenceShelterRow,
  ResourceRow,
  ShelterRow,
  StockRow,
} from '@/types/domain'

/** Nunca usar `select('*')`: as colunas sao declaradas explicitamente. */
export const OCCURRENCE_COLUMNS =
  'id, title, description, type, severity, status, city, state, neighborhood, latitude, longitude, affected_people, affected_families, created_at, updated_at, created_by'

export const SHELTER_COLUMNS =
  'id, name, description, address, city, state, latitude, longitude, capacity, current_occupancy, status, has_water, has_food, has_medical_support, has_accessibility, created_at, updated_at'

export const RESOURCE_COLUMNS =
  'id, name, category, unit, minimum_stock, demand_per_person, created_at'

export const STOCK_COLUMNS = 'id, shelter_id, resource_id, quantity, updated_at'

export const MOVEMENT_COLUMNS =
  'id, resource_id, origin_shelter_id, destination_shelter_id, quantity, movement_type, reason, created_at, created_by'

export const AFFECTED_COLUMNS =
  'id, occurrence_id, adults, children, elderly, people_with_disabilities, total_people, created_at'

export const RECOMMENDATION_COLUMNS =
  'id, occurrence_id, shelter_id, recommended, distance_km, score, created_at'

/**
 * Erro de leitura/escrita com mensagem segura para a interface.
 * `status` permite que a API responda 400/403/404/409 em vez de 500 generico.
 */
export class DataError extends Error {
  readonly status: number

  constructor(message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message)
    this.name = 'DataError'
    this.status = options.status ?? 500
    this.cause = options.cause
  }
}

/**
 * Converte o par { data, error } do Supabase em valor ou excecao.
 * O detalhe tecnico vai para o log do servidor; o usuario recebe texto claro.
 */
export function unwrap<T>(
  result: { data: T | null; error: { message: string } | null },
  context: string,
): T {
  if (result.error) {
    console.error(`[abrigolog] falha ao ${context}:`, result.error.message)
    throw new DataError(`Nao foi possivel ${context}.`, { cause: result.error })
  }
  if (result.data === null) {
    throw new DataError(`Nao foi possivel ${context}.`)
  }
  return result.data
}

// -----------------------------------------------------------------------------
// Normalizacao: colunas numeric podem chegar como string via PostgREST
// -----------------------------------------------------------------------------
const nullableNumber = (value: unknown): number | null =>
  value === null || value === undefined ? null : toNumber(value)

export function mapOccurrence(row: OccurrenceRow): OccurrenceRow {
  return {
    ...row,
    severity: toNumber(row.severity),
    affected_people: toNumber(row.affected_people),
    affected_families: toNumber(row.affected_families),
    latitude: nullableNumber(row.latitude),
    longitude: nullableNumber(row.longitude),
  }
}

export function mapShelter(row: ShelterRow): ShelterRow {
  return {
    ...row,
    capacity: toNumber(row.capacity),
    current_occupancy: toNumber(row.current_occupancy),
    latitude: nullableNumber(row.latitude),
    longitude: nullableNumber(row.longitude),
  }
}

export function mapResource(row: ResourceRow): ResourceRow {
  return {
    ...row,
    minimum_stock: toNumber(row.minimum_stock),
    demand_per_person: toNumber(row.demand_per_person),
  }
}

export function mapStock(row: StockRow): StockRow {
  return { ...row, quantity: toNumber(row.quantity) }
}

export function mapMovement(row: MovementRow): MovementRow {
  return { ...row, quantity: toNumber(row.quantity) }
}

export function mapRecommendation(row: OccurrenceShelterRow): OccurrenceShelterRow {
  return {
    ...row,
    distance_km: nullableNumber(row.distance_km),
    score: nullableNumber(row.score),
  }
}
