<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { SentryTracer, setTracer} from '@gcorevideo/player';
import { setTracer as setTracerPlugins} from '@gcorevideo/player-plugins';
import * as Sentry from '@sentry/vue';
import pkg from './package.json';
import deps from './package-lock.json';
import { RemoteTracer } from "./utils/RemoteTracer";

if (import.meta.client) {
  const client = Sentry.init({
    debug: true,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENV,
    initialScope: (scope) => {
      scope.setTags({
        client: pkg.name,
        build_id: import.meta.env.VITE_SENTRY_BUILD_ID
      });
      return scope;
    },
    integrations: [Sentry.browserTracingIntegration()],
    release: deps.packages['node_modules/@gcorevideo/player'].version,
    tracesSampleRate: 1.0,
  });
  if (client) {
    const tracer = new RemoteTracer(new SentryTracer(client, Sentry.getGlobalScope()));
    setTracer(tracer);
    setTracerPlugins(tracer);
  } else {
    console.error("Sentry client is not initialized")
  }
}

useFetchSource();
</script>
