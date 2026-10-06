/**
 * Ponte entre FormData / JSON e os schemas zod.
 *
 * Mantem as mensagens de erro em formato unico (campo -> mensagens), usado
 * tanto pelos formularios (Server Actions) quanto pela API (Route Handlers).
 */

import type { ZodType } from 'zod'

export type FieldErrors = Record<string, string[]>

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; errors: FieldErrors }

/** Valida um objeto e devolve erros agrupados por campo. */
export function parsePayload<T>(schema: ZodType<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join('.') : '_form'
    errors[key] = [...(errors[key] ?? []), issue.message]
  }

  const first = result.error.issues[0]?.message ?? 'Dados invalidos.'
  return { success: false, message: first, errors }
}

// -----------------------------------------------------------------------------
// Extratores de FormData (campo vazio vira null, nao string vazia)
// -----------------------------------------------------------------------------
export function formText(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function formNumber(formData: FormData, key: string): number | null {
  const value = formText(formData, key)
  if (value === null) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

/** Checkbox marcado chega como 'on' (ou qualquer valor nao vazio). */
export function formBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key)
  return value !== null && value !== 'false' && value !== ''
}

/** Numero obrigatorio: ausencia vira NaN para o zod acusar o campo. */
export function requiredNumber(formData: FormData, key: string): number {
  const value = formNumber(formData, key)
  return value === null ? Number.NaN : value
}

/** Numero opcional com valor padrao quando o campo nao foi preenchido. */
export function numberOr(formData: FormData, key: string, fallback: number): number {
  const value = formNumber(formData, key)
  return value === null ? fallback : value
}

/** Remove chaves com valor undefined (PATCH parcial sem apagar campos). */
export function definedFields<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}
