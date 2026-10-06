import type { Metadata } from 'next'
import Link from 'next/link'

import { loadDashboard } from '@/lib/data/dashboard'
import { formatDateTime, formatHours, formatNumber, formatPercent } from '@/lib/utils/format'
import { occurrenceTypeLabel } from '@/lib/utils/labels'
import {
  BarList,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  OccurrenceStatusBadge,
  PageHeader,
  PriorityBadge,
  ProgressBar,
  StatCard,
} from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'

export const metadata: Metadata = { title: 'Dashboard · AbrigoLog' }

export default async function DashboardPage() {
  const { cards, charts, indicators, criticals, snapshot } = await loadDashboard()

  return (
    <>
      <PageHeader
        title="Painel operacional"
        description="Situação consolidada das ocorrências, abrigos e recursos. Os números são recalculados a cada acesso pelo motor de regras."
        action={
          <span className="text-xs text-muted">
            Atualizado em {formatDateTime(snapshot.generatedAt)}
          </span>
        }
      />

      {/* Cartoes principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Ocorrências ativas"
          value={cards.activeOccurrences}
          hint="Não encerradas"
          href="/ocorrencias"
        />
        <StatCard
          label="Pessoas afetadas"
          value={cards.affectedPeople}
          hint="Em ocorrências ativas"
        />
        <StatCard label="Abrigos ativos" value={cards.activeShelters} href="/abrigos" />
        <StatCard
          label="Vagas disponíveis"
          value={cards.availableVacancies}
          tone="success"
          href="/abrigos"
        />
        <StatCard
          label="Recursos em déficit"
          value={cards.resourcesInDeficit}
          tone={cards.resourcesInDeficit > 0 ? 'warning' : 'success'}
          href="/logistica"
        />
        <StatCard
          label="Ocorrências críticas"
          value={cards.criticalOccurrences}
          tone={cards.criticalOccurrences > 0 ? 'danger' : 'success'}
          hint="Score ≥ 80"
          href="/ocorrencias"
        />
      </div>

      {/* Cadeia de decisao */}
      <Card className="mt-6">
        <CardHeader
          title="Cadeia de decisão do motor de regras"
          description="Processamento determinístico, sem Machine Learning: cada etapa alimenta a seguinte."
        />
        <CardBody>
          <ol className="grid gap-3 text-sm md:grid-cols-5">
            <li className="rounded-md border border-line bg-slate-50 p-3">
              <span className="block text-xs text-muted">1. Ocorrência</span>
              <strong>{formatNumber(cards.activeOccurrences)} ativas</strong>
              <span className="mt-1 block text-xs text-muted">
                {formatNumber(cards.affectedPeople)} pessoas afetadas
              </span>
            </li>
            <li className="rounded-md border border-line bg-slate-50 p-3">
              <span className="block text-xs text-muted">2. Priorização</span>
              <strong>{formatNumber(cards.criticalOccurrences)} críticas</strong>
              <span className="mt-1 block text-xs text-muted">
                severidade + pessoas + déficit + urgência
              </span>
            </li>
            <li className="rounded-md border border-line bg-slate-50 p-3">
              <span className="block text-xs text-muted">3. Abrigos</span>
              <strong>{formatNumber(cards.availableVacancies)} vagas</strong>
              <span className="mt-1 block text-xs text-muted">
                ocupação em {formatPercent(indicators.shelterOccupancyRate)}
              </span>
            </li>
            <li className="rounded-md border border-line bg-slate-50 p-3">
              <span className="block text-xs text-muted">4. Déficit</span>
              <strong>{formatNumber(cards.resourcesInDeficit)} recursos</strong>
              <span className="mt-1 block text-xs text-muted">
                cobertura logística {formatPercent(indicators.logisticsCoverageRate)}
              </span>
            </li>
            <li className="rounded-md border border-line bg-slate-50 p-3">
              <span className="block text-xs text-muted">5. Distribuição</span>
              <Link href="/logistica" className="font-semibold text-brand underline">
                Central Logística
              </Link>
              <span className="mt-1 block text-xs text-muted">ações sugeridas com justificativa</span>
            </li>
          </ol>
        </CardBody>
      </Card>

      {/* Graficos */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ocorrências por tipo" description="Somente ocorrências ativas." />
          <CardBody>
            <BarList items={charts.occurrencesByType} emptyMessage="Nenhuma ocorrência ativa." />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Ocorrências por severidade" description="1 = baixa · 5 = crítica." />
          <CardBody>
            <BarList
              items={charts.occurrencesBySeverity}
              emptyMessage="Nenhuma ocorrência ativa."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Ocupação dos abrigos"
            description="Vagas e percentual são sempre calculados a partir de capacidade e ocupação."
          />
          <CardBody>
            {charts.shelterOccupancy.length === 0 ? (
              <EmptyState
                title="Nenhum abrigo cadastrado"
                description="Cadastre abrigos para habilitar a recomendação."
              />
            ) : (
              <ul className="space-y-4">
                {charts.shelterOccupancy.map((shelter) => (
                  <li key={shelter.id}>
                    <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                      <Link href={`/abrigos/${shelter.id}`} className="font-medium hover:underline">
                        {shelter.name}
                      </Link>
                      <span className="text-muted">
                        {formatNumber(shelter.occupancy)}/{formatNumber(shelter.capacity)} ·{' '}
                        {formatNumber(shelter.vacancies)} vagas
                      </span>
                    </div>
                    <ProgressBar
                      percentage={shelter.percentage}
                      tone={
                        shelter.percentage >= 95
                          ? 'danger'
                          : shelter.percentage >= 75
                            ? 'warning'
                            : 'success'
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recursos em déficit"
            description="Demanda estimada acima do estoque disponível na rede."
          />
          <CardBody>
            <BarList
              items={charts.resourceDeficits}
              emptyMessage="Nenhum recurso em déficit: o estoque cobre a demanda estimada."
            />
          </CardBody>
        </Card>
      </div>

      {/* Indicadores */}
      <Card className="mt-6">
        <CardHeader
          title="Indicadores mensuráveis"
          description="Base para avaliar o ganho operacional do sistema."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted uppercase">1. Ocupação dos abrigos</p>
            <p className="text-2xl font-semibold">{formatPercent(indicators.shelterOccupancyRate)}</p>
            <p className="text-xs text-muted">ocupação total / capacidade total</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">2. Ocorrências atendidas</p>
            <p className="text-2xl font-semibold">
              {formatPercent(indicators.occurrencesHandledRate)}
            </p>
            <p className="text-xs text-muted">em atendimento, controladas ou encerradas</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">3. Cobertura logística</p>
            <p className="text-2xl font-semibold">
              {formatPercent(indicators.logisticsCoverageRate)}
            </p>
            <p className="text-xs text-muted">
              {formatNumber(indicators.totalDeficitUnits)} unidades em falta (soma bruta)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">4. Tempo médio de atendimento</p>
            <p className="text-2xl font-semibold">
              {indicators.averageResponseHours === null
                ? 'Indicador futuro'
                : formatHours(indicators.averageResponseHours)}
            </p>
            <p className="text-xs text-muted">
              {indicators.averageResponseHours === null
                ? 'sem ocorrências encerradas ainda'
                : 'abertura até encerramento'}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Criticas */}
      <Card className="mt-6">
        <CardHeader
          title="Ocorrências críticas"
          description="Prioridade calculada igual ou acima de 80 pontos."
          action={
            <Link href="/ocorrencias" className="text-sm text-brand underline">
              Ver todas
            </Link>
          }
        />
        <CardBody className="px-0 py-0">
          <DataTable
            rows={criticals}
            rowKey={(item) => item.occurrence.id}
            empty={{
              title: 'Nenhuma ocorrência crítica neste momento',
              description: 'As ocorrências ativas estão abaixo de 80 pontos de prioridade.',
            }}
            columns={[
              {
                key: 'title',
                header: 'Ocorrência',
                render: (item) => (
                  <Link
                    href={`/ocorrencias/${item.occurrence.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.occurrence.title}
                  </Link>
                ),
              },
              {
                key: 'type',
                header: 'Tipo',
                hideOnMobile: true,
                render: (item) => occurrenceTypeLabel(item.occurrence.type),
              },
              {
                key: 'people',
                header: 'Pessoas',
                align: 'right',
                render: (item) => formatNumber(item.occurrence.affected_people),
              },
              {
                key: 'status',
                header: 'Status',
                hideOnMobile: true,
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
