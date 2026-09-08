// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/icon'],
  icon: {
    // `scan` walks the source for literal icon names and inlines just
    // those from the locally installed `@iconify-json/ph`, so an icon
    // costs a few hundred bytes and needs no request at all. Bundling
    // the collection server-side instead would ship all ~9,000 Phosphor
    // icons (4.4 MB) to render the handful this app uses.
    //
    // The trade-off: only statically written names are found. An icon
    // assembled at runtime has to be added to `clientBundle.icons` by
    // hand or it will not render — `fallbackToApi` is off, so there is
    // no CDN to catch the miss, which is what keeps the app
    // offline-capable and free of third-party requests.
    clientBundle: { scan: true, icons: [] },
    serverBundle: false,
    fallbackToApi: false,
  },
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
