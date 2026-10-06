'use client'

/** Formularios do catalogo de recursos e do ajuste de estoque por abrigo. */

import { useActionState } from 'react'

import { createResource, setStockQuantity } from '@/lib/actions/resources'
import { IDLE_STATE } from '@/lib/actions/state'
import { SubmitButton } from '@/components/ui/buttons'
import { Field, FormFeedback, inputClass } from '@/components/ui/primitives'
import type { ResourceRow, ShelterRow } from '@/types/domain'

export function ResourceForm() {
  const [state, formAction] = useActionState(createResource, IDLE_STATE)

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <Field label="Nome do recurso" name="name" errors={state.errors?.name} required>
        <input id="name" name="name" required placeholder="Ex.: Água potável" className={inputClass} />
      </Field>

      <Field label="Categoria" name="category" errors={state.errors?.category} required>
        <input id="category" name="category" required placeholder="Ex.: hidratação" className={inputClass} />
      </Field>

      <Field label="Unidade de medida" name="unit" errors={state.errors?.unit} required>
        <input id="unit" name="unit" required placeholder="litros, kits, unidades" className={inputClass} />
      </Field>

      <Field
        label="Estoque mínimo"
        name="minimum_stock"
        errors={state.errors?.minimum_stock}
        hint="Abaixo deste valor o recurso é sinalizado na Central Logística."
      >
        <input
          id="minimum_stock"
          name="minimum_stock"
          type="number"
          min={0}
          step={1}
          defaultValue={0}
          className={inputClass}
        />
      </Field>

      <div className="md:col-span-2">
        <Field
          label="Demanda por pessoa"
          name="demand_per_person"
          errors={state.errors?.demand_per_person}
          hint="Parâmetro demonstrativo do protótipo (ex.: água = 5 L/pessoa, refeições = 3/pessoa/dia). Alimenta a estimativa de demanda."
          required
        >
          <input
            id="demand_per_person"
            name="demand_per_person"
            type="number"
            min={0}
            step="0.001"
            defaultValue={1}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="md:col-span-2 space-y-3">
        <FormFeedback state={state} />
        <SubmitButton pendingLabel="Cadastrando...">Cadastrar recurso</SubmitButton>
      </div>
    </form>
  )
}

export function StockForm({
  shelters,
  resources,
}: {
  shelters: ShelterRow[]
  resources: ResourceRow[]
}) {
  const [state, formAction] = useActionState(setStockQuantity, IDLE_STATE)

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-4">
      <div className="md:col-span-2">
        <Field label="Abrigo" name="shelter_id" errors={state.errors?.shelter_id} required>
          <select id="shelter_id" name="shelter_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Selecione o abrigo
            </option>
            {shelters.map((shelter) => (
              <option key={shelter.id} value={shelter.id}>
                {shelter.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Recurso" name="resource_id" errors={state.errors?.resource_id} required>
        <select id="resource_id" name="resource_id" required defaultValue="" className={inputClass}>
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

      <Field label="Quantidade" name="quantity" errors={state.errors?.quantity} required>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={0}
          step={1}
          required
          className={inputClass}
        />
      </Field>

      <div className="md:col-span-4 space-y-3">
        <FormFeedback state={state} />
        <SubmitButton variant="secondary" pendingLabel="Ajustando...">
          Ajustar estoque (inventário)
        </SubmitButton>
        <p className="text-xs text-muted">
          Use este ajuste para carga inicial ou correção de contagem. O fluxo do dia a dia é a
          movimentação, que preserva histórico.
        </p>
      </div>
    </form>
  )
}
