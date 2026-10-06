import { redirect } from 'next/navigation'

/** A raiz leva direto ao painel; o proxy redireciona para /login se nao houver sessao. */
export default function Home() {
  redirect('/dashboard')
}
