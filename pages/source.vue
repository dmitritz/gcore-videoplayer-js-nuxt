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
          title="Gcore Streaming API WebRTC to HLS"
          >WebRTC to HLS</a
        >
      </reference-links>
    </template>
    <div class="source-settings w-full px-2">
      <div class="controls flex flex-col gap-y-3 mb-8 gap-1 pb-4 border-b border-slate-200">
        <div>
          <label for="sources" class="label text-lg">Sources</label>
          <span class="subscript">
            one per line in the priority order. The first supported one will be
            used
          </span>
        </div>
        <div>
          <textarea
            id="sources"
            v-model="rawSources"
            class="p-2 w-full textfield"
            :class="{ error: !hasValidSources }"
            cols="4"
            placeholder="https://example.com/stream.mpd"
          ></textarea>
        </div>
        <div class="flex gap-2" v-if="false">
          <div class="label">Prefer</div>
          <label for="priority_transport_dash" class="sublabel">
            <input
              type="radio"
              id="priority_transport_dash"
              v-model="settings.priorityTransport"
              value="dash"
            />
            DASH
          </label>
          <label for="priority_transport_hls" class="sublabel">
            <input
              type="radio"
              id="priority_transport_hls"
              v-model="settings.priorityTransport"
              value="hls"
            />
            HLS
          </label>
        </div>
        <div>
          <label for="poster" class="label text-lg">Poster</label>
          <span class="subscript">
            is shown when the video is loading or stopped.
          </span>
        </div>
        <div>
          <input
            type="text"
            id="poster"
            v-model="poster"
            class="w-full textfield"
            placeholder="URL"
          />
        </div>
        <div class="flex gap-2 items-center mt-2 mb-4">
          <button
            @click="load"
            :disabled="!hasValidSources"
            v-show="!loaded"
            id="sources_load"
          >
            Load
          </button>
          <span v-show="loaded" class="loaded" id="sources_loaded">Loaded</span>
          <button
            @click="clear"
            :disabled="!rawSources.length"
            id="sources_clear"
          >
            Clear
          </button>
        </div>
        <div v-if="error" class="text-red-950 dark:text-red-400">{{ error }}</div>
      </div>
      <thumbnails-block />
      <clips-settings />
    </div>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import useSettingsStore from '../store/settings'

const error = ref('')

const settings = useSettingsStore()

const rawSources = ref<string>('')

const poster = ref('')

const parsedSources = computed(() => parseSources(rawSources.value))

const loaded = computed(
  () =>
    parsedSources.value.length &&
    sameItems(parsedSources.value, settings.sources) &&
    poster.value === settings.poster
)

const hasValidSources = computed(() => parsedSources.value.length > 0)

onMounted(() => {
  rawSources.value = settings.sources.join('\n')
  poster.value = settings.poster
})

function clear() {
  rawSources.value = ''
  error.value = ''
  poster.value = ''
}

function load() {
  settings.setSources(parsedSources.value)
  settings.setPoster(poster.value)
}

function sameItems(a: string[], b: string[]) {
  return a.length === b.length && a.every((item) => b.includes(item))
}
</script>

<style lang="css" scoped>
@import 'tailwindcss';

pre {
  word-wrap: break-word;
  overflow-y: auto;
  max-height: var(--content-height);
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
