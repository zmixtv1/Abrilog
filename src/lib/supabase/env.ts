/**
 * Leitura das variaveis de ambiente do Supabase.
 *
 * Somente chaves PUBLICAS sao usadas pela aplicacao. A SERVICE_ROLE_KEY nunca
 * deve ser referenciada aqui (nem em qualquer arquivo que chegue ao browser).
 *
 * A validacao acontece em tempo de requisicao (nao no import), para que o build
 * da Vercel nao falhe antes de as variaveis existirem.
 */

export interface SupabaseEnv {
  url: string
  publishableKey: string
}

/** Aceita o nome novo (publishable) e o antigo (anon) da chave publica. */
function readPublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/** True quando a aplicacao esta configurada para falar com o Supabase. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && readPublishableKey())
}

/** Variaveis validadas. Lanca erro legivel quando faltar configuracao. */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = readPublishableKey()

  if (!url || !publishableKey) {
    throw new Error(
      'Configuracao do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver .env.example).',
    )
  }

  return { url, publishableKey }
}
