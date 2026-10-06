/**
 * Componentes de interface reutilizaveis (sem estado - seguros em Server Components).
 * Redesenhados com Glassmorphism Claro e Acentos em Verde Esmeralda Secundario.
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
      className={`rounded-3xl border border-slate-200/90 bg-white/95 shadow-sm anime-entry anime-card ${className}`}
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
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100/90 px-6 py-4">
      <div>
        <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase">{title}</h2>
        {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
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
  return <div className={`px-6 py-5 ${className}`}>{children}</div>
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 anime-entry">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 anime-beacon" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Painel Oficial · Defesa Civil
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-slate-600 leading-relaxed">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Indicadores
// -----------------------------------------------------------------------------
const TONES = {
  neutral: 'border-slate-200/80 bg-white/85 text-slate-900 shadow-2xs',
  brand: 'border-blue-200/80 bg-gradient-to-br from-blue-50/80 to-white/90 text-blue-950 shadow-2xs',
  danger: 'border-red-200/80 bg-gradient-to-br from-red-50/80 to-white/90 text-red-950 shadow-2xs',
  warning: 'border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white/90 text-amber-950 shadow-2xs',
  success: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white/90 text-emerald-950 shadow-2xs',
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
    <div
      className={`rounded-2xl border p-4.5 anime-card anime-entry shadow-2xs ${TONES[tone]}`}
    >
      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )

  return href ? (
    <Link href={href} className="block transition hover:opacity-90">
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
      ? 'bg-red-500'
      : tone === 'warning'
        ? 'bg-amber-500'
        : tone === 'success'
          ? 'bg-emerald-600'
          : 'bg-blue-600'

  return (
    <div>
      {label ? (
        <div className="mb-1.5 flex justify-between text-xs text-slate-600">
          <span>{label}</span>
          <span className="font-semibold text-slate-900">{formatPercent(clamped)}</span>
        </div>
      ) : null}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
        <div
          className={`h-full rounded-full transition-all duration-700 anime-progress-bar ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

/** Grafico de barras horizontais em CSS. */
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
    return <p className="py-4 text-center text-sm text-slate-500">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate font-medium text-slate-800">{item.label}</span>
            <span className="shrink-0 font-bold text-slate-900">
              {formatNumber(item.value)}
              {unitSuffix ? ` ${unitSuffix}` : ''}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/40">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          {item.hint ? <p className="mt-1 text-[11px] text-slate-500">{item.hint}</p> : null}
        </li>
      ))}
    </ul>
  )
}

// -----------------------------------------------------------------------------
// Selos de estado
// -----------------------------------------------------------------------------
const BADGE_BASE =
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap shadow-2xs'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: Tone
}) {
  const styles: Record<Tone, string> = {
    neutral: 'bg-slate-100/90 text-slate-700 border border-slate-200/80',
    brand: 'bg-blue-50/90 text-blue-700 border border-blue-200/80',
    danger: 'bg-red-50/90 text-red-700 border border-red-200/80',
    warning: 'bg-amber-50/90 text-amber-800 border border-amber-200/80',
    success: 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 font-bold',
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
  const tone: Tone =
    severity >= 5 ? 'danger' : severity >= 4 ? 'warning' : severity >= 3 ? 'brand' : 'neutral'
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
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center backdrop-blur-sm">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-5 text-sm text-slate-600 backdrop-blur-md">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600"
      />
      <span role="status" className="font-medium">{label}</span>
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
    <div className="rounded-xl border border-red-200 bg-red-50/80 px-6 py-8 text-center backdrop-blur-sm">
      <p className="text-sm font-semibold text-red-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-xs text-red-700 leading-relaxed">{description}</p>
      ) : null}
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
      className={`rounded-lg border px-3.5 py-2.5 text-xs font-medium ${
        isError
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold'
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
  'w-full rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-2xs'

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
      <label htmlFor={name} className="mb-1 block text-xs font-semibold tracking-wide text-slate-700 uppercase">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {errors?.map((error) => (
        <p key={error} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      ))}
    </div>
  )
}
