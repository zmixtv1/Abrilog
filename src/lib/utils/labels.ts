/**
 * Rotulos de apresentacao.
 *
 * O banco guarda valores sem acento (ex.: `incendio`, `saida`); a interface
 * mostra o texto correto em portugues.
 */

import type {
  MovementType,
  OccurrenceStatus,
  OccurrenceType,
  PriorityLevel,
  ShelterStatus,
  UserRole,
} from '@/types/domain'

export const OCCURRENCE_TYPE_LABELS: Record<OccurrenceType, string> = {
  enchente: 'Enchente',
  alagamento: 'Alagamento',
  deslizamento: 'Deslizamento',
  incendio: 'Incêndio',
  estiagem: 'Estiagem',
  tempestade: 'Tempestade',
  outro: 'Outro',
}

export const OCCURRENCE_STATUS_LABELS: Record<OccurrenceStatus, string> = {
  aberta: 'Aberta',
  em_atendimento: 'Em atendimento',
  controlada: 'Controlada',
  encerrada: 'Encerrada',
}

export const SHELTER_STATUS_LABELS: Record<ShelterStatus, string> = {
  disponivel: 'Disponível',
  parcialmente_ocupado: 'Parcialmente ocupado',
  lotado: 'Lotado',
  indisponivel: 'Indisponível',
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  transferencia: 'Transferência',
}

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  baixa: 'Baixa',
  moderada: 'Moderada',
  alta: 'Alta',
  critica: 'Crítica',
}

export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Baixa',
  2: 'Moderada',
  3: 'Alta',
  4: 'Muito alta',
  5: 'Crítica',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  visualizador: 'Visualizador (somente leitura)',
}

export const occurrenceTypeLabel = (value: OccurrenceType) => OCCURRENCE_TYPE_LABELS[value] ?? value
export const occurrenceStatusLabel = (value: OccurrenceStatus) =>
  OCCURRENCE_STATUS_LABELS[value] ?? value
export const shelterStatusLabel = (value: ShelterStatus) => SHELTER_STATUS_LABELS[value] ?? value
export const movementTypeLabel = (value: MovementType) => MOVEMENT_TYPE_LABELS[value] ?? value
export const priorityLabel = (value: PriorityLevel) => PRIORITY_LABELS[value] ?? value
export const severityLabel = (value: number) => SEVERITY_LABELS[value] ?? String(value)
export const roleLabel = (value: UserRole) => ROLE_LABELS[value] ?? value
