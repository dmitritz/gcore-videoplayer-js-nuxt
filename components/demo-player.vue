<template>
  <div class="demo-player relative">
    <div ref="container" class="video-container"></div>
    <span
      class="absolute inset-1/2 text-white w-20 text-center text-sm no-source"
      v-if="noSource"
      >Source not configured</span
    >
  </div>
  <div class="settings grid grid-cols-2 my-1 mb-2 px-2 items-baseline">
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
    <div class="my-2 col-span-2 flex flex-col gap-2 items-start" v-if="cmcdEnabled">
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
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { $ } from '@clappr/core'
import {
  Player,
  type PlaybackModule,
  type PlaybackType,
} from '@gcorevideo/player'

import usePluginsConfig from '~/composables/use-plugins-config'
import useSettingsStore from '../store/settings'
import { SPEEDTEST_SERVERS } from '../constants'
import type { ExampleUIOptions } from './plugins/ExampleUI'
import strings from '~/assets/strings.json'
import gcoreSvg from '~/assets/img/gcore_orange_001.svg'

// const T = 'app.demo-player'

const container = ref<HTMLDivElement>()
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

usePluginsConfig()

const config = computed(() => ({
  autoPlay: settings.autoplay,
  dash: $.extend(true, {}, settings.dash),
  debug: settings.debug,
  mute: settings.mute,
  width: '100%',
  height: '100%',
  // language: "en", // strings plugin
  loop: settings.loop,
  playback: {
    hlsjsConfig: {
      lowLatencyMode: true,
    },
  },
  playbackType: settings.playbackType,
  priorityTransport: settings.priorityTransport,
  sources: settings.sources,
  // Below go the plugin settings
  clapprNerdStats: {
    speedTestServers: SPEEDTEST_SERVERS,
  },
  clips: {
    text: settings.clips,
  },
  contextMenu: {
    options: [
      {
        // label: 'Join us',
        labelKey: 'joinus',
        icon: `<img src="${gcoreSvg}" />`,
        name: 'joinus',
        handler() {
          window.open('https://gcore.com/', '_blank')
        },
      },
    ],
  },
  design: {
    // media_control
    background_color: 'rgba(0,0,0,1.0)',
    foreground_color: 'rgba(255,255,255,1)',
    hover_color: 'rgba(239,144,71,1)',
    text_color: 'rgba(255,255,255,1)',
  },
  errorScreen: {
    reloadOnError: false,
  },
  // disableClickOnPause: true, // vast_ads
  // disableMediaControl: true, // disable_controls, ...
  // embed: true, // share plugin
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
  } as ExampleUIOptions,
  faviconColor: '#000',
  // fullscreenDisable: true, // media_control
  levelSelector: {
    labels: {
      '2160': '4K',
      '1080': 'Full HD',
      '720': 'HD',
    },
    restrictResolution: settings.restrictResolution,
  },
  multisourcesMode: 'show_all', // multi_camera
  poster: {
    url: settings.poster,
    showOnError: false,
  },
  spinner: {
    // showOnError: true,
    showOnError: false,
    // showOnStart: true,
  },
  // shareURL: "https://gvideo.co", // share plugin
  subtitles: {
    language: 'en',
    // language: 'zh',
  },
  thumbnails: {
    backdropHeight: settings.thumbnails.backdropHeight,
    backdropMinOpacity: 0.9,
    backdropMaxOpacity: 0.99,
    spotlightHeight: settings.thumbnails.spotlightHeight || 100,
    vtt: settings.thumbnails.vtt,
    sprite: settings.thumbnails.sprite,
  },
  strings,
}))

let player: Player | undefined

let rob: ReturnType<typeof useResizeObserver> | undefined

onMounted(() => {
  if (!settings.sources.length) {
    return
  }
  player = new Player(config.value)

  rob = useResizeObserver(({ width, height }) => {
    player?.resize({ width, height })
  })
  setTimeout(() => {
    if (!container.value) {
      return
    }
    player?.destroy()
    player?.attachTo(container.value)
    rob?.start(container.value)
  }, 0)
})

onBeforeUnmount(() => {
  rob?.stop()
  player?.destroy()
})

watch(config, (newConfig) => {
  if (!newConfig.sources.length) {
    return
  }
  player?.configure(newConfig)
  if (container.value) {
    player?.destroy()
    player?.attachTo(container.value)
  }
})

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
</script>

<style lang="css" scoped>
@import 'tailwindcss';

.video-container {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background-color: black;
  color: #fff;
}

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
