// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts'],
  fonts: {
    // Weights are declared explicitly: auto-detection only picked up 400,
    // which left `font-semibold` (600) to be faux-bolded by the browser.
    families: [
      { name: 'Instrument Sans', provider: 'google', weights: [400, 600, 700] },
    ],
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
})
