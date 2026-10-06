import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Building, CheckCircle2, House, Users } from 'lucide-react'

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

  const totalCap = Number(snapshot.counters.total_capacity) || 1
  const totalOcc = Number(snapshot.counters.total_occupancy) || 0
  const globalPct = Math.min(100, Math.round((totalOcc / totalCap) * 100))

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Rede de Abrigos"
        description="Gestão de capacidade, infraestrutura e taxa de ocupação em tempo real. As vagas livres são sempre derivadas de capacidade e ocupação pelo motor de regras."
      />

      {/* 4 StatCards em Glassmorphism com Destaque Verde Esmeralda */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Abrigos cadastrados" value={shelters.length} />
        <StatCard label="Capacidade total" value={Number(snapshot.counters.total_capacity)} />
        <StatCard label="Pessoas acolhidas" value={Number(snapshot.counters.total_occupancy)} />
        <StatCard
          label="Vagas disponíveis"
          value={Number(snapshot.counters.available_vacancies)}
          tone="success"
          hint={`Ocupação global em ${formatPercent(snapshot.indicators.shelterOccupancyRate)}`}
        />
      </div>

      {/* Régua de Ocupação da Rede */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm anime-card anime-entry">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-emerald-600 anime-icon-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Taxa de Ocupação Geral da Rede de Acolhimento
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-700">
            {formatNumber(totalOcc)} acolhidos de {formatNumber(totalCap)} vagas totais ({globalPct}%)
          </span>
        </div>
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-700 anime-progress-bar ${
              globalPct >= 90 ? 'bg-red-500' : globalPct >= 75 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${globalPct}%` }}
          />
        </div>
      </div>

      {/* Tabela de Abrigos */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm anime-card anime-entry">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {shelters.length} abrigo(s) cadastrado(s)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Ordenados pela taxa de ocupação relativa (do mais ocupado ao mais livre).
            </p>
          </div>
          <span className="font-mono text-xs text-emerald-800 font-semibold">
            {formatNumber(snapshot.counters.available_vacancies)} vagas disponíveis no total
          </span>
        </div>

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
                  <Link
                    href={`/abrigos/${shelter.id}`}
                    className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                  >
                    {shelter.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">
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
                <div className="min-w-36">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{formatNumber(shelter.current_occupancy)} / {formatNumber(shelter.capacity)}</span>
                    <span className="font-bold text-slate-900">{formatPercent(occupancyPercentage(shelter))}</span>
                  </div>
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
              header: 'Vagas Livres',
              align: 'right',
              render: (shelter) => (
                <span className="font-mono font-bold text-emerald-800">
                  {formatNumber(vacancies(shelter))}
                </span>
              ),
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
                    <span className="text-xs text-slate-400">Sem itens registrados</span>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Situação',
              align: 'center',
              render: (shelter) => <ShelterStatusBadge status={shelter.status} />,
            },
            {
              key: 'action',
              header: 'Ação',
              align: 'right',
              render: (shelter) => (
                <Link
                  href={`/abrigos/${shelter.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/80 transition hover:bg-emerald-100"
                >
                  <span>Detalhes</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ),
            },
          ]}
        />
      </div>

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
    </div>
  )
}
