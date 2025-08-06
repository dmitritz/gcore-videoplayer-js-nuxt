<template>
  <player-container :options="pluginOptions" @init="player = $event" />
  <div
    class="settings grid grid-cols-2 my-1 mb-2 px-2 items-baseline"
    v-if="exampleUi"
  >
    <div class="buttons font-semibold flex flex-col gap-1 sm:flex-row">
      <button
        @click="play"
        v-show="ready && !playing"
        class="playback"
        id="dashboard_play"
        :disabled="noSource"
      >
        Play
      </button>
      <button
        @click="pause"
        v-show="playing"
        class="playback"
        id="dashboard_pause"
      >
        Pause
      </button>
      <button
        @click="stop"
        v-show="ready && !stopped"
        class="playback"
        id="dashboard_stop"
      >
        Stop
      </button>
    </div>
    <div class="flex gap-2 items-center content-center justify-end flex-wrap">
      <span class="text-slate-600 dark:text-slate-300 text-sm" v-if="noSource"
        >no source</span
      >
      <span
        class="text-xs sm:text-sm"
        v-if="width && height"
        id="dashboard_quality"
        >{{ formatQuality(width, height) }}</span
      >
      <span class="text-xs sm:text-sm" v-if="bitrate" id="dashboard_bitrate">{{
        formatBitrate(bitrate)
      }}</span>
      <span class="local-time text-xs sm:text-sm text-left" v-if="showTime">{{
        formatTime(currentTime)
      }}</span>
      <span
        class="font-semibold text-sm uppercase"
        v-if="playbackType"
        id="dashboard_playback_type"
        >{{ playbackType }}</span
      >
      <button
        class="font-semibold text-sm sm:text-md uppercase"
        v-if="playback"
        @click="showSource = !showSource"
        id="dashboard_playback"
      >
        {{ formatPlaybackModule(playback) }}
      </button>
    </div>
    <div
      class="absolute p-4 rounded bg-white dark:bg-slate-900 opacity-90 right-0 w-full overflow-x-scroll z-10 max-w-96"
      @click="showSource = false"
      v-if="showSource"
    >
      [{{ activeSourceType }}](html5: {{ html5VideoSupport }})
      {{ activeSource }}
    </div>
    <div class="my-2" v-if="errors.length">
      <div
        v-for="error of errors"
        :key="error"
        class="text-red-500 dark:text-red-400 p-2"
      >
        {{ error }}
      </div>
    </div>
    <div
      class="my-2 col-span-2 flex flex-col gap-2 items-start"
      v-if="cmcdEnabled"
    >
      <a
        href="https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf"
        target="_blank"
      >
        CMCD
      </a>
      <span class="text-xs"
        >sid=<code>{{ cmcdSid }}</code></span
      >
      <span class="text-xs"
        >cid=<code>{{ cmcdCid }}</code></span
      >
    </div>
    <div class="my-2 col-span-2 flex gap-2 justify-end items-baseline">
      <span class="font-semibold">Viewport</span>
      <span class="text-xs"
        >{{ viewport.width }}&times;{{ viewport.height }}</span
      >
    </div>
    <div class="my-2 col-span-2 flex gap-2 justify-end items-baseline">
      <input
        v-model="newMediaSource"
        placeholder="Change media source"
        class="textfield"
      />
      <button @click="changeMediaSource" :disabled="!newMediaSource">
        Set
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import {
  Player,
  type PlaybackModule,
  type PlaybackType,
  type TelemetryPluginSettings,
} from '@gcorevideo/player'

import useStatsEndpoint from '~/composables/use-stats-endpoint'
import usePluginsConfig from '~/composables/use-plugins-config'
import useSettingsStore from '../store/settings'

import type { ExampleUIOptions } from './plugins/ExampleUI'

const playing = ref(false)
const paused = ref(false)
const ready = ref(false)
const starting = ref(false)
const stopped = ref(true)
const playback = ref<PlaybackModule | null>(null)
const hd = ref(false)
const bitrate = ref(0)
const width = ref(0)
const height = ref(0)
const playbackType = ref<PlaybackType | null>(null)
const showTime = computed(() => playing.value)
const newMediaSource = ref('')

const exampleUi = computed(() => settings.plugins.includes('example_ui'))

const cmcdEnabled = computed(() => settings.plugins.includes('cmcd'))

const currentTime = ref<number>(0)

const settings = useSettingsStore()

const noSource = computed(() => !settings.sources.length)

const showSource = ref(false)

const activeSource = ref<string | null>(null)

const activeSourceType = ref<string | null>(null)

const html5VideoSupport = computed(() => {
  if (!activeSourceType.value) {
    return '-'
  }
  const support = document
    .createElement('video')
    .canPlayType(activeSourceType.value)
  return support === '' ? 'no' : support
})

const errors = ref<string[]>([])

const cmcdSid = ref('')
const cmcdCid = ref('') // TODO get from the plugin

const viewport = ref<{ width: number; height: number }>({ width: 0, height: 0 })

const streamConfigUrl = computed(() => {
  if (settings.streamConfigUrl) {
    return settings.streamConfigUrl
  }
  if (!settings.sources.length) {
    return ''
  }
  const srcUrl = new URL(settings.sources[0])
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

const stats = useStatsEndpoint(streamConfigUrl)

usePluginsConfig()

const pluginOptions = computed(() => ({
  exampleUI: {
    activeSource,
    activeSourceType,
    bitrate,
    currentTime,
    errors,
    hd,
    height,
    paused,
    playback,
    playbackType,
    playing,
    ready,
    starting,
    stopped,
    width,
    cmcdSid,
    cmcdCid,
    viewport,
  } as ExampleUIOptions,
  telemetry: {
    send: (data) => {
      stats.send(data)
    },
  } as TelemetryPluginSettings,
}))

let player: Player | undefined

function play() {
  if (!player) {
    return
  }
  starting.value = true
  player.play()
}

function pause() {
  if (!player) {
    return
  }
  player.pause()
}

function stop() {
  if (!player) {
    return
  }
  player.stop()
}

function formatBitrate(val: number): string {
  if (val < 1000_000) {
    return `${(val / 1000).toFixed(0)}K`
  }
  return `${(val / 1000_000).toFixed(1)}M`
}

function formatQuality(width: number, height: number): string {
  return `${width}×${height}`
}

function formatTime(time: number): string {
  const date = new Date(time)
  return `${date.getUTCMinutes().toFixed(0).padStart(2, '0')}:${date
    .getUTCSeconds()
    .toFixed(0)
    .padStart(2, '0')}`
}

function formatPlaybackModule(module: PlaybackModule): string {
  switch (module) {
    case 'html5_video':
      return 'native'
    default:
      return module
  }
}

function changeMediaSource() {
  player?.load([newMediaSource.value])
  newMediaSource.value = ''
}
</script>

<style lang="css" scoped>
@reference '~/assets/css/main.css';

.settings {
  grid-auto-rows: minmax(1.5rem, auto);
  gap: 0.5rem 1rem;
}

.status {
  margin: 0.5rem 0;
}

.local-time {
  width: 4rem;
}

.no-source {
  margin-left: -40px;
  margin-top: -1rem;
}
</style>
