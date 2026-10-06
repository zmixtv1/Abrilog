'use client'

/** Formularios de autenticacao e de perfil. */

import { useActionState } from 'react'

import { signIn, updateProfile } from '@/lib/actions/auth'
import { IDLE_STATE } from '@/lib/actions/state'
import { SubmitButton } from '@/components/ui/buttons'
import { Field, FormFeedback, inputClass } from '@/components/ui/primitives'
import type { ProfileRow } from '@/types/domain'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(signIn, IDLE_STATE)

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}

      <Field label="E-mail" name="email" errors={state.errors?.email} required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="operador@defesacivil.df.gov.br"
          className={inputClass}
        />
      </Field>

      <Field label="Senha" name="password" errors={state.errors?.password} required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <FormFeedback state={state} />

      <SubmitButton className="w-full" pendingLabel="Entrando...">
        Entrar
      </SubmitButton>
    </form>
  )
}

export function ProfileForm({ profile }: { profile: ProfileRow | null }) {
  const [state, formAction] = useActionState(updateProfile, IDLE_STATE)

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Nome completo" name="full_name" errors={state.errors?.full_name} required>
        <input
          id="full_name"
          name="full_name"
          defaultValue={profile?.full_name ?? ''}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Órgão / organização"
        name="organization"
        errors={state.errors?.organization}
        hint="Ex.: Defesa Civil do Distrito Federal"
      >
        <input
          id="organization"
          name="organization"
          defaultValue={profile?.organization ?? ''}
          className={inputClass}
        />
      </Field>

      <FormFeedback state={state} />

      <SubmitButton>Salvar perfil</SubmitButton>
    </form>
  )
}
