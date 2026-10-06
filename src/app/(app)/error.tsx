'use client'

/** Fronteira de erro das telas internas: mensagem tratada, sem stack trace. */

import { useEffect } from 'react'

import { ErrorState } from '@/components/ui/primitives'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[abrigolog] erro na interface:', error)
  }, [error])

  return (
    <ErrorState
      title="Não foi possível carregar esta tela"
      description="Verifique a conexão com o banco de dados e tente novamente. Se o problema persistir, confira as variáveis de ambiente do Supabase."
      action={
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Tentar novamente
        </button>
      }
    />
  )
}
