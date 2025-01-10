// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: [
    '~/assets/css/main.css',
    '~/node_modules/@gcorevideo/player/dist/index.css',
    '~/node_modules/@gcorevideo/player-plugins/dist/index.css',
  ],
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // routeRules: {
  //   '/': {
  //     ssr: false,
  //   },
  // },
  ssr: false,
})