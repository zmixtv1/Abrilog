/** Utilitarios numericos compartilhados pelo motor de regras. */

/** Limita um valor ao intervalo [min, max]. */
export function clamp(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

/** Arredonda para `digits` casas decimais (evita 0.30000000000000004 na tela). */
export function round(value: number, digits = 1): number {
  if (!Number.isFinite(value)) return 0
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** Converte com seguranca valores numericos vindos do PostgREST (numeric -> string). */
export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

/** Percentual de `part` sobre `total`, com protecao contra divisao por zero. */
export function percentage(part: number, total: number, digits = 1): number {
  if (total <= 0) return 0
  return round((part / total) * 100, digits)
}
