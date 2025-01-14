<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { SentryTracer, setTracer} from '@gcorevideo/player';
import * as Sentry from '@sentry/vue';
import pkg from './package.json';
import deps from './package-lock.json';

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
  // @ts-ignore
  setTracer(new SentryTracer(client, Sentry.getGlobalScope()))
}

useFetchSource();
</script>
