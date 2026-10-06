'use client'

/** Acoes da tela de detalhe: status, recalculo de recomendacao e exclusao. */

import { useActionState } from 'react'

import {
  deleteOccurrence,
  recalculateRecommendations,
  updateOccurrenceStatus,
} from '@/lib/actions/occurrences'
import { IDLE_STATE } from '@/lib/actions/state'
import { ConfirmSubmit, SubmitButton } from '@/components/ui/buttons'
import { FormFeedback, inputClass } from '@/components/ui/primitives'
import { OCCURRENCE_STATUS_LABELS } from '@/lib/utils/labels'
import { OCCURRENCE_STATUSES, type OccurrenceStatus } from '@/types/domain'

export function StatusForm({
  occurrenceId,
  status,
  disabled,
}: {
  occurrenceId: string
  status: OccurrenceStatus
  disabled?: boolean
}) {
  const [state, formAction] = useActionState(updateOccurrenceStatus, IDLE_STATE)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={occurrenceId} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-48 flex-1">
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-foreground">
            Situação operacional
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            disabled={disabled}
            className={inputClass}
          >
            {OCCURRENCE_STATUSES.map((option) => (
              <option key={option} value={option}>
                {OCCURRENCE_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton variant="secondary" pendingLabel="Atualizando..." disabled={disabled}>
          Atualizar status
        </SubmitButton>
      </div>
      <FormFeedback state={state} />
    </form>
  )
}

export function RecalculateRecommendationsForm({
  occurrenceId,
  disabled,
}: {
  occurrenceId: string
  disabled?: boolean
}) {
  const [state, formAction] = useActionState(recalculateRecommendations, IDLE_STATE)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={occurrenceId} />
      <SubmitButton variant="secondary" pendingLabel="Recalculando..." disabled={disabled}>
        Recalcular e salvar recomendação
      </SubmitButton>
      <FormFeedback state={state} />
    </form>
  )
}

export function DeleteOccurrenceForm({
  occurrenceId,
  disabled,
}: {
  occurrenceId: string
  disabled?: boolean
}) {
  const [state, formAction] = useActionState(deleteOccurrence, IDLE_STATE)

  if (disabled) return null

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={occurrenceId} />
      <ConfirmSubmit
        title="Excluir ocorrência?"
        description="A ocorrência, o detalhamento de pessoas afetadas e as recomendações vinculadas serão removidos. Esta ação não pode ser desfeita."
        confirmLabel="Excluir definitivamente"
        pendingLabel="Excluindo..."
      >
        Excluir ocorrência
      </ConfirmSubmit>
      <FormFeedback state={state} />
    </form>
  )
}
