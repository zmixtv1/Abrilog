/** Client do Supabase para uso no BROWSER (Client Components). */

import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/types/database'
import { getSupabaseEnv } from './env'

export function createClient() {
  const { url, publishableKey } = getSupabaseEnv()
  return createBrowserClient<Database>(url, publishableKey)
}
