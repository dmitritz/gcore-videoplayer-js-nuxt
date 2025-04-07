import tailwindcss from '@tailwindcss/vite'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: [
    '~/assets/css/main.css',
    '~/node_modules/@gcorevideo/player/dist/index.css',
  ],
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@sentry/nuxt/module'],
  // routeRules: {
  //   '/': {
  //     ssr: false,
  //   },
  // },
  ssr: false,
  vite: {
    assetsInclude: ['**/*.svg'],
    build: {
      assetsInlineLimit: 0,
    },
    plugins: [tailwindcss()],
  },
})
