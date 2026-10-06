/**
 * CAMADA UNICA DE ESCRITA
 *
 * Server Actions (formularios) e Route Handlers (API) chamam as mesmas funcoes
 * daqui - a regra de negocio nao fica duplicada. Em caso de problema, lancam
 * DataError com mensagem pronta para o usuario e status HTTP adequado.
 */

import { createClient } from '@/lib/supabase/server'
import { recommendShelters, type ShelterRecommendation } from '@/lib/recommendations/shelter'
import type {
  MovementPayload,
  OccurrencePayload,
  ShelterPayload,
} from '@/lib/validation/schemas'
import type { OccurrenceStatus, ShelterRow } from '@/types/domain'
import type { z } from 'zod'

import { DataError, SHELTER_COLUMNS, mapShelter } from './query'
import { replaceRecommendations } from './occurrences'
import type { resourceSchema, stockSchema } from '@/lib/validation/schemas'

type ResourcePayload = z.output<typeof resourceSchema>
type StockPayload = z.output<typeof stockSchema>

// -----------------------------------------------------------------------------
// Ocorrencias
// -----------------------------------------------------------------------------
export interface CreatedOccurrence {
  id: string
  affected_people: number
  recommendations: ShelterRecommendation[]
}

/**
 * Registra a ocorrencia, o detalhamento de pessoas afetadas e ja grava a
 * recomendacao de abrigos - a cadeia completa de decisao em uma chamada.
 */
export async function createOccurrenceRecord(
  payload: OccurrencePayload,
  userId: string,
): Promise<CreatedOccurrence> {
  const supabase = await createClient()
  const { affected, ...occurrence } = payload

  const breakdown = affected ?? {
    adults: 0,
    children: 0,
    elderly: 0,
    people_with_disabilities: 0,
  }
  const breakdownTotal =
    breakdown.adults + breakdown.children + breakdown.elderly + breakdown.people_with_disabilities

  // O detalhamento por faixa manda; sem detalhamento, usa o total informado.
  const affectedPeople = breakdownTotal > 0 ? breakdownTotal : occurrence.affected_people

  const { data: created, error } = await supabase
    .from('ocorrencias')
    .insert({ ...occurrence, affected_people: affectedPeople, created_by: userId })
    .select('id')
    .single()

  if (error || !created) {
    console.error('[abrigolog] falha ao registrar ocorrencia:', error?.message)
    throw new DataError('Não foi possível registrar a ocorrência. Tente novamente.', {
      status: 400,
      cause: error,
    })
  }

  if (breakdownTotal > 0) {
    const { error: affectedError } = await supabase
      .from('pessoas_afetadas')
      .insert({ occurrence_id: created.id, ...breakdown })

    if (affectedError) {
      // Compensa o insert anterior: nao deixa ocorrencia pela metade.
      console.error('[abrigolog] falha ao gravar pessoas afetadas:', affectedError.message)
      await supabase.from('ocorrencias').delete().eq('id', created.id)
      throw new DataError('Não foi possível registrar as pessoas afetadas. Tente novamente.', {
        status: 400,
        cause: affectedError,
      })
    }
  }

  let recommendations: ShelterRecommendation[] = []
  try {
    recommendations = await computeAndSaveRecommendations(created.id, {
      latitude: occurrence.latitude,
      longitude: occurrence.longitude,
      affected_people: affectedPeople,
    })
  } catch (recommendationError) {
    // A ocorrencia esta registrada; a recomendacao pode ser recalculada na tela.
    console.error('[abrigolog] falha ao gerar recomendacoes:', recommendationError)
  }

  return { id: created.id, affected_people: affectedPeople, recommendations }
}

export async function updateOccurrenceRecord(
  id: string,
  patch: Partial<OccurrencePayload>,
): Promise<void> {
  const supabase = await createClient()
  const { affected, ...fields } = patch

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase.from('ocorrencias').update(fields).eq('id', id)
    if (error) {
      console.error('[abrigolog] falha ao atualizar ocorrencia:', error.message)
      throw new DataError('Não foi possível atualizar a ocorrência.', { status: 400, cause: error })
    }
  }

  if (affected) {
    const { error } = await supabase
      .from('pessoas_afetadas')
      .upsert({ occurrence_id: id, ...affected }, { onConflict: 'occurrence_id' })
    if (error) {
      console.error('[abrigolog] falha ao atualizar pessoas afetadas:', error.message)
      throw new DataError('Não foi possível atualizar as pessoas afetadas.', {
        status: 400,
        cause: error,
      })
    }
  }
}

export async function updateOccurrenceStatusRecord(
  id: string,
  status: OccurrenceStatus,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('ocorrencias').update({ status }).eq('id', id)

  if (error) {
    console.error('[abrigolog] falha ao atualizar status:', error.message)
    throw new DataError('Não foi possível atualizar o status da ocorrência.', {
      status: 400,
      cause: error,
    })
  }
}

export async function deleteOccurrenceRecord(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('ocorrencias').delete().eq('id', id)

  if (error) {
    console.error('[abrigolog] falha ao excluir ocorrencia:', error.message)
    throw new DataError('Não foi possível excluir a ocorrência.', { status: 400, cause: error })
  }
}

