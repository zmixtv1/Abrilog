import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Erro 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted">
          O endereço acessado não existe ou o registro foi removido.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Voltar ao painel
        </Link>
      </div>
    </main>
  )
}
