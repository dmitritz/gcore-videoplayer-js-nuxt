import { computed } from 'vue'

import type { SettingsStore } from '~/store/settings'

export default function useStreamConfig(settings: SettingsStore) {
  const streamConfigUrl = computed(() => {
    if (settings.streamConfigUrl) {
      return settings.streamConfigUrl
    }
    if (!settings.sources.length) {
      return ''
    }
    const mainSource = settings.sources[0]
    const mainSourceUrl =
      typeof mainSource === 'string' ? mainSource : mainSource.source
    const srcUrl = new URL(mainSourceUrl)
    const m = srcUrl.pathname.match(/^\/\w+\/\d+_\w+\//)
    if (!m) {
      return ''
    }
    const path = m[0]
    const domain =
      srcUrl.hostname.includes('preprod') ||
      srcUrl.hostname.includes('gvideo.dev')
        ? 'player.preprod.gvideo.co'
        : 'player.gvideo.co'
    return `https://${domain}${path}/config.json`
  })
  return streamConfigUrl
}
