'use client'

/**
 * Registro de movimentacao de recursos.
 *
 * Os campos de origem/destino aparecem conforme o tipo escolhido, espelhando a
 * mesma regra validada no zod e na constraint do banco.
 */

import { useActionState, useState } from 'react'

import { registerMovement } from '@/lib/actions/movements'
import { IDLE_STATE } from '@/lib/actions/state'
import { SubmitButton } from '@/components/ui/buttons'
import { Field, FormFeedback, inputClass } from '@/components/ui/primitives'
import { MOVEMENT_TYPE_LABELS } from '@/lib/utils/labels'
import { MOVEMENT_TYPES, type MovementType, type ResourceRow, type ShelterRow } from '@/types/domain'

export interface MovementDefaults {
  resource_id?: string
  movement_type?: MovementType
  quantity?: number
  origin_shelter_id?: string | null
  destination_shelter_id?: string | null
  reason?: string | null
}

export function MovementForm({
  shelters,
  resources,
  defaults,
  compact = false,
}: {
  shelters: ShelterRow[]
  resources: ResourceRow[]
  defaults?: MovementDefaults
  compact?: boolean
}) {
  const [state, formAction] = useActionState(registerMovement, IDLE_STATE)
  const [movementType, setMovementType] = useState<MovementType>(
    defaults?.movement_type ?? 'entrada',
  )

  const needsOrigin = movementType === 'saida' || movementType === 'transferencia'
  const needsDestination = movementType === 'entrada' || movementType === 'transferencia'

  return (
    <form action={formAction} className={`grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
      <Field label="Tipo de movimentação" name="movement_type" errors={state.errors?.movement_type} required>
        <select
          id="movement_type"
          name="movement_type"
          required
          value={movementType}
          onChange={(event) => setMovementType(event.target.value as MovementType)}
          className={inputClass}
        >
          {MOVEMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {MOVEMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Recurso" name="resource_id" errors={state.errors?.resource_id} required>
        <select
          id="resource_id"
          name="resource_id"
          required
          defaultValue={defaults?.resource_id ?? ''}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione o recurso
          </option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name} ({resource.unit})
            </option>
          ))}
        </select>
      </Field>

      {needsOrigin ? (
        <Field
          label="Abrigo de origem"
          name="origin_shelter_id"
          errors={state.errors?.origin_shelter_id}
          required
        >
          <select
            id="origin_shelter_id"
            name="origin_shelter_id"
            required
            defaultValue={defaults?.origin_shelter_id ?? ''}
            className={inputClass}
          >
            <option value="" disabled>
              Selecione o abrigo de origem
            </option>
            {shelters.map((shelter) => (
              <option key={shelter.id} value={shelter.id}>
                {shelter.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {needsDestination ? (
        <Field
          label="Abrigo de destino"
          name="destination_shelter_id"
          errors={state.errors?.destination_shelter_id}
          required
        >
          <select
            id="destination_shelter_id"
            name="destination_shelter_id"
            required
            defaultValue={defaults?.destination_shelter_id ?? ''}
            className={inputClass}
          >
            <option value="" disabled>
              Selecione o abrigo de destino
            </option>
            {shelters.map((shelter) => (
              <option key={shelter.id} value={shelter.id}>
                {shelter.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="Quantidade" name="quantity" errors={state.errors?.quantity} required>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          step={1}
          required
          defaultValue={defaults?.quantity ?? ''}
          className={inputClass}
        />
      </Field>

      <Field label="Motivo" name="reason" errors={state.errors?.reason}>
        <input
          id="reason"
          name="reason"
          defaultValue={defaults?.reason ?? ''}
          placeholder="Ex.: déficit crítico de água no abrigo prioritário"
          className={inputClass}
        />
      </Field>

      <div className={`space-y-3 ${compact ? '' : 'md:col-span-2'}`}>
        <FormFeedback state={state} />
        <SubmitButton pendingLabel="Registrando movimentação...">
          Registrar movimentação
        </SubmitButton>
        <p className="text-xs text-muted">
          A gravação é transacional: histórico e estoque são atualizados juntos e o saldo nunca fica
          negativo.
        </p>
      </div>
    </form>
  )
}

/** Acao direta a partir de uma recomendacao logistica. */
export function SuggestionActionForm({
  defaults,
  label = 'Executar distribuição sugerida',
}: {
  defaults: MovementDefaults
  label?: string
}) {
  const [state, formAction] = useActionState(registerMovement, IDLE_STATE)

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="movement_type" value={defaults.movement_type ?? 'transferencia'} />
      <input type="hidden" name="resource_id" value={defaults.resource_id ?? ''} />
      <input type="hidden" name="quantity" value={defaults.quantity ?? 0} />
      {defaults.origin_shelter_id ? (
        <input type="hidden" name="origin_shelter_id" value={defaults.origin_shelter_id} />
      ) : null}
      {defaults.destination_shelter_id ? (
        <input type="hidden" name="destination_shelter_id" value={defaults.destination_shelter_id} />
      ) : null}
      <input type="hidden" name="reason" value={defaults.reason ?? 'Recomendação do motor logístico'} />

      <SubmitButton pendingLabel="Registrando...">{label}</SubmitButton>
      <FormFeedback state={state} />
    </form>
  )
}
