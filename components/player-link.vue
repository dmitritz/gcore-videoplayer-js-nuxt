<template>
  <div
    class="flex gap-2 items-center content-center justify-end nowrap flex-nowrap"
  >
    <button
      @click="copySettingsUrl()"
      :disabled="copied"
      class="inline-flex items-center gap-1 text-sm"
      title="Copy link to the current player configuration"
    >
      <clipboard-icon class="h-4 w-4" v-if="!copied" />
      <clipboard-document-check-icon class="h-4 w-4" v-else />
      {{ copied ? 'copied' : 'link' }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import {
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/vue/24/outline'
import copy from 'copy-to-clipboard'

import useSettingsStore from '../store/settings'
// import { trace } from '@gcorevideo/player'

// const T = 'player-link'

const settings = useSettingsStore()

const copied = ref(false)

const playerLink = computed(() => {
  const url = new URL(window.location.href)
  Object.entries(settings.structured).forEach(([key, value]) => {
    if (value === null) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, String(value))
    }
  })
  return url.href
})

function copySettingsUrl() {
  settings.persist().then((persistKey) => {
    const url = new URL(playerLink.value)
    url.searchParams.set('k', persistKey)
    copy(url.href, {
      format: 'text/plain',
    })
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1000)
  })
}
</script>
