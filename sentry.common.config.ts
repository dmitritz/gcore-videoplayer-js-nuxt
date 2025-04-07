import * as Sentry from '@sentry/nuxt'
import pkg from './package.json'

export default function (tags?: Record<string, string>) {
  Sentry.init({
    debug: true,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENV,
    initialScope: (scope) => {
      scope.setTag('build_id', import.meta.env.VITE_SENTRY_BUILD_ID)
      scope.setTag('client', pkg.name)
      scope.setTag('client_version', pkg.version)
      if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }
      return scope
    },
    // integrations: [Sentry.browserTracingIntegration()],
    release: pkg.version,
    tracesSampleRate: 1.0,
  })
}
