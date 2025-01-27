<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { setTracer, version } from '@gcorevideo/player'
import { setTracer as setTracerPlugins } from '@gcorevideo/player-plugins'
import { RemoteTracer, SentryTracer } from '@gcorevideo/utils'
import * as Sentry from '@sentry/vue'
import pkg from './package.json'
import { Browser } from '@clappr/core'
import Fingerprint from '@fingerprintjs/fingerprintjs'

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
    release: version().gplayer,
    tracesSampleRate: 1.0,
  })
  if (client) {
    const sentryScope = Sentry.getGlobalScope()
    const st = new SentryTracer(client, sentryScope)
    const tracer = new RemoteTracer(st, {
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
    })
    setTracer(tracer)
    setTracerPlugins(tracer)
    Fingerprint.load()
      .then((agent) => agent.get())
      .then((res) => {
        tracer.setTag('visitorId', res.visitorId)
        sentryScope.setTag('visitorId', res.visitorId)
      })
  } else {
    console.error('Sentry client is not initialized')
  }
}
</script>
