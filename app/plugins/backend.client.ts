import { createBackend } from '~/backend'

/* Resolves the configured backend once, before the app mounts, and
   provides it as `$backend`. Client-only: both backends keep their
   session in the browser, which is also why the routes that use them
   are rendered client-side (see `routeRules` in nuxt.config.ts). */
export default defineNuxtPlugin(async () => {
  const backend = await createBackend(useRuntimeConfig().public)
  return { provide: { backend } }
})
