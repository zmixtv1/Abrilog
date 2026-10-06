/** Formatacao pt-BR. Timezone fixo evita divergencia entre servidor e cliente. */

const TIME_ZONE = 'America/Sao_Paulo'

const numberFormatter = (digits: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  return numberFormatter(digits).format(value)
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  return `${numberFormatter(digits).format(value)}%`
}

export function formatQuantity(value: number | null | undefined, unit?: string | null): string {
  const formatted = formatNumber(value)
  return unit ? `${formatted} ${unit}` : formatted
}

export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined || !Number.isFinite(km)) return 'n/d'
  return `${numberFormatter(1).format(km)} km`
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: TIME_ZONE,
  }).format(date)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: TIME_ZONE }).format(date)
}

/** Duracao em horas -> "18 h" ou "2 d 6 h". */
export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) return 'n/d'
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours < 48) return `${numberFormatter(0).format(Math.round(hours))} h`
  const days = Math.floor(hours / 24)
  const rest = Math.round(hours - days * 24)
  return rest === 0 ? `${days} d` : `${days} d ${rest} h`
}

/** "há 8 h" a partir de um timestamp. */
export function formatElapsed(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const hours = Math.max(0, (now.getTime() - date.getTime()) / 3_600_000)
  return `há ${formatHours(hours)}`
}
