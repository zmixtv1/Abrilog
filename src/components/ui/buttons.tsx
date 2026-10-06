'use client'

/** Botoes com estado de envio (loading) e confirmacao. */

import { useFormStatus } from 'react-dom'
import { useRef } from 'react'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800',
  secondary: 'border border-line bg-surface text-foreground hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const

export type ButtonVariant = keyof typeof VARIANTS

export function SubmitButton({
  children,
  pendingLabel = 'Salvando...',
  variant = 'primary',
  className = '',
  disabled,
}: {
  children: React.ReactNode
  pendingLabel?: string
  variant?: ButtonVariant
  className?: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
      {pending ? (
        <>
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * ConfirmDialog: pede confirmacao antes de enviar o formulario.
 * Usa <dialog> nativo para nao depender de biblioteca de modal.
 */
export function ConfirmSubmit({
  children,
  title,
  description,
  confirmLabel = 'Confirmar',
  variant = 'danger',
  pendingLabel = 'Processando...',
}: {
  children: React.ReactNode
  title: string
  description: string
  confirmLabel?: string
  variant?: ButtonVariant
  pendingLabel?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={`${BASE} ${VARIANTS[variant]}`}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-5 text-foreground backdrop:bg-slate-900/40"
      >
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={`${BASE} ${VARIANTS.secondary}`}
          >
            Cancelar
          </button>
          <SubmitButton variant={variant} pendingLabel={pendingLabel}>
            {confirmLabel}
          </SubmitButton>
        </div>
      </dialog>
    </>
  )
}
