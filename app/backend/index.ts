import type { Backend } from './types'

export * from './types'

export type BackendKind = 'memory' | 'supabase'

/* Each backend is imported only when it is the one selected, so local
   development never downloads the Supabase client and production never
   downloads the in-memory store. */
export async function createBackend(config: {
  backend: string
  supabaseUrl: string
  supabasePublishableKey: string
}): Promise<Backend> {
  switch (config.backend) {
    case 'memory':
      return (await import('./memory')).memoryBackend
    case 'supabase':
      /* Fails loudly rather than falling back to memory: a production
         build quietly keeping data in the tab would look like it works. */
      if (!config.supabaseUrl || !config.supabasePublishableKey) {
        throw new Error('The supabase backend needs NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
      }
      return (await import('./supabase')).createSupabaseBackend(config.supabaseUrl, config.supabasePublishableKey)
    default:
      throw new Error(`Unknown backend "${config.backend}". Set NUXT_PUBLIC_BACKEND to "memory" or "supabase".`)
  }
}
