import tailwindcss from '@tailwindcss/vite'

import dotenv from 'dotenv'

dotenv.config({ path: '.env.development.local' })

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
  runtimeConfig: {
    // Server-side environment variables
    redisUrl: process.env.AMBER_KV_REST_API_URL,
    redisToken: process.env.AMBER_KV_REST_API_TOKEN,
  },
  vite: {
    assetsInclude: ['**/*.svg'],
    build: {
      assetsInlineLimit: 0,
      target: 'esnext',
    },
    plugins: [tailwindcss()],
  },
})
