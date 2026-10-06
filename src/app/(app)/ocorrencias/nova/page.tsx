import type { Metadata } from 'next'
import Link from 'next/link'

import { OccurrenceForm } from '@/components/occurrences/occurrence-form'
import { PageHeader } from '@/components/ui/primitives'
import { requireSession } from '@/lib/auth/session'
import { READ_ONLY_MESSAGE } from '@/lib/actions/state'

export const metadata: Metadata = { title: 'Nova ocorrência · AbrigoLog' }

export default async function NewOccurrencePage() {
  const session = await requireSession()

  return (
    <>
      <PageHeader
        title="Registrar ocorrência"
        description="Ao salvar, o sistema calcula o score de prioridade, estima a demanda de recursos e já registra os abrigos recomendados."
        action={
          <Link href="/ocorrencias" className="text-sm text-brand underline">
            Voltar para a lista
          </Link>
        }
      />

      {session.canWrite ? (
        <OccurrenceForm />
      ) : (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          {READ_ONLY_MESSAGE}
        </p>
      )}
    </>
  )
}
