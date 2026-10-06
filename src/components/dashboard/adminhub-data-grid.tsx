import Link from 'next/link'
import {
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  MapPin,
  ExternalLink,
  Flame,
  House,
  Truck,
  Droplet,
  Package,
} from 'lucide-react'

import { formatNumber } from '@/lib/utils/format'
import { occurrenceTypeLabel, severityLabel } from '@/lib/utils/labels'
import type { PrioritizedOccurrence } from '@/lib/data/snapshot'
import type { OperationalSnapshot } from '@/lib/data/snapshot'

interface AdminHubDataGridProps {
  criticals: PrioritizedOccurrence[]
  snapshot: OperationalSnapshot
}

export function AdminHubDataGrid({ criticals, snapshot }: AdminHubDataGridProps) {
  // Ações operacionais derivadas do snapshot
  const actions = [
    {
      id: 'a1',
      title: 'Despacho Imediato de Suporte',
      desc:
        criticals.length > 0
          ? `${criticals[0].occurrence.title} (${criticals[0].occurrence.city} - ${criticals[0].occurrence.state}) requer resposta prioritária.`
          : 'Nenhuma ocorrência crítica pendente de despacho.',
      urgent: criticals.length > 0,
      borderStyle: criticals.length > 0 ? 'border-l-red-500' : 'border-l-emerald-500',
      badge: criticals.length > 0 ? 'Crítico (Score ≥ 80)' : 'Conforme',
      badgeColor: criticals.length > 0 ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50',
      href: criticals.length > 0 ? `/ocorrencias/${criticals[0].occurrence.id}` : '/ocorrencias',
    },
    {
      id: 'a2',
      title: 'Balanço Logístico de Suprimentos (72h)',
      desc:
        snapshot.deficits.length > 0
          ? `${snapshot.deficits.length} categoria(s) de insumos com déficit projetado na rede.`
          : 'Estoque da rede atende à demanda projetada para as próximas 72 horas.',
      urgent: snapshot.deficits.length > 0,
      borderStyle: snapshot.deficits.length > 0 ? 'border-l-amber-500' : 'border-l-emerald-500',
      badge: snapshot.deficits.length > 0 ? 'Atenção Logística' : 'Estoque 100%',
      badgeColor: snapshot.deficits.length > 0 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50',
      href: '/logistica',
    },
    {
      id: 'a3',
      title: 'Capacidade de Acolhimento em Abrigos',
      desc: `${snapshot.counters.available_vacancies} vagas disponíveis distribuídas em ${snapshot.counters.active_shelters} abrigos.`,
      urgent: false,
      borderStyle: 'border-l-emerald-500',
      badge: 'Rede Operacional',
      badgeColor: 'text-emerald-700 bg-emerald-50',
      href: '/abrigos',
    },
    {
      id: 'a4',
      title: 'Conformidade Técnica PN-PDC 2025–2035',
      desc: 'Priorização determinística auditável com pesos oficiais aplicados a cada registro.',
      urgent: false,
      borderStyle: 'border-l-teal-500',
      badge: 'Auditável',
      badgeColor: 'text-teal-700 bg-teal-50',
      href: '/dashboard',
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
      {/* ====================================================================
          LADO ESQUERDO: Tabela de Ocorrências Prioritárias (.order no AdminHub)
         ==================================================================== */}
      <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between anime-entry anime-delay-2 anime-card">
        <div>
          {/* Header do Card no Estilo AdminHub */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs text-xs">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Mesa de Ocorrências Prioritárias
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ordenação determinística segundo o algoritmo oficial PN-PDC (Score 0-100).
              </p>
            </div>

            <Link
              href="/ocorrencias"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition bg-emerald-50/80 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/60"
            >
              <span>Ver Todas</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Tabela de Ocorrências */}
          {criticals.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">
                Nenhuma ocorrência crítica no momento
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Todas as ocorrências ativas estão sob controle com prioridade calculada abaixo de 80 pontos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0 md:max-h-[60vh] md:overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="bg-white px-3 pb-3 shadow-[inset_0_-1px_0_#f1f5f9] md:sticky md:top-0 md:z-10 md:pt-2">Ocorrência & Local</th>
                    <th className="bg-white px-3 pb-3 shadow-[inset_0_-1px_0_#f1f5f9] md:sticky md:top-0 md:z-10 md:pt-2 hidden sm:table-cell">Tipo</th>
                    <th className="bg-white px-3 pb-3 text-center shadow-[inset_0_-1px_0_#f1f5f9] md:sticky md:top-0 md:z-10 md:pt-2">Afetados</th>
                    <th className="bg-white px-3 pb-3 text-right shadow-[inset_0_-1px_0_#f1f5f9] md:sticky md:top-0 md:z-10 md:pt-2">Score PN-PDC</th>
                    <th className="bg-white px-3 pb-3 text-center shadow-[inset_0_-1px_0_#f1f5f9] md:sticky md:top-0 md:z-10 md:pt-2">Status</th>
                    <th className="bg-white px-3 pb-3 text-right shadow-[inset_0_-1px_0_#f1f5f9] md:sticky md:top-0 md:z-10 md:pt-2">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {criticals.slice(0, 5).map((item) => {
                    const occ = item.occurrence
                    const score = Math.round(item.priority.score)
                    const isUrgent = occ.status === 'aberta'

                    return (
                      <tr
                        key={occ.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Título & Local */}
                        <td className="py-3 px-3 align-middle">
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                isUrgent ? 'bg-red-600 animate-pulse' : 'bg-amber-500'
                              }`}
                            />
                            <div className="min-w-0">
                              <Link
                                href={`/ocorrencias/${occ.id}`}
                                className="py-1 font-bold text-slate-900 hover:text-emerald-700 transition line-clamp-1 text-xs"
                              >
                                {occ.title}
                              </Link>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                  {occ.neighborhood ? `${occ.neighborhood}, ${occ.city}` : `${occ.city} - ${occ.state}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="py-3 px-3 align-middle hidden sm:table-cell">
                          <span className="font-medium text-slate-600 text-xs">
                            {occurrenceTypeLabel(occ.type)}
                          </span>
                        </td>

                        {/* Afetados */}
                        <td className="py-3 px-3 align-middle text-center font-mono font-semibold text-slate-700">
                          {formatNumber(occ.affected_people)}
                        </td>

                        {/* Score PN-PDC */}
                        <td className="py-3 px-3 align-middle text-right">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-800 font-mono font-bold text-xs">
                            <Flame className="h-3 w-3 text-red-600" />
                            <span>{score}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 align-middle text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              occ.status === 'aberta'
                                ? 'bg-red-100 text-red-800'
                                : occ.status === 'em_atendimento'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {occ.status === 'aberta'
                              ? 'Aberta'
                              : occ.status === 'em_atendimento'
                              ? 'Atendimento'
                              : 'Controlada'}
                          </span>
                        </td>

                        {/* Ação */}
                        <td className="py-3 px-3 align-middle text-right">
                          <Link
                            href={`/ocorrencias/${occ.id}`}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            title="Ver detalhes da ocorrência"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé da tabela */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Total de {criticals.length} ocorrência(s) com prioridade máxima</span>
          <Link
            href="/ocorrencias"
            className="inline-block py-1 text-emerald-700 hover:underline font-semibold"
          >
            Abrir painel completo de incidentes ➔
          </Link>
        </div>
      </div>

      {/* ====================================================================
          LADO DIREITO: Ações Operacionais & Alertas PN-PDC (.todo no AdminHub)
         ==================================================================== */}
      <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between anime-entry anime-delay-3 anime-card">
        <div>
          {/* Header do Card .todo */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Ações Imediatas & Diretrizes
            </h2>
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              PN-PDC
            </span>
          </div>

          {/* Lista de Ações com Borda Esquerda Colorida Característica do CodePen */}
          <div className="space-y-3">
            {actions.map((act) => (
              <Link
                key={act.id}
                href={act.href}
                className={`block p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 transition border-l-4 ${act.borderStyle} border border-slate-200/60 shadow-2xs group anime-card`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <strong className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {act.title}
                  </strong>
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${act.badgeColor}`}
                  >
                    {act.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {act.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <p className="text-[10.5px] text-slate-400 text-center leading-normal">
            As ações recomendadas são atualizadas deterministicamente em tempo real.
          </p>
        </div>
      </div>
    </div>
  )
}
