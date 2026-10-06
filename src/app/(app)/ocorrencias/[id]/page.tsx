import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getOccurrenceDetail } from '@/lib/data/occurrences'
import { requireSession } from '@/lib/auth/session'
import { formatDateTime, formatDistance, formatHours, formatNumber, formatPercent } from '@/lib/utils/format'
import { occurrenceTypeLabel, severityLabel } from '@/lib/utils/labels'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  OccurrenceStatusBadge,
  PageHeader,
  PriorityBadge,
  ProgressBar,
  ShelterStatusBadge,
  StatCard,
} from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'
import {
  DeleteOccurrenceForm,
  RecalculateRecommendationsForm,
  StatusForm,
} from '@/components/occurrences/occurrence-actions'

export const metadata: Metadata = { title: 'Ocorrência · AbrigoLog' }

const COMPONENT_LABELS: Record<string, string> = {
  severity: 'Severidade',
  affectedPeople: 'Pessoas afetadas',
  resourceDeficit: 'Déficit de recursos',
  urgency: 'Urgência (tempo em aberto)',
}

export default async function OccurrenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, detail] = await Promise.all([requireSession(), getOccurrenceDetail(id)])

  if (!detail) notFound()

  const { occurrence, affected, priority, demand, balances, recommendations, savedRecommendations } =
    detail

  const readOnly = !session.canWrite
  const demandLines = demand.filter((line) => line.demand > 0)
  const balanceLines = balances.filter((line) => line.demand > 0)

  return (
    <>
      <PageHeader
        title={occurrence.title}
        description={occurrence.description ?? undefined}
        action={
          <Link href="/ocorrencias" className="text-sm text-brand underline">
            Voltar para a lista
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <PriorityBadge level={priority.level} score={priority.score} />
        <OccurrenceStatusBadge status={occurrence.status} />
        <Badge>{occurrenceTypeLabel(occurrence.type)}</Badge>
        <Badge tone={occurrence.severity >= 4 ? 'danger' : 'neutral'}>
          Severidade {occurrence.severity} · {severityLabel(occurrence.severity)}
        </Badge>
        <span className="text-xs text-muted">
          Aberta em {formatDateTime(occurrence.created_at)} · {formatHours(priority.hoursOpen)} em aberto
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pessoas afetadas" value={occurrence.affected_people} />
        <StatCard label="Famílias afetadas" value={occurrence.affected_families} />
        <StatCard
          label="Score de prioridade"
          value={formatNumber(priority.score, 1)}
          tone={priority.level === 'critica' ? 'danger' : priority.level === 'alta' ? 'warning' : 'brand'}
        />
        <StatCard
          label="Abrigos recomendados"
          value={recommendations.length}
          hint={recommendations.length === 0 ? 'Nenhum abrigo com vaga' : 'melhores opções agora'}
        />
      </div>

      {/* Explicabilidade do score */}
      <Card className="mt-6">
        <CardHeader
          title="Como o score foi calculado"
          description="Cada componente é normalizado de 0 a 100 e multiplicado pelo seu peso. Regra determinística: a mesma entrada produz sempre o mesmo resultado."
        />
        <CardBody className="space-y-4">
          {(Object.keys(priority.components) as Array<keyof typeof priority.components>).map((key) => {
            const value = priority.components[key]
            const weight = priority.weights[key]
            return (
              <div key={key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{COMPONENT_LABELS[key] ?? key}</span>
                  <span className="text-muted">
                    {formatNumber(value, 1)} × {formatNumber(weight * 100, 0)}% ={' '}
                    <strong className="text-foreground">{formatNumber(value * weight, 1)}</strong> pontos
                  </span>
                </div>
                <ProgressBar percentage={value} />
              </div>
            )
          })}

          <p className="border-t border-line pt-3 text-sm">
            Score final: <strong>{formatNumber(priority.score, 1)}</strong> de 100 ·{' '}
            Classificação: <strong>{priority.level}</strong>
            <span className="block text-xs text-muted">
              Faixas: 0–39 baixa · 40–59 moderada · 60–79 alta · 80–100 crítica
            </span>
          </p>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Abrigos recomendados */}
        <Card>
          <CardHeader
            title="Abrigos recomendados"
            description="vagas 35% · proximidade 30% · infraestrutura 20% · ocupação 15%"
          />
          <CardBody className="space-y-3">
            {recommendations.length === 0 ? (
              <EmptyState
                title="Nenhum abrigo disponível atende aos critérios"
                description="Todos os abrigos estão lotados ou indisponíveis. Cadastre um novo abrigo ou libere vagas."
                action={
                  <Link href="/abrigos" className="text-sm text-brand underline">
                    Ver abrigos
                  </Link>
                }
              />
            ) : (
              recommendations.map((item, index) => (
                <article key={item.shelter_id} className="rounded-md border border-line p-3">
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <Link href={`/abrigos/${item.shelter_id}`} className="font-medium hover:underline">
                        {item.shelter_name}
                      </Link>
                    </div>
                    <Badge tone={index === 0 ? 'success' : 'brand'}>
                      Score {formatNumber(item.score, 1)}
                    </Badge>
                  </header>

                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-4">
                    <div>
                      <dt>Distância</dt>
                      <dd className="font-medium text-foreground">{formatDistance(item.distance_km)}</dd>
                    </div>
                    <div>
                      <dt>Vagas</dt>
                      <dd className="font-medium text-foreground">{formatNumber(item.vacancies)}</dd>
                    </div>
                    <div>
                      <dt>Ocupação</dt>
                      <dd className="font-medium text-foreground">
                        {formatPercent(item.occupancy_percentage)}
                      </dd>
                    </div>
                    <div>
                      <dt>Infraestrutura</dt>
                      <dd className="font-medium text-foreground">{item.infrastructure_items}/4</dd>
                    </div>
                  </dl>

                  <p className="mt-2 text-xs text-muted">{item.reasons.join(' · ')}</p>
                </article>
              ))
            )}

            {savedRecommendations.length > 0 ? (
              <p className="text-xs text-muted">
                Última recomendação registrada em{' '}
                {formatDateTime(savedRecommendations[0].created_at)} ({savedRecommendations.length}{' '}
                abrigo(s) em <code>occurrence_shelters</code>).
              </p>
            ) : null}
          </CardBody>
        </Card>

        {/* Dados e acoes */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Situação e ações" />
            <CardBody className="space-y-4">
              <StatusForm occurrenceId={occurrence.id} status={occurrence.status} disabled={readOnly} />
              <div className="border-t border-line pt-4">
                <RecalculateRecommendationsForm occurrenceId={occurrence.id} disabled={readOnly} />
              </div>
              {readOnly ? null : (
                <div className="border-t border-line pt-4">
                  <DeleteOccurrenceForm occurrenceId={occurrence.id} />
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Pessoas afetadas"
              description="Dados agregados, sem informação pessoal identificável (LGPD)."
            />
            <CardBody>
              {affected ? (
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted">Adultos</dt>
                    <dd className="text-lg font-semibold">{formatNumber(affected.adults)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Crianças</dt>
                    <dd className="text-lg font-semibold">{formatNumber(affected.children)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Idosos</dt>
                    <dd className="text-lg font-semibold">{formatNumber(affected.elderly)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">PCD</dt>
                    <dd className="text-lg font-semibold">
                      {formatNumber(affected.people_with_disabilities)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted">
                  Sem detalhamento por faixa. Total informado:{' '}
                  {formatNumber(occurrence.affected_people)} pessoas.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Localização" />
            <CardBody className="space-y-1 text-sm">
              <p>
                {occurrence.neighborhood ? `${occurrence.neighborhood} · ` : ''}
                {occurrence.city}/{occurrence.state}
              </p>
              <p className="text-muted">
                {occurrence.latitude !== null && occurrence.longitude !== null
                  ? `${occurrence.latitude}, ${occurrence.longitude}`
                  : 'Coordenadas não informadas (distância não é calculada)'}
              </p>
              <Link href="/mapa" className="inline-block text-sm text-brand underline">
                Ver no mapa operacional
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Demanda e deficit da ocorrencia */}
      <Card className="mt-6">
        <CardHeader
          title="Recursos necessários e déficit"
          description="Demanda estimada para esta ocorrência comparada ao estoque disponível em toda a rede de abrigos."
          action={
            <Link href="/logistica" className="text-sm text-brand underline">
              Central Logística
            </Link>
          }
        />
        <CardBody className="px-0 py-0">
          <DataTable
            rows={balanceLines}
            rowKey={(line) => line.resource_id}
            empty={{
              title: 'Nenhuma demanda estimada',
              description:
                demandLines.length === 0
                  ? 'A ocorrência está encerrada ou não possui pessoas afetadas registradas.'
                  : 'Cadastre recursos com demanda por pessoa para habilitar a estimativa.',
            }}
            columns={[
              { key: 'resource', header: 'Recurso', render: (line) => line.resource_name },
              { key: 'unit', header: 'Unidade', hideOnMobile: true, render: (line) => line.unit },
              {
                key: 'demand',
                header: 'Demanda',
                align: 'right',
                render: (line) => formatNumber(line.demand),
              },
              {
                key: 'stock',
                header: 'Estoque na rede',
                align: 'right',
                render: (line) => formatNumber(line.stock),
              },
              {
                key: 'deficit',
                header: 'Déficit',
                align: 'right',
                render: (line) =>
                  line.deficit > 0 ? (
                    <strong className="text-danger">{formatNumber(line.deficit)}</strong>
                  ) : (
                    <span className="text-muted">0</span>
                  ),
              },
              {
                key: 'coverage',
                header: 'Cobertura',
                align: 'right',
                render: (line) => formatPercent(line.coverage),
              },
            ]}
          />
        </CardBody>
      </Card>

      {/* Abrigos vinculados */}
      {savedRecommendations.length > 0 ? (
        <Card className="mt-6">
          <CardHeader
            title="Recomendações registradas"
            description="Histórico gravado na tabela occurrence_shelters pelo motor de recomendação."
          />
          <CardBody className="px-0 py-0">
            <DataTable
              rows={savedRecommendations}
              rowKey={(row) => row.id}
              columns={[
                {
                  key: 'shelter',
                  header: 'Abrigo',
                  render: (row) => (
                    <Link href={`/abrigos/${row.shelter_id}`} className="hover:underline">
                      {row.shelter_name}
                    </Link>
                  ),
                },
                {
                  key: 'status',
                  header: 'Situação',
                  hideOnMobile: true,
                  render: (row) => <ShelterStatusBadge status={row.shelter_status} />,
                },
                {
                  key: 'distance',
                  header: 'Distância',
                  align: 'right',
                  render: (row) => formatDistance(row.distance_km),
                },
                {
                  key: 'score',
                  header: 'Score',
                  align: 'right',
                  render: (row) => formatNumber(row.score, 1),
                },
                {
                  key: 'created',
                  header: 'Calculado em',
                  align: 'right',
                  hideOnMobile: true,
                  render: (row) => formatDateTime(row.created_at),
                },
              ]}
            />
          </CardBody>
        </Card>
      ) : null}
    </>
  )
}
