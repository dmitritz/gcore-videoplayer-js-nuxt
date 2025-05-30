<template>
  <nuxt-layout>
    <template #header>
      <reference-links>
        <a href="https://github.com/G-Core/gcore-videoplayer-js" target="_blank"
          >Player SDK documentation</a
        >
        <a
          href="https://github.com/video-dev/hls.js/blob/88bba9442f6e1430151e3ae77b88963afbe2199b/docs/API.md#hlsjs-v1-api"
          target="_blank"
        >
          HLS.js API documentation</a
        >
      </reference-links>
    </template>
    <div class="h-full px-2">
      <settings-block />
    </div>
    <div
      v-if="godModeNotification"
      class="god-mode-notification fixed bottom-0 right-0 text-white py-3 px-6 uppercase text-xl font-bold"
    >
      God mode
    </div>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import mousetrap from 'mousetrap'
import useSettings from '~/store/settings'

const godModeNotification = ref(false)

const settings = useSettings()

const KEYS_GODMODE = 'i d d q d'

onMounted(() => {
  mousetrap.bind(KEYS_GODMODE, () => {
    setGodMode()
    if (godModeNotification.value) {
      return
    }
    godModeNotification.value = true
    setTimeout(() => {
      godModeNotification.value = false
    }, 3000)
  })
  const url = useRequestURL()
  const godMode = url.searchParams.get('iddqd')
  if (godMode !== null) {
    setGodMode()
  }
})

onBeforeUnmount(() => {
  mousetrap.unbind(KEYS_GODMODE)
})

function setGodMode() {
  settings.setGodMode()
}
</script>

<style scoped>
@reference "~/assets/css/main.css";

.god-mode-notification {
  background-color: oklch(82.8% 0.189 84.429 / 67%);
}
</style>
