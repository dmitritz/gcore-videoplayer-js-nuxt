import tailwindcss from '@tailwindcss/vite'
import fetch from 'node-fetch'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: [
    '~/assets/css/main.css',
    '~/node_modules/@gcorevideo/player-plugins/dist/index.css',
  ],
  devtools: { enabled: true },
  hooks: {
    ready: async (nuxt) => {
      if (import.meta.server && import.meta.env.VERCEL_WEBHOOK_URL) {
        console.log('ready', typeof nuxt)
        try {
          const response = await fetch(import.meta.env.VERCEL_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: import.meta.env.VERCEL_WEBHOOK_STARTUP_BODY,
          })
          console.log('response', response)
        } catch (error) {
          console.error('error', error)
        }
      }
    },
  },
  modules: ['@pinia/nuxt', '@sentry/nuxt/module'],
  // routeRules: {
  //   '/': {
  //     ssr: false,
  //   },
  // },
  ssr: false,
  vite: {
    plugins: [tailwindcss()],
  },
})
