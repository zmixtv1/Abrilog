import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Flame,
  MapPin,
  PlusCircle,
  Siren,
  Users,
} from 'lucide-react'

import { loadSnapshot } from '@/lib/data/snapshot'
import { formatElapsed, formatNumber } from '@/lib/utils/format'
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_TYPE_LABELS, occurrenceTypeLabel, severityLabel } from '@/lib/utils/labels'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import {
  Card,
  CardBody,
  CardHeader,
  OccurrenceStatusBadge,
  PageHeader,
  PriorityBadge,
  inputClass,
} from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'
import {
  OCCURRENCE_STATUSES,
  OCCURRENCE_TYPES,
  type OccurrenceStatus,
  type OccurrenceType,
} from '@/types/domain'

export const metadata: Metadata = { title: 'Ocorrências · AbrigoLog' }

export default async function OccurrencesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const filters = await searchParams
  const snapshot = await loadSnapshot()

  const status = OCCURRENCE_STATUSES.includes(filters.status as OccurrenceStatus)
    ? (filters.status as OccurrenceStatus)
    : undefined
  const type = OCCURRENCE_TYPES.includes(filters.type as OccurrenceType)
    ? (filters.type as OccurrenceType)
    : undefined

  const rows = snapshot.prioritized.filter(
    (item) =>
      (status === undefined || item.occurrence.status === status) &&
      (type === undefined || item.occurrence.type === type),
  )

  const totalActive = snapshot.prioritized.filter((i) => i.occurrence.status !== 'encerrada').length
  const totalCritical = snapshot.prioritized.filter((i) => i.priority.score >= 80).length
  const totalPeople = snapshot.prioritized.reduce((acc, i) => acc + i.occurrence.affected_people, 0)

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Ocorrências"
        description="Lista de incidentes ordenada pelo score determinístico do motor de regras (Severidade 40%, Pessoas 30%, Déficit 20%, Urgência 10%)."
        action={
          <Link
            href="/ocorrencias/nova"
            className="anime-btn-glow flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Registrar Ocorrência</span>
          </Link>
        }
      />

      {/* Resumo Rápido Intuitivo das Ocorrências com Animações Anime.js */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200/80 bg-white p-4 shadow-sm anime-card anime-entry anime-delay-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 anime-icon-bounce">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500">Incidentes Ativos</span>
            <span className="block font-mono text-2xl font-extrabold text-slate-900">
              <AnimatedCounter value={totalActive} duration={800} />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-white p-4 shadow-sm anime-card anime-entry anime-delay-2 relative overflow-hidden">
          {totalCritical > 0 && (
            <span className="anime-beacon text-red-500 absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 anime-icon-bounce">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500">Prioridade Crítica</span>
            <span className="block font-mono text-2xl font-extrabold text-red-700">
              <AnimatedCounter value={totalCritical} duration={800} />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-sm anime-card anime-entry anime-delay-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 anime-icon-bounce">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500">Pessoas Afetadas</span>
            <span className="block font-mono text-2xl font-extrabold text-emerald-900">
              <AnimatedCounter value={totalPeople} duration={900} />
            </span>
          </div>
        </div>
      </div>

      {/* Box de Filtros Intuitivo */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm anime-card anime-entry anime-delay-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5 text-emerald-600" />
          <span>Filtrar Ocorrências</span>
        </div>

        <form method="get" className="mt-4 flex flex-wrap items-end gap-3.5">
          <div className="min-w-44">
            <label htmlFor="status" className="mb-1 block text-xs font-semibold text-slate-600 uppercase">
              Status do Atendimento
            </label>
            <select id="status" name="status" defaultValue={status ?? ''} className={inputClass}>
              <option value="">Todos os status</option>
              {OCCURRENCE_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {OCCURRENCE_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-44">
            <label htmlFor="type" className="mb-1 block text-xs font-semibold text-slate-600 uppercase">
              Tipo de Incidente
            </label>
            <select id="type" name="type" defaultValue={type ?? ''} className={inputClass}>
              <option value="">Todos os tipos</option>
              {OCCURRENCE_TYPES.map((option) => (
                <option key={option} value={option}>
                  {OCCURRENCE_TYPE_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800"
          >
            Aplicar Filtros
          </button>

          {status || type ? (
            <Link
              href="/ocorrencias"
              className="px-2 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              Limpar Filtros
            </Link>
          ) : null}
        </form>
      </div>

      {/* Lista de Ocorrencias em Glassmorphism */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {rows.length} ocorrência(s) encontrada(s)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Clique no título para visualizar a recomendação de abrigos e a demanda de recursos.
            </p>
          </div>

          <span className="font-mono text-xs text-slate-500">
            Ordenado por Score de Prioridade ↓
          </span>
        </div>

        <DataTable
          rows={rows}
          rowKey={(item) => item.occurrence.id}
          caption="Lista de ocorrências com prioridade calculada"
          empty={{
            title: 'Nenhuma ocorrência encontrada',
            description:
              'Ajuste os filtros ou registre uma nova ocorrência para iniciar o fluxo de atendimento.',
            action: (
              <Link
                href="/ocorrencias/nova"
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Registrar Ocorrência
              </Link>
            ),
          }}
          columns={[
            {
              key: 'title',
              header: 'Ocorrência',
              render: (item) => (
                <div>
                  <Link
                    href={`/ocorrencias/${item.occurrence.id}`}
                    className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                  >
                    {item.occurrence.title}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {occurrenceTypeLabel(item.occurrence.type)}
                    </span>
                    <span>·</span>
                    <span>{item.occurrence.neighborhood ?? item.occurrence.city}</span>
                    <span>·</span>
                    <span className="text-[11px]">{formatElapsed(item.occurrence.created_at)}</span>
                  </p>
                </div>
              ),
            },
            {
              key: 'severity',
              header: 'Severidade',
              hideOnMobile: true,
              render: (item) => (
                <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-xs font-bold text-red-800 shadow-2xs">
                  <Flame className="h-3 w-3 text-red-600" />
                  {item.occurrence.severity} · {severityLabel(item.occurrence.severity)}
                </span>
              ),
            },
            {
              key: 'people',
              header: 'Pessoas',
              align: 'right',
              render: (item) => (
                <div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatNumber(item.occurrence.affected_people)}
                  </span>
                  <span className="block text-[10px] text-slate-500">afetadas</span>
                </div>
              ),
            },
            {
              key: 'families',
              header: 'Famílias',
              align: 'right',
              hideOnMobile: true,
              render: (item) => (
                <span className="font-mono text-xs text-slate-700">
                  {formatNumber(item.occurrence.affected_families)}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (item) => <OccurrenceStatusBadge status={item.occurrence.status} />,
            },
            {
              key: 'priority',
              header: 'Prioridade',
              align: 'right',
              render: (item) => (
                <div className="flex flex-col items-end gap-1">
                  <PriorityBadge level={item.priority.level} score={item.priority.score} />
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full ${
                        item.priority.score >= 80
                          ? 'bg-red-500'
                          : item.priority.score >= 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, item.priority.score))}%` }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'action',
              header: 'Ação',
              align: 'right',
              render: (item) => (
                <Link
                  href={`/ocorrencias/${item.occurrence.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/80 transition hover:bg-emerald-100"
                >
                  <span>Ficha</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
