import * as Sentry from '@sentry/nuxt'
import { version } from '@gcorevideo/player'
import pkg from './package.json'

export default function () {
  Sentry.init({
    debug: true,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENV,
    initialScope: (scope) => {
      scope.setTag('build_id', import.meta.env.VITE_SENTRY_BUILD_ID)
      scope.setTag('client', pkg.name)
      scope.setTag('client_version', pkg.version)
      return scope
    },
    integrations: [Sentry.browserTracingIntegration()],
    release: version().gplayer,
    tracesSampleRate: 1.0,
  })
}
