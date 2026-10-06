'use client'

/**
 * Formulario de registro de ocorrencia.
 *
 * O total de pessoas afetadas e a soma do detalhamento por faixa (adultos,
 * criancas, idosos e PCD) - a mesma regra vale no banco, via trigger.
 */

import { useActionState, useState } from 'react'

import { createOccurrence } from '@/lib/actions/occurrences'
import { IDLE_STATE } from '@/lib/actions/state'
import { SubmitButton } from '@/components/ui/buttons'
import { Card, CardBody, CardHeader, Field, FormFeedback, inputClass } from '@/components/ui/primitives'
import { formatNumber } from '@/lib/utils/format'
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_TYPE_LABELS, SEVERITY_LABELS } from '@/lib/utils/labels'
import { OCCURRENCE_STATUSES, OCCURRENCE_TYPES, SEVERITY_LEVELS } from '@/types/domain'

const BRASILIA = { latitude: -15.7939, longitude: -47.8828 }

export function OccurrenceForm() {
  const [state, formAction] = useActionState(createOccurrence, IDLE_STATE)
  const [people, setPeople] = useState({ adults: 0, children: 0, elderly: 0, pcd: 0 })

  const total = people.adults + people.children + people.elderly + people.pcd

  const onPeopleChange = (key: keyof typeof people) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setPeople((previous) => ({ ...previous, [key]: Number.isFinite(value) ? Math.max(0, value) : 0 }))
  }

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader title="Identificação da ocorrência" />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Título" name="title" errors={state.errors?.title} required>
              <input
                id="title"
                name="title"
                required
                minLength={3}
                placeholder="Ex.: Enchente no Setor Habitacional Sol Nascente"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Tipo" name="type" errors={state.errors?.type} required>
            <select id="type" name="type" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Selecione o tipo
              </option>
              {OCCURRENCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {OCCURRENCE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Severidade"
            name="severity"
            errors={state.errors?.severity}
            hint="1 = baixa · 5 = crítica. Peso de 40% no score de prioridade."
            required
          >
            <select id="severity" name="severity" required defaultValue="3" className={inputClass}>
              {SEVERITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level} - {SEVERITY_LABELS[level]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status inicial" name="status" errors={state.errors?.status}>
            <select id="status" name="status" defaultValue="aberta" className={inputClass}>
              {OCCURRENCE_STATUSES.filter((status) => status !== 'encerrada').map((status) => (
                <option key={status} value={status}>
                  {OCCURRENCE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Famílias afetadas" name="affected_families" errors={state.errors?.affected_families}>
            <input
              id="affected_families"
              name="affected_families"
              type="number"
              min={0}
              step={1}
              defaultValue={0}
              className={inputClass}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Descrição" name="description" errors={state.errors?.description}>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Situação encontrada, providências em andamento, riscos observados."
                className={inputClass}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Localização"
          description="As coordenadas alimentam o cálculo de distância na recomendação de abrigo e o mapa operacional."
        />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <Field label="Cidade" name="city" errors={state.errors?.city}>
            <input id="city" name="city" defaultValue="Brasilia" className={inputClass} />
          </Field>

          <Field label="UF" name="state" errors={state.errors?.state}>
            <input id="state" name="state" defaultValue="DF" maxLength={2} className={inputClass} />
          </Field>

          <Field label="Bairro / região administrativa" name="neighborhood" errors={state.errors?.neighborhood}>
            <input id="neighborhood" name="neighborhood" placeholder="Ex.: Ceilândia Norte" className={inputClass} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude" name="latitude" errors={state.errors?.latitude}>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                min={-90}
                max={90}
                defaultValue={BRASILIA.latitude}
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
                defaultValue={BRASILIA.longitude}
                className={inputClass}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Pessoas afetadas"
          description="Somente dados agregados: o sistema não armazena nome, CPF ou endereço (LGPD)."
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Adultos" name="adults" errors={state.errors?.['affected.adults']}>
              <input
                id="adults"
                name="adults"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                onChange={onPeopleChange('adults')}
                className={inputClass}
              />
            </Field>

            <Field label="Crianças" name="children" errors={state.errors?.['affected.children']}>
              <input
                id="children"
                name="children"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                onChange={onPeopleChange('children')}
                className={inputClass}
              />
            </Field>

            <Field label="Idosos" name="elderly" errors={state.errors?.['affected.elderly']}>
              <input
                id="elderly"
                name="elderly"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                onChange={onPeopleChange('elderly')}
                className={inputClass}
              />
            </Field>

            <Field
              label="Pessoas com deficiência"
              name="people_with_disabilities"
              errors={state.errors?.['affected.people_with_disabilities']}
            >
              <input
                id="people_with_disabilities"
                name="people_with_disabilities"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                onChange={onPeopleChange('pcd')}
                className={inputClass}
              />
            </Field>
          </div>

          <p className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm text-foreground">
            Total de pessoas afetadas: <strong>{formatNumber(total)}</strong>
            <span className="text-muted">
              {' '}
              · usado na estimativa de demanda de recursos e no score de prioridade
            </span>
          </p>
        </CardBody>
      </Card>

      <FormFeedback state={state} />

      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingLabel="Registrando ocorrência...">
          Registrar ocorrência e calcular prioridade
        </SubmitButton>
      </div>
    </form>
  )
}
