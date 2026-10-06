import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Layers, Package, Truck } from 'lucide-react'

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
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Catálogo & Estoque de Recursos"
        description="Gestão de suprimentos humanitários, estoque consolidado na rede e estimativa de demanda por pessoas afetadas."
      />

      {/* 4 StatCards com Destaque Verde Esmeralda */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Tabela do Catalogo */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm anime-card anime-entry">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Catálogo e situação de estoque
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Demanda = pessoas afetadas em ocorrências ativas × demanda padrão por pessoa.
            </p>
          </div>
          <Link
            href="/logistica"
            className="anime-btn-glow inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100"
          >
            <Truck className="h-3.5 w-3.5 text-emerald-700" />
            <span>Abrir Central Logística</span>
          </Link>
        </div>

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
                  <p className="font-bold text-slate-900">{balance.resource_name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {balance.category} · estoque mínimo {formatNumber(balance.minimum_stock)}{' '}
                    {balance.unit}
                  </p>
                </div>
              ),
            },
            {
              key: 'stock',
              header: 'Estoque Disponível',
              align: 'right',
              render: (balance) => (
                <span
                  className={`font-mono ${
                    balance.belowMinimum
                      ? 'font-bold text-amber-700'
                      : 'font-semibold text-slate-800'
                  }`}
                >
                  {formatNumber(balance.stock)} {balance.unit}
                </span>
              ),
            },
            {
              key: 'demand',
              header: 'Demanda Estimada',
              align: 'right',
              render: (balance) => (
                <span className="font-mono text-slate-700">
                  {formatNumber(balance.demand)}
                </span>
              ),
            },
            {
              key: 'deficit',
              header: 'Déficit',
              align: 'right',
              render: (balance) =>
                balance.deficit > 0 ? (
                  <span className="font-mono font-bold text-red-700">
                    -{formatNumber(balance.deficit)}
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
              render: (balance) => (
                <div className="flex items-center justify-end gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-800">
                    {formatPercent(balance.coverage)}
                  </span>
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full ${
                        balance.coverage >= 100
                          ? 'bg-emerald-600'
                          : balance.coverage >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, balance.coverage))}%` }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'priority',
              header: 'Prioridade',
              align: 'right',
              render: (balance) =>
                balance.deficit > 0 ? (
                  <PriorityBadge level={balance.priority} />
                ) : (
                  <Badge tone="success">100% Coberto</Badge>
                ),
            },
          ]}
        />
      </div>

      {/* Estoque por Abrigo */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="border-b border-slate-100 pb-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Estoque distribuído por abrigo
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Alocação física dos recursos nos pontos de atendimento da rede.
          </p>
        </div>

        <div className="mt-4 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {stockByShelter.map(({ shelter, lines }) => (
            <article
              key={shelter.id}
              className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-2xs transition hover:bg-white hover:border-emerald-300"
            >
              <header className="mb-2.5 flex items-baseline justify-between gap-2 border-b border-slate-200/50 pb-2">
                <Link
                  href={`/abrigos/${shelter.id}`}
                  className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                >
                  {shelter.name}
                </Link>
                <span className="rounded bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 border border-slate-200/60">
                  {lines.length} itens
                </span>
              </header>

              {lines.length === 0 ? (
                <p className="py-2 text-xs text-slate-400">Sem estoque registrado.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {lines.map(({ row, resource }) => (
                    <li key={row.id} className="flex justify-between gap-2 text-slate-700">
                      <span className="truncate font-medium">{resource?.name}</span>
                      <span className="shrink-0 font-mono font-bold text-slate-900">
                        {formatNumber(row.quantity)} {resource?.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>

      {session.canWrite ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Cadastrar novo recurso" />
            <CardBody>
              <ResourceForm />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Ajustar estoque de abrigo"
              description="Define a quantidade exata de um recurso em um abrigo específico (balanço físico)."
            />
            <CardBody>
              <StockForm shelters={shelters} resources={resources} />
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
