<template>
  <div
    class="flex gap-2 items-center content-center justify-end nowrap flex-nowrap"
  >
    <button
      @click="copySettingsUrl()"
      :disabled="copied"
      class="inline-flex items-center gap-1 text-sm"
      title="Copy link to the configured player"
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

const settings = useSettingsStore()

const copied = ref(false)

const playerLink = computed(() => {
  const url = new URL(window.location.href)
  url.search = `?${settings.serialized}`
  return url.href
})

function copySettingsUrl() {
  copy(playerLink.value, {
    format: 'text/plain',
  })
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1000)
}
</script>
