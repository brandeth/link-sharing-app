import type { Backend } from './types'

export * from './types'

export type BackendKind = 'memory' | 'supabase'

/* Each backend is imported only when it is the one selected, so a local
   build never loads the Supabase client and a production build never
   ships the in-memory store. */
export async function createBackend(kind: string): Promise<Backend> {
  switch (kind) {
    case 'memory':
      return (await import('./memory')).memoryBackend
    case 'supabase':
      throw new Error('The Supabase backend is not implemented yet. Set NUXT_PUBLIC_BACKEND=memory.')
    default:
      throw new Error(`Unknown backend "${kind}". Set NUXT_PUBLIC_BACKEND to "memory" or "supabase".`)
  }
}
