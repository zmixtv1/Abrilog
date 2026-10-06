import type { Metadata } from 'next'
import Link from 'next/link'

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
    <>
      <PageHeader
        title="Central Logística"
        description="Demanda estimada x estoque disponível, com ações de distribuição sugeridas pelo motor de regras."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <StatCard label="Ações sugeridas" value={suggestions.length} tone="brand" />
      </div>

      {/* Tabela demanda x estoque x deficit */}
      <Card className="mt-6">
        <CardHeader
          title="Situação dos recursos"
          description="Ordenado pelo déficit relativo (percentual da demanda sem cobertura), o que permite comparar recursos de unidades diferentes."
        />
        <CardBody className="px-0 py-0">
          <DataTable
            rows={snapshot.balances}
            rowKey={(balance) => balance.resource_id}
            caption="Demanda, estoque, déficit e prioridade por recurso"
            empty={{ title: 'Nenhum recurso cadastrado' }}
            columns={[
              { key: 'resource', header: 'Recurso', render: (b) => b.resource_name },
              {
                key: 'stock',
                header: 'Estoque',
                align: 'right',
                render: (b) => `${formatNumber(b.stock)} ${b.unit}`,
              },
              { key: 'demand', header: 'Demanda', align: 'right', render: (b) => formatNumber(b.demand) },
              {
                key: 'deficit',
                header: 'Déficit',
                align: 'right',
                render: (b) =>
                  b.deficit > 0 ? (
                    <strong className="text-danger">{formatNumber(b.deficit)}</strong>
                  ) : (
                    <span className="text-muted">0</span>
                  ),
              },
              {
                key: 'coverage',
                header: 'Cobertura',
                align: 'right',
                hideOnMobile: true,
                render: (b) => formatPercent(b.coverage),
              },
              {
                key: 'priority',
                header: 'Prioridade',
                align: 'right',
                render: (b) =>
                  b.deficit > 0 ? <PriorityBadge level={b.priority} /> : <Badge tone="success">Coberto</Badge>,
              },
            ]}
          />
        </CardBody>
      </Card>

      {/* Acoes recomendadas */}
      <Card className="mt-6">
        <CardHeader
          title="Ações recomendadas"
          description="Destino preferencial: abrigo recomendado para a ocorrência de maior prioridade. Origem: abrigo com maior estoque disponível do recurso."
        />
        <CardBody className="space-y-4">
          {suggestions.length === 0 ? (
            <EmptyState
              title="Nenhuma ação necessária"
              description="O estoque atual cobre a demanda estimada das ocorrências ativas."
            />
          ) : (
            suggestions.map((suggestion) => (
              <article
                key={`${suggestion.resource_id}-${suggestion.destination_shelter_id}`}
                className="rounded-md border border-line p-4"
              >
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                      Ação recomendada
                    </p>
                    <p className="mt-1 text-base font-semibold text-foreground">
                      {suggestion.movement_type === 'transferencia'
                        ? `Enviar ${formatNumber(suggestion.quantity)} ${suggestion.unit} de ${suggestion.resource_name}`
                        : `Adquirir ${formatNumber(suggestion.quantity)} ${suggestion.unit} de ${suggestion.resource_name}`}
                    </p>
                    <p className="text-sm text-muted">
                      {suggestion.origin_shelter_name
                        ? `De ${suggestion.origin_shelter_name} para `
                        : 'Para '}
                      <Link
                        href={`/abrigos/${suggestion.destination_shelter_id}`}
                        className="underline"
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

                <p className="mt-3 text-sm text-muted">
                  <strong className="text-foreground">Motivo: </strong>
                  {suggestion.reason}
                </p>

                {suggestion.occurrence_id ? (
                  <p className="mt-1 text-xs text-muted">
                    Ocorrência vinculada:{' '}
                    <Link href={`/ocorrencias/${suggestion.occurrence_id}`} className="underline">
                      {suggestion.occurrence_title}
                    </Link>
                  </p>
                ) : null}

                {readOnly ? null : (
                  <div className="mt-3 border-t border-line pt-3">
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
                          ? 'Registrar transferência sugerida'
                          : 'Registrar entrada sugerida'
                      }
                    />
                  </div>
                )}
              </article>
            ))
          )}
        </CardBody>
      </Card>

      {/* Registro manual */}
      {readOnly ? null : (
        <Card className="mt-6">
          <CardHeader
            title="Registrar movimentação"
            description="Entrada (recebimento), saída (consumo) ou transferência entre abrigos."
          />
          <CardBody>
            <MovementForm shelters={snapshot.shelters} resources={snapshot.resources} />
          </CardBody>
        </Card>
      )}

      {/* Historico */}
      <Card className="mt-6">
        <CardHeader title="Movimentações recentes" description="Últimos 20 registros." />
        <CardBody className="px-0 py-0">
          <DataTable
            rows={movements}
            rowKey={(movement) => movement.id}
            caption="Histórico de movimentações"
            empty={{
              title: 'Nenhuma movimentação registrada',
              description: 'Registre a primeira entrada de recursos para iniciar o histórico.',
            }}
            columns={[
              { key: 'date', header: 'Data', render: (m) => formatDateTime(m.created_at) },
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
              { key: 'resource', header: 'Recurso', render: (m) => m.resource_name },
              {
                key: 'quantity',
                header: 'Quantidade',
                align: 'right',
                render: (m) => `${formatNumber(m.quantity)} ${m.resource_unit}`,
              },
              {
                key: 'route',
                header: 'Origem → Destino',
                hideOnMobile: true,
                render: (m) => `${m.origin_name ?? 'Externo'} → ${m.destination_name ?? 'Consumo'}`,
              },
              {
                key: 'reason',
                header: 'Motivo',
                hideOnMobile: true,
                render: (m) => m.reason ?? '-',
              },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}
