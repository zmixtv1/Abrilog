import type { Metadata } from 'next'

import { loadDashboard } from '@/lib/data/dashboard'
import { AdminHubHeader } from '@/components/dashboard/adminhub-header'
import { AdminHubStatCards } from '@/components/dashboard/adminhub-stat-cards'
import { AdminHubDataGrid } from '@/components/dashboard/adminhub-data-grid'
import { AdminHubShelterCard } from '@/components/dashboard/adminhub-shelter-card'
import { AdminHubLogisticsCard } from '@/components/dashboard/adminhub-logistics-card'
import { AdminHubDecisionChain } from '@/components/dashboard/adminhub-decision-chain'
import { AdminHubKpiCard } from '@/components/dashboard/adminhub-kpi-card'
import { AdminHubChartsPanel } from '@/components/dashboard/adminhub-charts-panel'

export const metadata: Metadata = {
  title: 'Dashboard Operacional · Centro de Comando · AbrigoLog',
}

export default async function DashboardPage() {
  const { cards, charts, indicators, criticals, snapshot } = await loadDashboard()

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Cabeçalho Oficial no Padrão AdminHub */}
      <AdminHubHeader
        generatedAt={snapshot.generatedAt}
        criticalCount={cards.criticalOccurrences}
        activeCount={cards.activeOccurrences}
      />

      {/* 2. Quatro Cartões de Métricas Principais (.box-info com Ícones em 64px) */}
      <AdminHubStatCards cards={cards} />

      {/* 3. Painel Central Primário (.table-data: Ocorrências Prioritárias + Ações Imediatas) */}
      <AdminHubDataGrid criticals={criticals} snapshot={snapshot} />

      {/* 4. Painel Operacional Secundário: Abrigos & Logística de Suprimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminHubShelterCard
          shelterOccupancy={charts.shelterOccupancy}
          counters={snapshot.counters}
        />
        <AdminHubLogisticsCard
          balances={snapshot.balances}
          indicators={indicators}
        />
      </div>

      {/* 5. Cadeia de Decisão PN-PDC 2025–2035 (Motor Determinístico) */}
      <AdminHubDecisionChain cards={cards} indicators={indicators} />

      {/* 6. Indicadores Oficiais de Eficácia (Metas PN-PDC) */}
      <AdminHubKpiCard indicators={indicators} />

      {/* 7. Gráficos Analíticos de Apoio (Tipologia e Severidades) */}
      <AdminHubChartsPanel
        occurrencesByType={charts.occurrencesByType}
        occurrencesBySeverity={charts.occurrencesBySeverity}
      />
    </div>
  )
}
