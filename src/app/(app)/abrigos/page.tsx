import type { Metadata } from 'next'
import Link from 'next/link'

import { loadSnapshot } from '@/lib/data/snapshot'
import { requireSession } from '@/lib/auth/session'
import { occupancyPercentage, vacancies } from '@/lib/calculations/shelters'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  ProgressBar,
  ShelterStatusBadge,
  StatCard,
} from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'
import { ShelterForm } from '@/components/shelters/shelter-forms'

export const metadata: Metadata = { title: 'Abrigos · AbrigoLog' }

export default async function SheltersPage() {
  const [session, snapshot] = await Promise.all([requireSession(), loadSnapshot()])

  const shelters = [...snapshot.shelters].sort(
    (a, b) => occupancyPercentage(b) - occupancyPercentage(a),
  )

  return (
    <>
      <PageHeader
        title="Abrigos"
        description="Capacidade, ocupação e infraestrutura. Vagas e taxa de ocupação são sempre calculadas — nunca armazenadas."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Abrigos cadastrados" value={shelters.length} />
        <StatCard label="Capacidade total" value={Number(snapshot.counters.total_capacity)} />
        <StatCard label="Pessoas acolhidas" value={Number(snapshot.counters.total_occupancy)} />
        <StatCard
          label="Vagas disponíveis"
          value={Number(snapshot.counters.available_vacancies)}
          tone="success"
          hint={`Ocupação média ${formatPercent(snapshot.indicators.shelterOccupancyRate)}`}
        />
      </div>

      <Card className="mt-6">
        <CardHeader title={`${shelters.length} abrigo(s)`} />
        <CardBody className="px-0 py-0">
          <DataTable
            rows={shelters}
            rowKey={(shelter) => shelter.id}
            caption="Lista de abrigos"
            empty={{
              title: 'Nenhum abrigo cadastrado',
              description: 'Cadastre o primeiro abrigo para habilitar a recomendação automática.',
            }}
            columns={[
              {
                key: 'name',
                header: 'Abrigo',
                render: (shelter) => (
                  <div>
                    <Link href={`/abrigos/${shelter.id}`} className="font-medium hover:underline">
                      {shelter.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {shelter.address ? `${shelter.address} · ` : ''}
                      {shelter.city}/{shelter.state}
                    </p>
                  </div>
                ),
              },
              {
                key: 'occupancy',
                header: 'Ocupação',
                render: (shelter) => (
                  <div className="min-w-32">
                    <p className="text-xs text-muted">
                      {formatNumber(shelter.current_occupancy)}/{formatNumber(shelter.capacity)}
                    </p>
                    <ProgressBar
                      percentage={occupancyPercentage(shelter)}
                      tone={
                        occupancyPercentage(shelter) >= 95
                          ? 'danger'
                          : occupancyPercentage(shelter) >= 75
                            ? 'warning'
                            : 'success'
                      }
                    />
                  </div>
                ),
              },
              {
                key: 'vacancies',
                header: 'Vagas',
                align: 'right',
                render: (shelter) => formatNumber(vacancies(shelter)),
              },
              {
                key: 'infra',
                header: 'Infraestrutura',
                hideOnMobile: true,
                render: (shelter) => (
                  <div className="flex flex-wrap gap-1">
                    {shelter.has_water ? <Badge tone="brand">Água</Badge> : null}
                    {shelter.has_food ? <Badge tone="brand">Alimentação</Badge> : null}
                    {shelter.has_medical_support ? <Badge tone="brand">Saúde</Badge> : null}
                    {shelter.has_accessibility ? <Badge tone="brand">Acessível</Badge> : null}
                    {!shelter.has_water &&
                    !shelter.has_food &&
                    !shelter.has_medical_support &&
                    !shelter.has_accessibility ? (
                      <span className="text-xs text-muted">Sem itens registrados</span>
                    ) : null}
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Situação',
                align: 'right',
                render: (shelter) => <ShelterStatusBadge status={shelter.status} />,
              },
            ]}
          />
        </CardBody>
      </Card>

      {session.canWrite ? (
        <Card className="mt-6">
          <CardHeader
            title="Cadastrar novo abrigo"
            description="A situação (disponível, parcialmente ocupado, lotado) é derivada automaticamente da ocupação."
          />
          <CardBody>
            <ShelterForm />
          </CardBody>
        </Card>
      ) : null}
    </>
  )
}
