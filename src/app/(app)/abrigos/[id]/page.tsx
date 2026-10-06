import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getShelterDetail } from '@/lib/data/shelters'
import { requireSession } from '@/lib/auth/session'
import { formatDateTime, formatNumber, formatPercent } from '@/lib/utils/format'
import { movementTypeLabel } from '@/lib/utils/labels'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  OccurrenceStatusBadge,
  PageHeader,
  ProgressBar,
  ShelterStatusBadge,
  StatCard,
} from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'
import { OccupancyForm, ShelterForm } from '@/components/shelters/shelter-forms'

export const metadata: Metadata = { title: 'Abrigo · AbrigoLog' }

export default async function ShelterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, detail] = await Promise.all([requireSession(), getShelterDetail(id)])

  if (!detail) notFound()

  const { shelter, stock, movements, linkedOccurrences } = detail
  const readOnly = !session.canWrite

  return (
    <>
      <PageHeader
        title={shelter.name}
        description={shelter.description ?? undefined}
        action={
          <Link href="/abrigos" className="text-sm text-brand underline">
            Voltar para a lista
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <ShelterStatusBadge status={shelter.status} />
        {shelter.has_water ? <Badge tone="brand">Água potável</Badge> : null}
        {shelter.has_food ? <Badge tone="brand">Alimentação</Badge> : null}
        {shelter.has_medical_support ? <Badge tone="brand">Apoio médico</Badge> : null}
        {shelter.has_accessibility ? <Badge tone="brand">Acessibilidade</Badge> : null}
        <span className="text-xs text-muted">
          {shelter.address ? `${shelter.address} · ` : ''}
          {shelter.city}/{shelter.state}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Capacidade" value={shelter.capacity} />
        <StatCard label="Pessoas acolhidas" value={shelter.current_occupancy} />
        <StatCard
          label="Vagas livres"
          value={detail.vacancies}
          tone={detail.vacancies === 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Taxa de ocupação"
          value={formatPercent(detail.occupancyPercentage)}
          tone={
            detail.occupancyPercentage >= 95
              ? 'danger'
              : detail.occupancyPercentage >= 75
                ? 'warning'
                : 'success'
          }
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ocupação" description="Atualize conforme a entrada e saída de pessoas." />
          <CardBody className="space-y-4">
            <ProgressBar
              percentage={detail.occupancyPercentage}
              label="Ocupação atual"
              tone={
                detail.occupancyPercentage >= 95
                  ? 'danger'
                  : detail.occupancyPercentage >= 75
                    ? 'warning'
                    : 'success'
              }
            />
            {readOnly ? (
              <p className="text-sm text-muted">Perfil somente leitura.</p>
            ) : (
              <OccupancyForm shelter={shelter} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Estoque no abrigo"
            description="Itens abaixo do estoque mínimo aparecem destacados."
          />
          <CardBody className="px-0 py-0">
            <DataTable
              rows={stock}
              rowKey={(line) => line.resource.id}
              empty={{
                title: 'Sem estoque registrado',
                description: 'Registre uma entrada na Central Logística para abastecer este abrigo.',
                action: (
                  <Link href="/logistica" className="text-sm text-brand underline">
                    Ir para a Central Logística
                  </Link>
                ),
              }}
              columns={[
                { key: 'resource', header: 'Recurso', render: (line) => line.resource.name },
                {
                  key: 'quantity',
                  header: 'Quantidade',
                  align: 'right',
                  render: (line) => (
                    <span className={line.belowMinimum ? 'font-semibold text-warning' : ''}>
                      {formatNumber(line.quantity)} {line.resource.unit}
                    </span>
                  ),
                },
                {
                  key: 'minimum',
                  header: 'Mínimo',
                  align: 'right',
                  hideOnMobile: true,
                  render: (line) => formatNumber(line.resource.minimum_stock),
                },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Movimentações recentes"
          description="Entradas, saídas e transferências que envolvem este abrigo."
          action={
            <Link href="/logistica" className="text-sm text-brand underline">
              Registrar movimentação
            </Link>
          }
        />
        <CardBody className="px-0 py-0">
          <DataTable
            rows={movements}
            rowKey={(movement) => movement.id}
            empty={{ title: 'Nenhuma movimentação registrada para este abrigo' }}
            columns={[
              {
                key: 'date',
                header: 'Data',
                render: (movement) => formatDateTime(movement.created_at),
              },
              {
                key: 'type',
                header: 'Tipo',
                render: (movement) => (
                  <Badge
                    tone={
                      movement.movement_type === 'entrada'
                        ? 'success'
                        : movement.movement_type === 'saida'
                          ? 'warning'
                          : 'brand'
                    }
                  >
                    {movementTypeLabel(movement.movement_type)}
                  </Badge>
                ),
              },
              { key: 'resource', header: 'Recurso', render: (movement) => movement.resource_name },
              {
                key: 'quantity',
                header: 'Quantidade',
                align: 'right',
                render: (movement) =>
                  `${formatNumber(movement.quantity)} ${movement.resource_unit}`,
              },
              {
                key: 'route',
                header: 'Origem → Destino',
                hideOnMobile: true,
                render: (movement) =>
                  `${movement.origin_name ?? 'Externo'} → ${movement.destination_name ?? 'Consumo'}`,
              },
              {
                key: 'reason',
                header: 'Motivo',
                hideOnMobile: true,
                render: (movement) => movement.reason ?? '-',
              },
            ]}
          />
        </CardBody>
      </Card>

      {linkedOccurrences.length > 0 ? (
        <Card className="mt-6">
          <CardHeader
            title="Ocorrências que recomendaram este abrigo"
            description="Registros gravados pelo motor de recomendação."
          />
          <CardBody className="px-0 py-0">
            <DataTable
              rows={linkedOccurrences}
              rowKey={(item) => item.occurrence.id}
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
                  key: 'status',
                  header: 'Status',
                  render: (item) => <OccurrenceStatusBadge status={item.occurrence.status} />,
                },
                {
                  key: 'score',
                  header: 'Score do abrigo',
                  align: 'right',
                  render: (item) => formatNumber(item.score, 1),
                },
              ]}
            />
          </CardBody>
        </Card>
      ) : null}

      {readOnly ? null : (
        <Card className="mt-6">
          <CardHeader title="Editar abrigo" />
          <CardBody>
            <ShelterForm shelter={shelter} />
          </CardBody>
        </Card>
      )}
    </>
  )
}
