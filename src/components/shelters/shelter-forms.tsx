'use client'

/** Formularios de abrigo: cadastro/edicao completa e ajuste rapido de ocupacao. */

import { useActionState } from 'react'

import { createShelter, updateShelter, updateShelterOccupancy } from '@/lib/actions/shelters'
import { IDLE_STATE } from '@/lib/actions/state'
import { SubmitButton } from '@/components/ui/buttons'
import { Field, FormFeedback, inputClass } from '@/components/ui/primitives'
import { SHELTER_STATUS_LABELS } from '@/lib/utils/labels'
import type { ShelterRow } from '@/types/domain'

const INFRASTRUCTURE = [
  { name: 'has_water', label: 'Água potável' },
  { name: 'has_food', label: 'Alimentação' },
  { name: 'has_medical_support', label: 'Apoio médico' },
  { name: 'has_accessibility', label: 'Acessibilidade' },
] as const

export function ShelterForm({ shelter }: { shelter?: ShelterRow }) {
  const isEdit = Boolean(shelter)
  const [state, formAction] = useActionState(isEdit ? updateShelter : createShelter, IDLE_STATE)

  return (
    <form action={formAction} className="space-y-4">
      {shelter ? <input type="hidden" name="id" value={shelter.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Nome do abrigo" name="name" errors={state.errors?.name} required>
            <input
              id="name"
              name="name"
              required
              minLength={3}
              defaultValue={shelter?.name ?? ''}
              placeholder="Ex.: Escola Classe 15 de Ceilândia"
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Capacidade"
          name="capacity"
          errors={state.errors?.capacity}
          hint="Número máximo de pessoas acolhidas."
          required
        >
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={shelter?.capacity ?? ''}
            className={inputClass}
          />
        </Field>

        <Field
          label="Ocupação atual"
          name="current_occupancy"
          errors={state.errors?.current_occupancy}
          hint="Vagas e taxa de ocupação são calculadas automaticamente."
        >
          <input
            id="current_occupancy"
            name="current_occupancy"
            type="number"
            min={0}
            step={1}
            defaultValue={shelter?.current_occupancy ?? 0}
            className={inputClass}
          />
        </Field>

        <Field
          label="Situação"
          name="status"
          errors={state.errors?.status}
          hint="Disponível, parcialmente ocupado e lotado são derivados da ocupação. Indisponível é decisão do operador."
        >
          <select
            id="status"
            name="status"
            defaultValue={shelter?.status ?? 'disponivel'}
            className={inputClass}
          >
            {Object.entries(SHELTER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Endereço" name="address" errors={state.errors?.address}>
          <input
            id="address"
            name="address"
            defaultValue={shelter?.address ?? ''}
            placeholder="QNN 13, Ceilândia Norte"
            className={inputClass}
          />
        </Field>

        <Field label="Cidade" name="city" errors={state.errors?.city}>
          <input id="city" name="city" defaultValue={shelter?.city ?? 'Brasilia'} className={inputClass} />
        </Field>

        <Field label="UF" name="state" errors={state.errors?.state}>
          <input
            id="state"
            name="state"
            maxLength={2}
            defaultValue={shelter?.state ?? 'DF'}
            className={inputClass}
          />
        </Field>

        <Field label="Latitude" name="latitude" errors={state.errors?.latitude}>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="0.000001"
            min={-90}
            max={90}
            defaultValue={shelter?.latitude ?? -15.7939}
            className={inputClass}
          />
        </Field>

        <Field label="Longitude" name="longitude" errors={state.errors?.longitude}>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="0.000001"
            min={-180}
            max={180}
            defaultValue={shelter?.longitude ?? -47.8828}
            className={inputClass}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Observações" name="description" errors={state.errors?.description}>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={shelter?.description ?? ''}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          Infraestrutura disponível
          <span className="ml-1 font-normal text-muted">(peso de 20% no score de recomendação)</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {INFRASTRUCTURE.map((item) => (
            <label key={item.name} className="flex items-center gap-2 py-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                name={item.name}
                defaultChecked={shelter ? Boolean(shelter[item.name]) : false}
                className="h-5 w-5 rounded border-line"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <FormFeedback state={state} />

      <SubmitButton pendingLabel={isEdit ? 'Salvando...' : 'Cadastrando...'}>
        {isEdit ? 'Salvar alterações' : 'Cadastrar abrigo'}
      </SubmitButton>
    </form>
  )
}

export function OccupancyForm({ shelter }: { shelter: ShelterRow }) {
  const [state, formAction] = useActionState(updateShelterOccupancy, IDLE_STATE)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={shelter.id} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-32">
          <Field label="Ocupação" name="current_occupancy" errors={state.errors?.current_occupancy}>
            <input
              id="current_occupancy"
              name="current_occupancy"
              type="number"
              min={0}
              max={shelter.capacity}
              step={1}
              defaultValue={shelter.current_occupancy}
              className={inputClass}
            />
          </Field>
        </div>
        <span className="pb-2 text-sm text-muted">de {shelter.capacity} vagas</span>
        <SubmitButton variant="secondary" pendingLabel="Atualizando...">
          Atualizar ocupação
        </SubmitButton>
      </div>
      <FormFeedback state={state} />
    </form>
  )
}
