<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { SentryTracer, setTracer } from '@gcorevideo/player'
import { setTracer as setTracerPlugins } from '@gcorevideo/player-plugins'
import * as Sentry from '@sentry/vue'
import pkg from './package.json'
import deps from './package-lock.json'
import { RemoteTracer } from './utils/RemoteTracer'
import { Browser } from '@clappr/core'

if (import.meta.client) {
  const tags = {
    client: pkg.name,
    build_id: import.meta.env.VITE_SENTRY_BUILD_ID,
  }
  const client = Sentry.init({
    debug: true,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENV,
    initialScope: (scope) => {
      scope.setTags(tags)
      return scope
    },
    integrations: [Sentry.browserTracingIntegration()],
    release: deps.packages['node_modules/@gcorevideo/player'].version,
    tracesSampleRate: 1.0,
  })
  if (client) {
    const tracer = new RemoteTracer(
      new SentryTracer(client, Sentry.getGlobalScope()),
      {
        device: Browser.device?.replace(/ /g, '_'),
        browser: Browser.name,
        browser_ver: Browser.version,
        ios: Browser.isiOS,
        android: Browser.isAndroid,
        mobile: Browser.isMobile,
        localstorage: Browser.hasLocalstorage,
        os: Browser.os.group?.replace(/ /g, '_'),
        os_name: Browser.os.name?.replace(/ /g, '_'),
        width: Browser.viewport.width,
        height: Browser.viewport.height,
      }
    )
    setTracer(tracer)
    setTracerPlugins(tracer)
  } else {
    console.error('Sentry client is not initialized')
  }
}

useFetchSource()
</script>
