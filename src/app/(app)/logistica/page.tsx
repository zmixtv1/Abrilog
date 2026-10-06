import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Package, Sparkles, Truck } from 'lucide-react'

import { loadLogistics } from '@/lib/data/logistics'
import { requireSession } from '@/lib/auth/session'
import { formatDateTime, formatNumber, formatPercent } from '@/lib/utils/format'
import { movementTypeLabel } from '@/lib/utils/labels'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  PriorityBadge,
  StatCard,
} from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'
import { MovementForm, SuggestionActionForm } from '@/components/logistics/movement-form'

export const metadata: Metadata = { title: 'Central Logística · AbrigoLog' }

export default async function LogisticsPage() {
  const [session, view] = await Promise.all([requireSession(), loadLogistics()])
  const { snapshot, suggestions, movements } = view
  const readOnly = !session.canWrite

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Central Logística & Distribuição"
        description="Balanço consolidado de suprimentos e ações de distribuição calculadas determinísticamente pelo motor de regras do PN-PDC."
      />

      {/* 4 StatCards em Glassmorphism */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Recursos em déficit"
          value={snapshot.deficits.length}
          tone={snapshot.deficits.length > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Cobertura logística"
          value={formatPercent(snapshot.indicators.logisticsCoverageRate)}
          hint="min(estoque, demanda) / demanda"
        />
        <StatCard
          label="Déficit sistêmico"
          value={formatPercent(snapshot.systemDeficitScore)}
          tone={snapshot.systemDeficitScore > 20 ? 'danger' : 'brand'}
          hint="demanda sem cobertura (ponderada)"
        />
        <StatCard label="Ações sugeridas" value={suggestions.length} tone="success" />
      </div>

      {/* Acoes Recomendadas pelo Motor em Destaque */}
      <div className="rounded-3xl border border-emerald-200/80 bg-white p-6 shadow-sm anime-card anime-entry">
        <div className="flex flex-col justify-between gap-2 border-b border-emerald-100 pb-3.5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-2xs">
                <Truck className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Ações logísticas recomendadas pelo motor
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Destino preferencial: abrigo mais pressionado. Origem: abrigo com maior excedente.
            </p>
          </div>

          <span className="rounded-lg border border-emerald-200 bg-emerald-100/80 px-2.5 py-1 font-mono text-xs font-bold text-emerald-900">
            {suggestions.length} ação(ões) pendente(s)
          </span>
        </div>

        <div className="mt-4.5 space-y-3.5">
          {suggestions.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-white/80 p-8 text-center text-emerald-900">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-2 text-sm font-bold">Nenhuma ação necessária no momento</p>
              <p className="mt-1 text-xs text-slate-500">
                O estoque atual cobre a demanda estimada de todas as ocorrências ativas.
              </p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <article
                key={`${suggestion.resource_id}-${suggestion.destination_shelter_id}`}
                className="rounded-xl border border-slate-200/80 bg-white/90 p-4.5 shadow-2xs transition hover:border-emerald-300 hover:shadow-xs"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 uppercase border border-emerald-200/60">
                      Ação Recomendada
                    </span>
                    <p className="mt-1.5 text-base font-extrabold text-slate-900">
                      {suggestion.movement_type === 'transferencia'
                        ? `Transferir ${formatNumber(suggestion.quantity)} ${suggestion.unit} de ${suggestion.resource_name}`
                        : `Aquisição Externa: ${formatNumber(suggestion.quantity)} ${suggestion.unit} de ${suggestion.resource_name}`}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {suggestion.origin_shelter_name ? (
                        <>
                          De <strong className="text-slate-800">{suggestion.origin_shelter_name}</strong> para{' '}
                        </>
                      ) : (
                        'Destino: '
                      )}
                      <Link
                        href={`/abrigos/${suggestion.destination_shelter_id}`}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        {suggestion.destination_shelter_name}
                      </Link>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <PriorityBadge level={suggestion.priority} />
                    <Badge tone={suggestion.movement_type === 'transferencia' ? 'brand' : 'warning'}>
                      {movementTypeLabel(suggestion.movement_type)}
                    </Badge>
                  </div>
                </header>

                <p className="mt-2.5 text-xs text-slate-600">
                  <strong className="text-slate-900 font-semibold">Justificativa do motor: </strong>
                  {suggestion.reason}
                </p>

                {suggestion.occurrence_id ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Ocorrência vinculada:{' '}
                    <Link
                      href={`/ocorrencias/${suggestion.occurrence_id}`}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {suggestion.occurrence_title}
                    </Link>
                  </p>
                ) : null}

                {readOnly ? null : (
                  <div className="mt-3.5 border-t border-slate-100 pt-3">
                    <SuggestionActionForm
                      defaults={{
                        resource_id: suggestion.resource_id,
                        movement_type: suggestion.movement_type,
                        quantity: suggestion.quantity,
                        origin_shelter_id: suggestion.origin_shelter_id,
                        destination_shelter_id: suggestion.destination_shelter_id,
                        reason: suggestion.reason.slice(0, 240),
                      }}
                      label={
                        suggestion.movement_type === 'transferencia'
                          ? 'Confirmar transferência sugerida'
                          : 'Confirmar entrada externa sugerida'
                      }
                    />
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      {/* Tabela Demanda x Estoque x Deficit */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm anime-card anime-entry">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Situação geral dos recursos na rede
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Ordenado pelo déficit relativo para comparar itens de diferentes unidades de medida.
          </p>
        </div>

        <DataTable
          rows={snapshot.balances}
          rowKey={(balance) => balance.resource_id}
          caption="Demanda, estoque, déficit e prioridade por recurso"
          empty={{ title: 'Nenhum recurso cadastrado' }}
          columns={[
            {
              key: 'resource',
              header: 'Recurso',
              render: (b) => <span className="font-bold text-slate-900">{b.resource_name}</span>,
            },
            {
              key: 'stock',
              header: 'Estoque',
              align: 'right',
              render: (b) => (
                <span className="font-mono text-slate-800">
                  {formatNumber(b.stock)} {b.unit}
                </span>
              ),
            },
            {
              key: 'demand',
              header: 'Demanda Estimada',
              align: 'right',
              render: (b) => <span className="font-mono text-slate-700">{formatNumber(b.demand)}</span>,
            },
            {
              key: 'deficit',
              header: 'Déficit',
              align: 'right',
              render: (b) =>
                b.deficit > 0 ? (
                  <span className="font-mono font-bold text-red-700">
                    -{formatNumber(b.deficit)}
                  </span>
                ) : (
                  <span className="font-mono text-slate-400">0</span>
                ),
            },
            {
              key: 'coverage',
              header: 'Cobertura',
              align: 'right',
              hideOnMobile: true,
              render: (b) => (
                <span className="font-mono font-semibold text-slate-800">
                  {formatPercent(b.coverage)}
                </span>
              ),
            },
            {
              key: 'priority',
              header: 'Prioridade',
              align: 'right',
              render: (b) =>
                b.deficit > 0 ? (
                  <PriorityBadge level={b.priority} />
                ) : (
                  <Badge tone="success">100% Coberto</Badge>
                ),
            },
          ]}
        />
      </div>

      {/* Registro Manual de Movimentacao */}
      {readOnly ? null : (
        <Card>
          <CardHeader
            title="Registrar movimentação manual"
            description="Entrada (doações / compras), saída (consumo) ou transferência entre abrigos."
          />
          <CardBody>
            <MovementForm shelters={snapshot.shelters} resources={snapshot.resources} />
          </CardBody>
        </Card>
      )}

      {/* Historico Recente */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Histórico de movimentações recentes
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Últimos 20 registros auditados.</p>
        </div>

        <DataTable
          rows={movements}
          rowKey={(movement) => movement.id}
          caption="Histórico de movimentações"
          empty={{
            title: 'Nenhuma movimentação registrada',
            description: 'Registre a primeira entrada de recursos para iniciar o histórico.',
          }}
          columns={[
            {
              key: 'date',
              header: 'Data / Hora',
              render: (m) => (
                <span className="font-mono text-xs text-slate-600">{formatDateTime(m.created_at)}</span>
              ),
            },
            {
              key: 'type',
              header: 'Tipo',
              render: (m) => (
                <Badge
                  tone={
                    m.movement_type === 'entrada'
                      ? 'success'
                      : m.movement_type === 'saida'
                        ? 'warning'
                        : 'brand'
                  }
                >
                  {movementTypeLabel(m.movement_type)}
                </Badge>
              ),
            },
            {
              key: 'resource',
              header: 'Recurso',
              render: (m) => <span className="font-semibold text-slate-800">{m.resource_name}</span>,
            },
            {
              key: 'quantity',
              header: 'Quantidade',
              align: 'right',
              render: (m) => (
                <span className="font-mono font-bold text-slate-900">
                  {formatNumber(m.quantity)} {m.resource_unit}
                </span>
              ),
            },
            {
              key: 'route',
              header: 'Origem → Destino',
              hideOnMobile: true,
              render: (m) => (
                <span className="text-xs text-slate-600 font-medium">
                  {m.origin_name ?? 'Externo'} → {m.destination_name ?? 'Consumo'}
                </span>
              ),
            },
            {
              key: 'reason',
              header: 'Motivo',
              hideOnMobile: true,
              render: (m) => <span className="text-xs text-slate-600">{m.reason ?? '-'}</span>,
            },
          ]}
        />
      </div>
    </div>
  )
}
