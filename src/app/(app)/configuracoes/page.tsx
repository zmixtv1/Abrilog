import type { Metadata } from 'next'
import { CheckCircle2, Cpu, Settings, Shield, Sliders } from 'lucide-react'

import { requireSession } from '@/lib/auth/session'
import {
  AFFECTED_PEOPLE_BANDS,
  DISTANCE_SCORE_CAP_KM,
  MAX_SHELTER_RECOMMENDATIONS,
  PRIORITY_THRESHOLDS,
  PRIORITY_WEIGHTS,
  SEVERITY_SCORE,
  SHELTER_WEIGHTS,
  URGENCY_SATURATION_HOURS,
} from '@/lib/calculations/parameters'
import { loadSnapshot } from '@/lib/data/snapshot'
import { formatNumber } from '@/lib/utils/format'
import { priorityLabel, roleLabel } from '@/lib/utils/labels'
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/primitives'
import { DataTable } from '@/components/ui/data-table'
import { ProfileForm } from '@/components/auth/forms'

export const metadata: Metadata = { title: 'Configurações · AbrigoLog' }

export default async function SettingsPage() {
  const [session, snapshot] = await Promise.all([requireSession(), loadSnapshot()])

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Configurações & Parâmetros do Sistema"
        description="Gestão do perfil do operador e transparência dos pesos determinísticos do motor de regras do PN-PDC."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meu Perfil */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm anime-card anime-entry">
          <div className="border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-700 text-white shadow-2xs">
                <Shield className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Meu perfil operacional</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Credenciais e nível de permissão no sistema.</p>
          </div>

          <div className="mt-4 space-y-4">
            <dl className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-2xs">
                <dt className="text-[11px] font-semibold uppercase text-slate-500">E-mail</dt>
                <dd className="mt-1 font-bold text-slate-900 truncate">{session.email ?? '-'}</dd>
              </div>
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3 shadow-2xs">
                <dt className="text-[11px] font-semibold uppercase text-emerald-800">Papel & Permissão</dt>
                <dd className="mt-1 font-bold text-emerald-950">
                  {roleLabel(session.role)} · {session.canWrite ? 'Escrita ativa' : 'Leitura'}
                </dd>
              </div>
            </dl>

            <div className="border-t border-slate-100 pt-4">
              <ProfileForm profile={session.profile} />
            </div>

            <p className="text-[11px] text-slate-500">
              O papel de acesso é configurado pelo administrador na tabela <code>profiles</code> do banco Supabase.
            </p>
          </div>
        </div>

        {/* Pesos do Motor de Priorizacao */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm anime-card anime-entry">
          <div className="border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                <Sliders className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Pesos do motor de priorização
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Score de 0 a 100. Soma ponderada dos 4 fatores.</p>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <ul className="space-y-2">
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Severidade (Cobrade 1 a 5)</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(PRIORITY_WEIGHTS.severity * 100)}%
                </strong>
              </li>
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Pessoas afetadas</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(PRIORITY_WEIGHTS.affectedPeople * 100)}%
                </strong>
              </li>
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Déficit de recursos</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(PRIORITY_WEIGHTS.resourceDeficit * 100)}%
                </strong>
              </li>
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Urgência temporal</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(PRIORITY_WEIGHTS.urgency * 100)}%
                </strong>
              </li>
            </ul>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Classificação por Faixas</p>
              <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[11px]">
                {[...PRIORITY_THRESHOLDS]
                  .reverse()
                  .map((band) => (
                    <span key={band.level} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 shadow-2xs">
                      {band.min}+ {priorityLabel(band.level)}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pesos da Recomendacao de Abrigo */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm anime-card anime-entry">
          <div className="border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                <Cpu className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Pesos da recomendação de abrigo
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Retorna os {MAX_SHELTER_RECOMMENDATIONS} melhores abrigos com vagas disponíveis.
            </p>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <ul className="space-y-2">
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Vagas (capacidade vs pessoas afetadas)</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(SHELTER_WEIGHTS.vacancies * 100)}%
                </strong>
              </li>
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Proximidade geográfica (Haversine)</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(SHELTER_WEIGHTS.distance * 100)}%
                </strong>
              </li>
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Infraestrutura básica</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(SHELTER_WEIGHTS.infrastructure * 100)}%
                </strong>
              </li>
              <li className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
                <span className="font-medium text-slate-700">Ocupação atual</span>
                <strong className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {formatNumber(SHELTER_WEIGHTS.occupancy * 100)}%
                </strong>
              </li>
            </ul>

            <p className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 leading-relaxed">
              Proximidade: 100 pontos no local exato, zero a partir de {DISTANCE_SCORE_CAP_KM} km. Abrigos lotados ou indisponíveis são descartados previamente.
            </p>
          </div>
        </div>

        {/* Tabela de Demanda por Pessoa */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm anime-card anime-entry">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Parâmetros de demanda por pessoa
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Valores demonstrativos de consumo emergencial por vítima.
            </p>
          </div>

          <DataTable
            rows={snapshot.resources}
            rowKey={(resource) => resource.id}
            empty={{ title: 'Nenhum recurso cadastrado' }}
            columns={[
              { key: 'name', header: 'Recurso', render: (resource) => <span className="font-bold text-slate-900">{resource.name}</span> },
              {
                key: 'demand',
                header: 'Demanda / Pessoa',
                align: 'right',
                render: (resource) => (
                  <span className="font-mono text-xs font-semibold text-slate-800">
                    {formatNumber(resource.demand_per_person, 3)} {resource.unit}
                  </span>
                ),
              },
              {
                key: 'minimum',
                header: 'Estoque Mínimo',
                align: 'right',
                hideOnMobile: true,
                render: (resource) => (
                  <span className="font-mono text-xs text-slate-600">
                    {formatNumber(resource.minimum_stock)} {resource.unit}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Sobre o Sistema */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Sobre a Plataforma AbrigoLog
        </h2>
        <div className="mt-3 space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong className="text-slate-900">AbrigoLog</strong> é um protótipo acadêmico de sistema
            de apoio à decisão operacional, desenvolvido no contexto do <strong>PN-PDC 2025–2035</strong>.
            Ele não substitui os procedimentos oficiais da Defesa Civil: o sistema apoia o operador humano, e a decisão
            final permanece integralmente com a equipe técnica responsável.
          </p>
          <p>
            O motor de decisão é determinístico e auditável: a mesma entrada produz rigorosamente a mesma saída,
            assegurando total transparência em situações de crise.
          </p>
        </div>
      </div>
    </div>
  )
}
