import type { Metadata } from 'next'

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
    <>
      <PageHeader
        title="Configurações"
        description="Perfil do operador e parâmetros do motor de priorização e recomendação."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Meu perfil" description={`Acesso: ${roleLabel(session.role)}`} />
          <CardBody className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted">E-mail</dt>
                <dd className="font-medium">{session.email ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Permissão</dt>
                <dd className="font-medium">
                  {session.canWrite ? 'Leitura e escrita' : 'Somente leitura'}
                </dd>
              </div>
            </dl>
            <div className="border-t border-line pt-4">
              <ProfileForm profile={session.profile} />
            </div>
            <p className="text-xs text-muted">
              O papel (admin, operador, visualizador) é alterado pelo administrador diretamente na
              tabela <code>profiles</code>, no painel do Supabase.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Pesos do motor de priorização"
            description="Score de 0 a 100. A soma dos pesos é 1."
          />
          <CardBody className="space-y-3 text-sm">
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>Severidade</span>
                <strong>{formatNumber(PRIORITY_WEIGHTS.severity * 100)}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Pessoas afetadas</span>
                <strong>{formatNumber(PRIORITY_WEIGHTS.affectedPeople * 100)}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Déficit de recursos</span>
                <strong>{formatNumber(PRIORITY_WEIGHTS.resourceDeficit * 100)}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Urgência (tempo em aberto)</span>
                <strong>{formatNumber(PRIORITY_WEIGHTS.urgency * 100)}%</strong>
              </li>
            </ul>

            <div className="border-t border-line pt-3">
              <p className="text-xs text-muted uppercase">Conversão de severidade</p>
              <p>
                {Object.entries(SEVERITY_SCORE)
                  .map(([level, score]) => `${level} → ${score}`)
                  .join(' · ')}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted uppercase">Faixas de pessoas afetadas</p>
              <p>
                {AFFECTED_PEOPLE_BANDS.map((band) =>
                  Number.isFinite(band.upTo) ? `até ${band.upTo} → ${band.score}` : `500+ → ${band.score}`,
                ).join(' · ')}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted uppercase">Urgência</p>
              <p>Atinge 100 pontos após {URGENCY_SATURATION_HOURS} horas em aberto.</p>
            </div>

            <div>
              <p className="text-xs text-muted uppercase">Classificação</p>
              <p>
                {[...PRIORITY_THRESHOLDS]
                  .reverse()
                  .map((band) => `${band.min}+ ${priorityLabel(band.level)}`)
                  .join(' · ')}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Pesos da recomendação de abrigo"
            description={`Retorna os ${MAX_SHELTER_RECOMMENDATIONS} melhores abrigos com vaga.`}
          />
          <CardBody className="space-y-3 text-sm">
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>Vagas (cobertura das pessoas afetadas)</span>
                <strong>{formatNumber(SHELTER_WEIGHTS.vacancies * 100)}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Proximidade geográfica</span>
                <strong>{formatNumber(SHELTER_WEIGHTS.distance * 100)}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Infraestrutura</span>
                <strong>{formatNumber(SHELTER_WEIGHTS.infrastructure * 100)}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Ocupação atual</span>
                <strong>{formatNumber(SHELTER_WEIGHTS.occupancy * 100)}%</strong>
              </li>
            </ul>
            <p className="border-t border-line pt-3 text-xs text-muted">
              Proximidade: 100 pontos no local da ocorrência, zero a partir de{' '}
              {DISTANCE_SCORE_CAP_KM} km (distância em linha reta, fórmula de Haversine). Abrigos
              indisponíveis ou lotados são eliminados antes da pontuação.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Parâmetros de demanda por pessoa"
            description="Valores demonstrativos do protótipo, editáveis no catálogo de recursos."
          />
          <CardBody className="px-0 py-0">
            <DataTable
              rows={snapshot.resources}
              rowKey={(resource) => resource.id}
              empty={{ title: 'Nenhum recurso cadastrado' }}
              columns={[
                { key: 'name', header: 'Recurso', render: (resource) => resource.name },
                {
                  key: 'demand',
                  header: 'Demanda por pessoa',
                  align: 'right',
                  render: (resource) =>
                    `${formatNumber(resource.demand_per_person, 3)} ${resource.unit}`,
                },
                {
                  key: 'minimum',
                  header: 'Estoque mínimo',
                  align: 'right',
                  hideOnMobile: true,
                  render: (resource) => formatNumber(resource.minimum_stock),
                },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Sobre o sistema" />
        <CardBody className="space-y-2 text-sm text-muted">
          <p>
            <strong className="text-foreground">AbrigoLog</strong> é um protótipo acadêmico de sistema
            de apoio à decisão, desenvolvido no contexto do PN-PDC 2025–2035. Não substitui os
            procedimentos oficiais da Defesa Civil: o sistema apoia o operador humano, e a decisão
            final permanece com a equipe responsável.
          </p>
          <p>
            A inteligência do sistema é um <strong className="text-foreground">motor de priorização
            e recomendação baseado em regras</strong> — processamento determinístico e auditável, sem
            Machine Learning.
          </p>
          <p>
            Os dados carregados são demonstrativos e representam a região de Brasília/DF. Os
            parâmetros de demanda por pessoa são valores de referência do protótipo, não normas
            oficiais.
          </p>
        </CardBody>
      </Card>
    </>
  )
}
