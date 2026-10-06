/**
 * Tipos de dominio do AbrigoLog.
 *
 * Este arquivo e deliberadamente livre de dependencias (nao importa Next,
 * Supabase ou zod) para que o motor de regras possa ser compilado e testado
 * isoladamente (`npm run test:engine`).
 *
 * Os valores gravados no banco nao usam acento; os rotulos acentuados ficam
 * em `src/lib/utils/labels.ts`.
 */

// -----------------------------------------------------------------------------
// Dominios
// -----------------------------------------------------------------------------
export const USER_ROLES = ['admin', 'operador', 'visualizador'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const OCCURRENCE_TYPES = [
  'enchente',
  'alagamento',
  'deslizamento',
  'incendio',
  'estiagem',
  'tempestade',
  'outro',
] as const
export type OccurrenceType = (typeof OCCURRENCE_TYPES)[number]

export const OCCURRENCE_STATUSES = [
  'aberta',
  'em_atendimento',
  'controlada',
  'encerrada',
] as const
export type OccurrenceStatus = (typeof OCCURRENCE_STATUSES)[number]

export const SHELTER_STATUSES = [
  'disponivel',
  'parcialmente_ocupado',
  'lotado',
  'indisponivel',
] as const
export type ShelterStatus = (typeof SHELTER_STATUSES)[number]

export const MOVEMENT_TYPES = ['entrada', 'saida', 'transferencia'] as const
export type MovementType = (typeof MOVEMENT_TYPES)[number]

export const SEVERITY_LEVELS = [1, 2, 3, 4, 5] as const
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number]

/** Classificacao de prioridade produzida pelo motor de pontuacao. */
export const PRIORITY_LEVELS = ['baixa', 'moderada', 'alta', 'critica'] as const
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number]

// -----------------------------------------------------------------------------
// Linhas das tabelas (espelham o schema SQL)
// -----------------------------------------------------------------------------
export type ProfileRow = {
  id: string
  full_name: string | null
  role: UserRole
  organization: string | null
  created_at: string
}

export type OccurrenceRow = {
  id: string
  title: string
  description: string | null
  type: OccurrenceType
  severity: number
  status: OccurrenceStatus
  city: string
  state: string
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  affected_people: number
  affected_families: number
  created_at: string
  updated_at: string
  created_by: string | null
}

export type ShelterRow = {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string
  latitude: number | null
  longitude: number | null
  capacity: number
  current_occupancy: number
  status: ShelterStatus
  has_water: boolean
  has_food: boolean
  has_medical_support: boolean
  has_accessibility: boolean
  created_at: string
  updated_at: string
}

export type AffectedPeopleRow = {
  id: string
  occurrence_id: string
  adults: number
  children: number
  elderly: number
  people_with_disabilities: number
  total_people: number
  created_at: string
}

export type ResourceRow = {
  id: string
  name: string
  category: string
  unit: string
  minimum_stock: number
  demand_per_person: number
  created_at: string
}

export type StockRow = {
  id: string
  shelter_id: string
  resource_id: string
  quantity: number
  updated_at: string
}

export type MovementRow = {
  id: string
  resource_id: string
  origin_shelter_id: string | null
  destination_shelter_id: string | null
  quantity: number
  movement_type: MovementType
  reason: string | null
  created_at: string
  created_by: string | null
}

export type OccurrenceShelterRow = {
  id: string
  occurrence_id: string
  shelter_id: string
  recommended: boolean
  distance_km: number | null
  score: number | null
  created_at: string
}

export type AuditLogRow = {
  id: string
  user_id: string | null
  action: 'insert' | 'update' | 'delete'
  entity: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// -----------------------------------------------------------------------------
// Linhas das views agregadas
// -----------------------------------------------------------------------------
export type DashboardCountersRow = {
  active_occurrences: number
  total_occurrences: number
  handled_occurrences: number
  affected_people: number
  active_shelters: number
  total_capacity: number
  total_occupancy: number
  available_vacancies: number
  avg_response_hours: number | null
}

export type StockTotalRow = {
  resource_id: string
  resource_name: string
  unit: string
  minimum_stock: number
  total_quantity: number
}

// -----------------------------------------------------------------------------
// Entradas minimas exigidas pelo motor de regras
// (usar estruturas minimas mantem o motor testavel sem banco)
// -----------------------------------------------------------------------------
export interface OccurrenceInput {
  id: string
  title?: string
  severity: number
  status?: OccurrenceStatus
  affected_people: number
  latitude?: number | null
  longitude?: number | null
  created_at: string | Date
}

export interface ShelterInput {
  id: string
  name: string
  latitude?: number | null
  longitude?: number | null
  capacity: number
  current_occupancy: number
  status: ShelterStatus
  has_water: boolean
  has_food: boolean
  has_medical_support: boolean
  has_accessibility: boolean
}

export interface ResourceInput {
  id: string
  name: string
  unit: string
  category?: string
  minimum_stock?: number
  demand_per_person: number
}

export interface StockInput {
  shelter_id: string
  resource_id: string
  quantity: number
}
