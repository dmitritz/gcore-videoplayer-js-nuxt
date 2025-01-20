<template>
  <nuxt-layout>
    <template #header>
      <reference-links>
        <a
          href="https://api.gcore.com/docs/streaming#section/Introduction"
          target="_blank"
          >Streaming API reference</a
        >
        <a
          href="https://gcore.com/docs/streaming-platform/live-streaming/webrtc-to-hls-transcoding#webrtc-ingest-and-transcoding-to-hlsdash"
          target="_blank"
          title="GCore Streaming API WebRTC to HLS"
          >WebRTC to HLS</a
        >
      </reference-links>
    </template>
    <div class="source-settings w-full px-2">
      <div class="controls flex flex-col gap-2 gap-y-3 mb-4 gap-1">
        <div>
          <label for="sources" class="font-medium">Sources</label>
          <span class="text-sm text-slate-600">
            one per line in the priority order. The first supported one will be
            used
          </span>
        </div>
        <div>
          <textarea
            id="sources"
            v-model="rawSources"
            class="border p-2 w-full"
            cols="4"
          ></textarea>
        </div>
        <div class="flex gap-2 items-center">
          <button @click="load" :disabled="!hasValidSources" v-show="!loaded">
            Load
          </button>
          <span v-show="loaded" class="text-slate-700">Loaded</span>
          <button @click="clear" :disabled="!rawSources.length">Clear</button>
        </div>
      </div>
      <div v-if="error" class="text-red-950">{{ error }}</div>
    </div>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import useSettingsStore from '../store/settings'

const error = ref('')

const settings = useSettingsStore()

const rawSources = ref(settings.sources.join('\n'))

const parsedSources = computed(() => parseSources(rawSources.value))

const loaded = computed(
  () =>
    parsedSources.value.length &&
    sameItems(parsedSources.value, settings.sources)
)

const hasValidSources = computed(() => parsedSources.value.length > 0)

function clear() {
  rawSources.value = ''
  error.value = ''
}

function load() {
  settings.setSources(parsedSources.value)
}

function sameItems(a: string[], b: string[]) {
  return a.length === b.length && a.every((item) => b.includes(item))
}
</script>

<style lang="css" scoped>
@tailwind components;

.controls {
  /* display: grid; */
  /* grid-auto-rows: auto; */
  /* grid-template-columns: max-content auto; */
  /* gap: 0.5rem 1rem; */
  /* margin-bottom: 1rem; */
}

pre {
  word-wrap: break-word;
  overflow-y: auto;
  max-height: var(--content-height);
}

input[type='text'] {
  @apply px-4 py-1 border border-slate-300;
}

@media (min-width: 1024px) {
  .source-settings {
    --form-height: 150px;
  }

  pre {
    max-height: calc(var(--content-height) - var(--form-height));
  }
}
</style>
