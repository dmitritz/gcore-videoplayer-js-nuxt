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
      <div
        class="controls flex flex-col gap-y-3 mb-8 gap-1 pb-4 border-b border-slate-200"
      >
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
        <div v-if="settings.godMode" class="flex flex-col gap-2">
          <div class="label">
            <label for="stream_config_url" class="text-lg"
              >Player config URL</label
            >
            <div class="subscript">
              If not specified, it will be derived from the media source URL.
            </div>
          </div>
          <input
            type="text"
            id="stream_config_url"
            :value="settings.streamConfigUrl"
            @change="
              (e) =>
                settings.setStreamConfigUrl(
                  (e.target as HTMLInputElement)?.value,
                )
            "
            class="w-full textfield"
            placeholder="https://player.gvideo.co/video/{stream_id}_{slug}/config.json"
          />
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
        <div v-if="error" class="text-red-950 dark:text-red-400">
          {{ error }}
        </div>
      </div>
      <div
        class="controls flex flex-col gap-y-3 mb-8 gap-1 pb-4 border-b border-slate-200"
      >
        <div>
          <span class="label text-lg">Logo</span>
          <div class="subscript" v-if="logoDisabled">
            <exclamation-triangle-icon class="w-4 h-4 inline-block" />
            Enable
            <b>Logo</b> plugin on the
            <router-link to="/settings">Settings</router-link> tab
          </div>
        </div>
        <div class="flex-col gap-2">
          <label for="logo_url" class="label">Image URL</label>
          <input
            :value="settings.logo.url"
            @change="
              (e) => settings.setLogoUrl((e.target as HTMLInputElement)?.value)
            "
            :disabled="logoDisabled"
            type="text"
            id="logo_url"
            class="w-full textfield"
            placeholder="https://my-company.com/files/1.png"
          />
        </div>
        <div class="flex flex-col gap-2">
          <span class="label">Position</span>
          <div class="flex flex-row gap-4 content-center items-center">
            <label
              v-for="item of LOGO_POSITIONS"
              :for="`logo_position-${item}`"
            >
              <input
                type="radio"
                name="logo_position"
                :id="`logo_position-${item}`"
                :checked="settings.logo.position == item"
                @change="settings.setLogoPosition(item)"
                :disabled="logoDisabled"
              />
              {{ LOGO_POSITION_LABEL[item] }}
            </label>
          </div>
        </div>
        <div class="flex gap-4 content-center items-center">
          <label class="label" for="logo_width">Width</label>
          <input
            type="number"
            :value="settings.logo.width"
            @change="(e) => settings.setLogoWidth(parseInt(e.target.value))"
            class="textfield text-sm w-15"
            id="logo_width"
            :disabled="logoDisabled"
          />
          <label class="label" for="logo_height">Height</label>
          <input
            type="number"
            :value="settings.logo.height"
            @change="(e) => settings.setLogoHeight(parseInt(e.target.value))"
            class="textfield text-sm w-15"
            id="logo_height"
            :disabled="logoDisabled"
          />
          <label for="logo_x" class="label">X</label>
          <input
            type="number"
            :value="settings.logo.x"
            @change="(e) => settings.setLogoX(parseInt(e.target.value))"
            class="textfield text-sm w-15"
            id="logo_x"
            :disabled="logoDisabled"
          />
          <label for="logo_y" class="label">Y</label>
          <input
            type="number"
            :value="settings.logo.y"
            @change="(e) => settings.setLogoY(parseInt(e.target.value))"
            class="textfield text-sm w-15"
            id="logo_y"
            :disabled="logoDisabled"
          />
        </div>
      </div>
      <thumbnails-block />
      <clips-settings />
    </div>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

import useSettingsStore from '../store/settings'

const LOGO_POSITIONS = ['topleft', 'topright', 'bottomright', 'bottomleft']
const LOGO_POSITION_LABEL = {
  topleft: 'Top left',
  topright: 'Top right',
  bottomleft: 'Bottom left',
  bottomright: 'Bottom right',
}

const error = ref('')

const settings = useSettingsStore()

const rawSources = ref<string>('')

const poster = ref('')

const parsedSources = computed(() => parseSources(rawSources.value))

const loaded = computed(
  () =>
    parsedSources.value.length &&
    sameItems(parsedSources.value, settings.sources) &&
    poster.value === settings.poster,
)

const hasValidSources = computed(() => parsedSources.value.length > 0)

const logoDisabled = computed(() => !settings.plugins.includes('logo'))

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
