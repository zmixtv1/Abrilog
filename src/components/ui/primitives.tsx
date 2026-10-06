/**
 * Componentes de interface reutilizaveis (sem estado - seguros em Server
 * Components). Esboco funcional: o visual pode ser substituido sem mexer na
 * logica, desde que os nomes e as props sejam mantidos.
 */

import Link from 'next/link'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import {
  occurrenceStatusLabel,
  priorityLabel,
  severityLabel,
  shelterStatusLabel,
} from '@/lib/utils/labels'
import type { ActionState } from '@/lib/actions/state'
import type { OccurrenceStatus, PriorityLevel, ShelterStatus } from '@/types/domain'

// -----------------------------------------------------------------------------
// Estrutura
// -----------------------------------------------------------------------------
export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function CardBody({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Indicadores
// -----------------------------------------------------------------------------
const TONES = {
  neutral: 'border-line bg-surface',
  brand: 'border-blue-200 bg-blue-50',
  danger: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  success: 'border-emerald-200 bg-emerald-50',
} as const

export type Tone = keyof typeof TONES

export function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
  href,
}: {
  label: string
  value: string | number
  hint?: string
  tone?: Tone
  href?: string
}) {
  const content = (
    <div className={`rounded-lg border p-4 ${TONES[tone]}`}>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  )

  return href ? (
    <Link href={href} className="block transition hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  )
}

export function ProgressBar({
  percentage,
  tone,
  label,
}: {
  percentage: number
  tone?: Tone
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const color =
    tone === 'danger'
      ? 'bg-red-600'
      : tone === 'warning'
        ? 'bg-amber-500'
        : tone === 'success'
          ? 'bg-emerald-600'
          : 'bg-blue-600'

  return (
    <div>
      {label ? (
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span>{formatPercent(clamped)}</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

/** Grafico de barras horizontais em CSS (sem biblioteca, sem JS no cliente). */
export function BarList({
  items,
  emptyMessage = 'Sem dados para exibir.',
  unitSuffix,
}: {
  items: Array<{ label: string; value: number; hint?: string }>
  emptyMessage?: string
  unitSuffix?: string
}) {
  const max = items.reduce((acc, item) => Math.max(acc, item.value), 0)

  if (items.length === 0 || max === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate text-foreground">{item.label}</span>
            <span className="shrink-0 font-medium text-foreground">
              {formatNumber(item.value)}
              {unitSuffix ? ` ${unitSuffix}` : ''}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          {item.hint ? <p className="mt-1 text-xs text-muted">{item.hint}</p> : null}
        </li>
      ))}
    </ul>
  )
}

// -----------------------------------------------------------------------------
// Selos de estado
// -----------------------------------------------------------------------------
const BADGE_BASE =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: Tone
}) {
  const styles: Record<Tone, string> = {
    neutral: 'bg-slate-100 text-slate-700',
    brand: 'bg-blue-100 text-blue-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-900',
    success: 'bg-emerald-100 text-emerald-800',
  }
  return <span className={`${BADGE_BASE} ${styles[tone]}`}>{children}</span>
}

export function PriorityBadge({ level, score }: { level: PriorityLevel; score?: number }) {
  const tone: Tone =
    level === 'critica'
      ? 'danger'
      : level === 'alta'
        ? 'warning'
        : level === 'moderada'
          ? 'brand'
          : 'neutral'

  return (
    <Badge tone={tone}>
      {priorityLabel(level)}
      {score === undefined ? '' : ` · ${formatNumber(score, 1)}`}
    </Badge>
  )
}

export function OccurrenceStatusBadge({ status }: { status: OccurrenceStatus }) {
  const tone: Tone =
    status === 'aberta'
      ? 'danger'
      : status === 'em_atendimento'
        ? 'warning'
        : status === 'controlada'
          ? 'brand'
          : 'success'
  return <Badge tone={tone}>{occurrenceStatusLabel(status)}</Badge>
}

export function ShelterStatusBadge({ status }: { status: ShelterStatus }) {
  const tone: Tone =
    status === 'disponivel'
      ? 'success'
      : status === 'parcialmente_ocupado'
        ? 'brand'
        : status === 'lotado'
          ? 'warning'
          : 'neutral'
  return <Badge tone={tone}>{shelterStatusLabel(status)}</Badge>
}

export function SeverityBadge({ severity }: { severity: number }) {
  const tone: Tone = severity >= 5 ? 'danger' : severity >= 4 ? 'warning' : severity >= 3 ? 'brand' : 'neutral'
  return (
    <Badge tone={tone}>
      {severity} · {severityLabel(severity)}
    </Badge>
  )
}

// -----------------------------------------------------------------------------
// Estados de tela
// -----------------------------------------------------------------------------
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-6 text-sm text-muted">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
      />
      <span role="status">{label}</span>
    </div>
  )
}

export function ErrorState({
  title = 'Não foi possível carregar os dados',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm font-semibold text-red-800">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-red-700">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

/** Resultado de uma Server Action (sucesso ou erro) com tom adequado. */
export function FormFeedback({ state }: { state: ActionState }) {
  if (state.status === 'idle' || state.message === '') return null

  const isError = state.status === 'error'
  return (
    <p
      role="status"
      aria-live="polite"
      className={`rounded-md border px-3 py-2 text-sm ${
        isError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      {isError ? '⚠ ' : '✓ '}
      {state.message}
    </p>
  )
}

// -----------------------------------------------------------------------------
// Formulario
// -----------------------------------------------------------------------------
export const inputClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground placeholder:text-slate-400 focus:border-blue-500 focus:outline-none'

export function Field({
  label,
  name,
  children,
  hint,
  errors,
  required,
}: {
  label: string
  name: string
  children: React.ReactNode
  hint?: string
  errors?: string[]
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {errors?.map((error) => (
        <p key={error} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      ))}
    </div>
  )
}
