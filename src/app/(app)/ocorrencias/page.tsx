import type { Metadata } from 'next'
import Link from 'next/link'

import { loadSnapshot } from '@/lib/data/snapshot'
import { formatElapsed, formatNumber } from '@/lib/utils/format'
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_TYPE_LABELS, occurrenceTypeLabel } from '@/lib/utils/labels'
import {
  Card,
  CardBody,
  CardHeader,
  OccurrenceStatusBadge,
  PageHeader,
  PriorityBadge,
  SeverityBadge,
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

  return (
    <>
      <PageHeader
        title="Ocorrências"
        description="Lista ordenada pelo score de prioridade calculado pelo motor de regras (severidade 40%, pessoas afetadas 30%, déficit de recursos 20%, urgência 10%)."
        action={
          <Link
            href="/ocorrencias/nova"
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Registrar ocorrência
          </Link>
        }
      />

      <Card>
        <CardHeader title="Filtros" />
        <CardBody>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium">
                Status
              </label>
              <select id="status" name="status" defaultValue={status ?? ''} className={inputClass}>
                <option value="">Todos</option>
                {OCCURRENCE_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {OCCURRENCE_STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium">
                Tipo
              </label>
              <select id="type" name="type" defaultValue={type ?? ''} className={inputClass}>
                <option value="">Todos</option>
                {OCCURRENCE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {OCCURRENCE_TYPE_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
            >
              Aplicar filtros
            </button>

            {status || type ? (
              <Link href="/ocorrencias" className="px-1 py-2 text-sm text-brand underline">
                Limpar
              </Link>
            ) : null}
          </form>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader
          title={`${rows.length} ocorrência(s)`}
          description="Clique no título para ver prioridade detalhada, demanda de recursos e abrigos recomendados."
        />
        <CardBody className="px-0 py-0">
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
                  className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Registrar ocorrência
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
                      className="font-medium hover:underline"
                    >
                      {item.occurrence.title}
                    </Link>
                    <p className="text-xs text-muted">
                      {occurrenceTypeLabel(item.occurrence.type)} ·{' '}
                      {item.occurrence.neighborhood ?? item.occurrence.city} ·{' '}
                      {formatElapsed(item.occurrence.created_at)}
                    </p>
                  </div>
                ),
              },
              {
                key: 'severity',
                header: 'Severidade',
                hideOnMobile: true,
                render: (item) => <SeverityBadge severity={item.occurrence.severity} />,
              },
              {
                key: 'people',
                header: 'Pessoas',
                align: 'right',
                render: (item) => formatNumber(item.occurrence.affected_people),
              },
              {
                key: 'families',
                header: 'Famílias',
                align: 'right',
                hideOnMobile: true,
                render: (item) => formatNumber(item.occurrence.affected_families),
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
                  <PriorityBadge level={item.priority.level} score={item.priority.score} />
                ),
              },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}
