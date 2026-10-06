import type { Metadata } from 'next'
import Link from 'next/link'

import { loadSnapshot } from '@/lib/data/snapshot'
import { requireSession } from '@/lib/auth/session'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  PriorityBadge,
  StatCard,
} from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'
import { ResourceForm, StockForm } from '@/components/resources/resource-forms'

export const metadata: Metadata = { title: 'Recursos · AbrigoLog' }

export default async function ResourcesPage() {
  const [session, snapshot] = await Promise.all([requireSession(), loadSnapshot()])
  const { balances, resources, shelters, stock, indicators } = snapshot

  const stockByShelter = shelters.map((shelter) => ({
    shelter,
    lines: stock
      .filter((row) => row.shelter_id === shelter.id)
      .map((row) => ({
        row,
        resource: resources.find((resource) => resource.id === row.resource_id),
      }))
      .filter((item) => item.resource !== undefined),
  }))

  return (
    <>
      <PageHeader
        title="Recursos"
        description="Catálogo, estoque consolidado e demanda estimada. A demanda por pessoa é um parâmetro demonstrativo do protótipo."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recursos cadastrados" value={resources.length} />
        <StatCard
          label="Em déficit"
          value={indicators.resourcesInDeficitCount}
          tone={indicators.resourcesInDeficitCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Abaixo do estoque mínimo"
          value={indicators.resourcesBelowMinimumCount}
          tone={indicators.resourcesBelowMinimumCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Cobertura logística"
          value={formatPercent(indicators.logisticsCoverageRate)}
          tone={indicators.logisticsCoverageRate >= 100 ? 'success' : 'brand'}
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Catálogo e situação de estoque"
          description="Demanda = pessoas afetadas em ocorrências ativas × demanda por pessoa."
          action={
            <Link href="/logistica" className="text-sm text-brand underline">
              Central Logística
            </Link>
          }
        />
        <CardBody className="px-0 py-0">
          <DataTable
            rows={balances}
            rowKey={(balance) => balance.resource_id}
            caption="Catálogo de recursos com demanda, estoque e déficit"
            empty={{
              title: 'Nenhum recurso cadastrado',
              description: 'Cadastre os recursos humanitários para habilitar os cálculos de demanda.',
            }}
            columns={[
              {
                key: 'resource',
                header: 'Recurso',
                render: (balance) => (
                  <div>
                    <p className="font-medium">{balance.resource_name}</p>
                    <p className="text-xs text-muted">
                      {balance.category} · mínimo {formatNumber(balance.minimum_stock)}{' '}
                      {balance.unit}
                    </p>
                  </div>
                ),
              },
              {
                key: 'stock',
                header: 'Estoque',
                align: 'right',
                render: (balance) => (
                  <span className={balance.belowMinimum ? 'font-semibold text-warning' : ''}>
                    {formatNumber(balance.stock)} {balance.unit}
                  </span>
                ),
              },
              {
                key: 'demand',
                header: 'Demanda',
                align: 'right',
                render: (balance) => formatNumber(balance.demand),
              },
              {
                key: 'deficit',
                header: 'Déficit',
                align: 'right',
                render: (balance) =>
                  balance.deficit > 0 ? (
                    <strong className="text-danger">{formatNumber(balance.deficit)}</strong>
                  ) : (
                    <span className="text-muted">0</span>
                  ),
              },
              {
                key: 'coverage',
                header: 'Cobertura',
                align: 'right',
                hideOnMobile: true,
                render: (balance) => formatPercent(balance.coverage),
              },
              {
                key: 'priority',
                header: 'Prioridade',
                align: 'right',
                render: (balance) =>
                  balance.deficit > 0 ? (
                    <PriorityBadge level={balance.priority} />
                  ) : (
                    <Badge tone="success">Coberto</Badge>
                  ),
              },
            ]}
          />
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Estoque por abrigo"
          description="Distribuição física dos recursos na rede."
        />
        <CardBody className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stockByShelter.map(({ shelter, lines }) => (
            <article key={shelter.id} className="rounded-md border border-line p-3">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <Link href={`/abrigos/${shelter.id}`} className="font-medium hover:underline">
                  {shelter.name}
                </Link>
                <span className="text-xs text-muted">{lines.length} item(ns)</span>
              </header>
              {lines.length === 0 ? (
                <p className="text-sm text-muted">Sem estoque registrado.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {lines.map(({ row, resource }) => (
                    <li key={row.id} className="flex justify-between gap-2">
                      <span className="truncate">{resource?.name}</span>
                      <span className="shrink-0 font-medium">
                        {formatNumber(row.quantity)} {resource?.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </CardBody>
      </Card>

      {session.canWrite ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Cadastrar recurso" />
            <CardBody>
              <ResourceForm />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Ajustar estoque"
              description="Define a quantidade exata de um recurso em um abrigo (inventário)."
            />
            <CardBody>
              <StockForm shelters={shelters} resources={resources} />
            </CardBody>
          </Card>
        </div>
      ) : null}
    </>
  )
}
