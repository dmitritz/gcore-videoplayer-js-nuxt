<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { setTracer } from '@gcorevideo/player'
import {
  Logger,
  LogTracer,
  RemoteTracer,
  SentryTracer,
} from '@gcorevideo/utils'
import * as Sentry from '@sentry/nuxt'
import pkg from './package.json'
import { Browser } from '@clappr/core'
import Fingerprint from '@fingerprintjs/fingerprintjs'
import useSettings from '~/store/settings'

const settings = useSettings()

if (import.meta.client) {
  const tags = {
    client: pkg.name,
    build_id: import.meta.env.VITE_SENTRY_BUILD_ID,
  }
  const baseTracer = import.meta.env.VITE_SENTRY_DSN
    ? createSentryTracer((scope: Sentry.Scope) => {
        Fingerprint.load()
          .then((agent) => agent.get())
          .then((res) => {
            tracer.setTag('visitor_id', res.visitorId)
            scope.setTags(tags)
            scope.setTag('visitor_id', res.visitorId)
            settings.setVisitorId(res.visitorId)
          })
      })
    : createLogTracer()
  const tracer = new RemoteTracer(baseTracer, {
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
  }, {
    delay: 2000,
  })
  setTracer(tracer)
}

function createSentryTracer(setup: (scope: Sentry.Scope) => void) {
  const client = Sentry.getClient()
  if (!client) {
    console.error('Sentry client is not initialized')
    return
  }
  const sentryScope = Sentry.getGlobalScope()
  setup(sentryScope)
  return new SentryTracer(client, sentryScope)
}

function createLogTracer() {
  Logger.enable('*')
  return new LogTracer(pkg.name)
}
</script>
