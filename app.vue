<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import mousetrap from 'mousetrap'
import {
  setTracer,
  version
} from '@gcorevideo/player'
import {
  ChainedTracer,
  Logger,
  LogTracer,
  RemoteTracer,
  SentryTracer,
  type Tracer,
} from '@gcorevideo/utils'

import * as Sentry from '@sentry/nuxt'
import pkg from './package.json'
import { Browser } from '@clappr/core'
import useSettings from '~/store/settings'

const KEYS_GODMODE = 'i d d q d'

const settings = useSettings()

console.log("gcore-videoplayer-nuxt-app version %s/%s %s", pkg.version, version().gplayer, new Date().toISOString())

const tracers: Tracer[] = [
  createLogTracer(),
]

if (import.meta.client) {
  const tags = {
    client: pkg.name,
    build_id: import.meta.env.VITE_SENTRY_BUILD_ID,
  }
  if (import.meta.env.VITE_SENTRY_DSN) {
    tracers.push(createSentryTracer((scope: Sentry.Scope) => {
      getVisitorId().then((visitorId: string) => {
        tracers.forEach((tracer) => {
          // TODO support setTag on all tracers
          if (tracer instanceof RemoteTracer) {
            tracer.setTag('visitor_id', visitorId)
          }
        })
        scope.setTags(tags)
        scope.setTag('visitor_id', visitorId)
        settings.setVisitorId(visitorId)
        console.log("gcore-videoplayer-nuxt-app visitor_id %s", visitorId)
      })
    }))
  }
  tracers.push(new RemoteTracer(
    undefined,
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
    },
    {
      delay: 2000,
    }
  ))
  const tracer = new ChainedTracer(tracers)
  setTracer(tracer)

  mousetrap.bind('option+h', () => {
    navigateTo('/')
  })
  mousetrap.bind('option+e', () => {
    navigateTo('/settings')
  })
  mousetrap.bind('option+s', () => {
    navigateTo('/source')
  })
  settings.load()
  mousetrap.bind(KEYS_GODMODE, () => {
    settings.setGodMode()
  })
  const url = useRequestURL()
  const godMode = url.searchParams.get('iddqd')
  if (godMode !== null) {
    settings.setGodMode()
  }
}

function createSentryTracer(setup: (scope: Sentry.Scope) => void) {
  const client = Sentry.getClient()
  if (!client) {
    console.error('Sentry client is not initialized')
    return {
      reportError: () => { },
      trace: () => { },
      setTag: () => { },
    } as Tracer
  }
  const sentryScope = Sentry.getGlobalScope()
  setup(sentryScope)
  return new SentryTracer(client, sentryScope)
}

function createLogTracer() {
  Logger.enable('*')
  return new LogTracer(pkg.name)
}

function getVisitorId() {
  return new Promise<string>((resolve) => {
    const storedVisitorId = sessionStorage.getItem('visitor_id')
    if (storedVisitorId) {
      return resolve(storedVisitorId)
    }
    const newVisitorId = crypto.randomUUID()
    sessionStorage.setItem('visitor_id', newVisitorId)
    resolve(newVisitorId)
  })
}
</script>
