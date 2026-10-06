/**
 * Tipos do banco para o SDK do Supabase.
 *
 * Escrito a mao a partir de supabase/migrations/0001_schema.sql, de forma que
 * `supabase.from('ocorrencias').select(...)` fique tipado em todo o projeto.
 * Ao alterar o schema SQL, atualizar este arquivo (ou gerar com
 * `supabase gen types typescript`).
 */

import type {
  AffectedPeopleRow,
  AuditLogRow,
  DashboardCountersRow,
  MovementRow,
  OccurrenceRow,
  OccurrenceShelterRow,
  ProfileRow,
  ResourceRow,
  ShelterRow,
  StockRow,
  StockTotalRow,
} from './domain'

/** Campos obrigatorios no insert; o resto tem default no banco. */
type Insertable<Row, Required extends keyof Row> = Pick<Row, Required> &
  Partial<Omit<Row, Required>>

type Table<Row, Required extends keyof Row> = {
  Row: Row
  Insert: Insertable<Row, Required>
  Update: Partial<Row>
  Relationships: []
}

type ReadOnlyView<Row> = {
  Row: Row
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, 'id'>
      ocorrencias: Table<OccurrenceRow, 'title' | 'type' | 'severity'>
      abrigos: Table<ShelterRow, 'name' | 'capacity'>
      pessoas_afetadas: Table<AffectedPeopleRow, 'occurrence_id'>
      recursos: Table<ResourceRow, 'name' | 'category' | 'unit'>
      estoque: Table<StockRow, 'shelter_id' | 'resource_id'>
      movimentacoes: Table<MovementRow, 'resource_id' | 'quantity' | 'movement_type'>
      occurrence_shelters: Table<OccurrenceShelterRow, 'occurrence_id' | 'shelter_id'>
      audit_logs: Table<AuditLogRow, 'action' | 'entity'>
    }
    Views: {
      vw_dashboard_counters: ReadOnlyView<DashboardCountersRow>
      vw_estoque_total: ReadOnlyView<StockTotalRow>
    }
    Functions: {
      registrar_movimentacao: {
        Args: {
          p_resource_id: string
          p_movement_type: string
          p_quantity: number
          p_origin_shelter_id?: string | null
          p_destination_shelter_id?: string | null
          p_reason?: string | null
        }
        Returns: string
      }
      can_write: {
        Args: Record<string, never>
        Returns: boolean
      }
      user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