/** Recalcula e persiste as recomendacoes de abrigo de uma ocorrencia. */
export async function computeAndSaveRecommendations(
  occurrenceId: string,
  occurrence?: { latitude: number | null; longitude: number | null; affected_people: number },
): Promise<ShelterRecommendation[]> {
  const supabase = await createClient()

  let target = occurrence
  if (!target) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('latitude, longitude, affected_people')
      .eq('id', occurrenceId)
      .maybeSingle()

    if (error || !data) {
      throw new DataError('Ocorrência não encontrada.', { status: 404, cause: error })
    }
    target = {
      latitude: data.latitude === null ? null : Number(data.latitude),
      longitude: data.longitude === null ? null : Number(data.longitude),
      affected_people: Number(data.affected_people),
    }
  }

  const sheltersResult = await supabase.from('abrigos').select(SHELTER_COLUMNS)
  if (sheltersResult.error || !sheltersResult.data) {
    throw new DataError('Não foi possível carregar os abrigos.', {
      status: 500,
      cause: sheltersResult.error,
    })
  }

  const recommendations = recommendShelters(target, sheltersResult.data.map(mapShelter))
  await replaceRecommendations(occurrenceId, recommendations)
  return recommendations
}

// -----------------------------------------------------------------------------
// Abrigos
// -----------------------------------------------------------------------------
export async function createShelterRecord(payload: ShelterPayload): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('abrigos').insert(payload).select('id').single()

  if (error || !data) {
    console.error('[abrigolog] falha ao cadastrar abrigo:', error?.message)
    throw new DataError('Não foi possível cadastrar o abrigo. Tente novamente.', {
      status: 400,
      cause: error,
    })
  }

  return data.id
}

export async function updateShelterRecord(
  id: string,
  patch: Partial<ShelterRow>,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('abrigos').update(patch).eq('id', id)

  if (error) {
    const occupancyViolation = error.message.includes('abrigos_occupancy_within_capacity')
    console.error('[abrigolog] falha ao atualizar abrigo:', error.message)
    throw new DataError(
      occupancyViolation
        ? 'A ocupação atual não pode ser maior que a capacidade.'
        : 'Não foi possível atualizar o abrigo.',
      { status: 400, cause: error },
    )
  }
}

// -----------------------------------------------------------------------------
// Recursos e estoque
// -----------------------------------------------------------------------------
export async function createResourceRecord(payload: ResourcePayload): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('recursos').insert(payload).select('id').single()

  if (error || !data) {
    const duplicated = (error?.message ?? '').toLowerCase().includes('duplicate')
    console.error('[abrigolog] falha ao cadastrar recurso:', error?.message)
    throw new DataError(
      duplicated
        ? 'Já existe um recurso com esse nome.'
        : 'Não foi possível cadastrar o recurso. Tente novamente.',
      { status: duplicated ? 409 : 400, cause: error },
    )
  }

  return data.id
}

export async function setStockRecord(payload: StockPayload): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('estoque')
    .upsert(
      { ...payload, updated_at: new Date().toISOString() },
      { onConflict: 'shelter_id,resource_id' },
    )

  if (error) {
    console.error('[abrigolog] falha ao ajustar estoque:', error.message)
    throw new DataError('Não foi possível ajustar o estoque.', { status: 400, cause: error })
  }
}

// -----------------------------------------------------------------------------
// Movimentacoes
// -----------------------------------------------------------------------------

/** Traduz os erros levantados por registrar_movimentacao(). */
function translateMovementError(message: string): { message: string; status: number } {
  const normalized = message.toLowerCase()

  if (normalized.includes('estoque insuficiente')) {
    const match = message.match(/disponivel\s+(\d+),\s*solicitado\s+(\d+)/i)
    return {
      message: match
        ? `Estoque insuficiente no abrigo de origem: disponível ${match[1]}, solicitado ${match[2]}.`
        : 'Estoque insuficiente no abrigo de origem.',
      status: 409,
    }
  }
  if (normalized.includes('nao possui registro de estoque')) {
    return { message: 'O abrigo de origem não possui estoque desse recurso.', status: 409 }
  }
  if (normalized.includes('sem permissao') || normalized.includes('permission')) {
    return { message: 'Perfil sem permissão para registrar movimentações.', status: 403 }
  }
  if (normalized.includes('maior que zero')) {
    return { message: 'A quantidade deve ser maior que zero.', status: 400 }
  }
  if (normalized.includes('transferencia exige')) {
    return { message: 'Transferência exige abrigos de origem e destino diferentes.', status: 400 }
  }
  return {
    message: 'Não foi possível registrar a movimentação. Verifique os dados e tente novamente.',
    status: 400,
  }
}

/**
 * Registra a movimentacao chamando a funcao transacional do PostgreSQL:
 * historico + estoque sao atualizados juntos, sem permitir saldo negativo.
 */
export async function registerMovementRecord(payload: MovementPayload): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('registrar_movimentacao', {
    p_resource_id: payload.resource_id,
    p_movement_type: payload.movement_type,
    p_quantity: payload.quantity,
    p_origin_shelter_id: payload.origin_shelter_id,
    p_destination_shelter_id: payload.destination_shelter_id,
    p_reason: payload.reason,
  })

  if (error || !data) {
    console.error('[abrigolog] falha ao registrar movimentacao:', error?.message)
    const translated = translateMovementError(error?.message ?? '')
    throw new DataError(translated.message, { status: translated.status, cause: error })
  }

  return data
}
