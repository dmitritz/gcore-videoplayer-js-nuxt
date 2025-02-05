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
        :disabled="noSource"
      >
        Play
      </button>
      <button @click="pause" v-show="playing" class="playback">Pause</button>
      <button @click="stop" v-show="ready && !stopped" class="playback">
        Stop
      </button>
    </div>
    <div class="flex gap-2 items-center content-center justify-end flex-wrap">
      <span class="text-slate-600 text-sm" v-if="noSource">no source</span>
      <span class="text-xs sm:text-sm" v-if="width && height">{{
        formatQuality(width, height)
      }}</span>
      <span class="text-xs sm:text-sm" v-if="bitrate">{{
        formatBitrate(bitrate)
      }}</span>
      <span class="local-time text-xs sm:text-sm text-left" v-if="showTime">{{
        formatTime(currentTime)
      }}</span>
      <span class="font-semibold text-sm uppercase" v-if="playbackType">{{
        playbackType
      }}</span>
      <button
        class="font-semibold text-sm sm:text-md uppercase"
        v-if="playback"
        @click="showSource = !showSource"
      >
        {{ formatPlaybackModule(playback) }}
      </button>
    </div>
    <div
      class="absolute p-4 rounded bg-white opacity-90 right-0 w-full overflow-x-scroll z-10 max-w-96"
      @click="showSource = false"
      v-if="showSource"
    >
      [{{ activeSourceType }}](html5: {{ html5VideoSupport }}) {{ activeSource }}
    </div>
    <div class="my-2" v-if="errors.length">
      <div v-for="error of errors" :key="error" class="text-red-500 p-2">{{ error }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'

import {
  Player,
  type PlaybackModule,
  type PlaybackType,
} from '@gcorevideo/player'

import usePluginsConfig from '~/composables/use-plugins-config'
import useSettingsStore from '../store/settings'
import { SPEEDTEST_SERVERS } from '../constants'
import type { ExampleUIOptions } from '../components/plugins/ExampleUI'

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
  const support = document.createElement('video').canPlayType(activeSourceType.value)
  return support === '' ? 'no' : support
})

const errors = ref<string[]>([])

usePluginsConfig()

const config = computed(() => ({
  autoPlay: settings.autoplay,
  dash: settings.dash,
  debug: settings.debug,
  mute: settings.mute,
  width: '100%',
  height: '100%',
  // language: "en", // strings plugin
  loop: settings.loop,
  playbackType: settings.playbackType,
  priorityTransport: settings.priorityTransport,
  sources: settings.sources,
  strings: { en: {} },
  // Below go the plugin settings
  clapprNerdStats: {
    speedTestServers: SPEEDTEST_SERVERS,
  },
  // contextMenu: {
  //   label: '',
  //   preventShowContextMenu: true,
  //   url: '',
  // },
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
  } as ExampleUIOptions,
  // fullscreenDisable: true, // media_control
  levelSelector: {
    labels: {
      '2160': '4K',
      '1080': 'Full HD',
      '720': 'HD',
    },
  },
  multisourcesMode: 'show_all', // multi_camera
  poster: {
    // showForNoOp: true,
    url: settings.poster,
    showOnError: false,
  },
  spinner: {
    showOnError: true,
    showOnStart: true,
  },
  // shareURL: "https://gvideo.co", // share plugin
  subtitles: {
    language: 'en',
  },
  thumbnails: {
    backdropHeight: 200,
    backdropMinOpacity: 0.9,
    backdropMaxOpacity: 0.99,
    spotlightHeight: 100,
    vtt: '1\n00:00:00,000 --> 00:00:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,0,100,56\n\n2\n00:00:10,000 --> 00:00:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,0,100,56\n\n3\n00:00:20,000 --> 00:00:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=200,0,100,56\n\n4\n00:00:30,000 --> 00:00:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=300,0,100,56\n\n5\n00:00:40,000 --> 00:00:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=400,0,100,56\n\n6\n00:00:50,000 --> 00:01:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=500,0,100,56\n\n7\n00:01:00,000 --> 00:01:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=600,0,100,56\n\n8\n00:01:10,000 --> 00:01:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,56,100,56\n\n9\n00:01:20,000 --> 00:01:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,56,100,56\n\n10\n00:01:30,000 --> 00:01:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=200,56,100,56\n\n11\n00:01:40,000 --> 00:01:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=300,56,100,56\n\n12\n00:01:50,000 --> 00:02:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=400,56,100,56\n\n13\n00:02:00,000 --> 00:02:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=500,56,100,56\n\n14\n00:02:10,000 --> 00:02:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=600,56,100,56\n\n15\n00:02:20,000 --> 00:02:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,112,100,56\n\n16\n00:02:30,000 --> 00:02:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,112,100,56\n\n17\n00:02:40,000 --> 00:02:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=200,112,100,56\n\n18\n00:02:50,000 --> 00:03:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=300,112,100,56\n\n19\n00:03:00,000 --> 00:03:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=400,112,100,56\n\n20\n00:03:10,000 --> 00:03:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=500,112,100,56\n\n21\n00:03:20,000 --> 00:03:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=600,112,100,56\n\n22\n00:03:30,000 --> 00:03:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,168,100,56\n\n23\n00:03:40,000 --> 00:03:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,168,100,56\n\n24\n00:03:50,000 --> 00:04:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=200,168,100,56\n\n25\n00:04:00,000 --> 00:04:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=300,168,100,56\n\n26\n00:04:10,000 --> 00:04:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=400,168,100,56\n\n27\n00:04:20,000 --> 00:04:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=500,168,100,56\n\n28\n00:04:30,000 --> 00:04:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=600,168,100,56\n\n29\n00:04:40,000 --> 00:04:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,224,100,56\n\n30\n00:04:50,000 --> 00:05:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,224,100,56\n\n31\n00:05:00,000 --> 00:05:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=200,224,100,56\n\n32\n00:05:10,000 --> 00:05:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=300,224,100,56\n\n33\n00:05:20,000 --> 00:05:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=400,224,100,56\n\n34\n00:05:30,000 --> 00:05:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=500,224,100,56\n\n35\n00:05:40,000 --> 00:05:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=600,224,100,56\n\n36\n00:05:50,000 --> 00:06:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,280,100,56\n\n37\n00:06:00,000 --> 00:06:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,280,100,56\n\n38\n00:06:10,000 --> 00:06:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=200,280,100,56\n\n39\n00:06:20,000 --> 00:06:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=300,280,100,56\n\n40\n00:06:30,000 --> 00:06:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=400,280,100,56\n\n41\n00:06:40,000 --> 00:06:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=500,280,100,56\n\n42\n00:06:50,000 --> 00:07:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=600,280,100,56\n\n43\n00:07:00,000 --> 00:07:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,336,100,56\n\n44\n00:07:10,000 --> 00:07:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,336,100,56\n\n45\n00:07:20,000 --> 00:07:30,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=200,336,100,56\n\n46\n00:07:30,000 --> 00:07:40,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=300,336,100,56\n\n47\n00:07:40,000 --> 00:07:50,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=400,336,100,56\n\n48\n00:07:50,000 --> 00:08:00,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=500,336,100,56\n\n49\n00:08:00,000 --> 00:08:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=600,336,100,56\n',
    sprite:
      'https://static.gvideo.co/videoplatform/sprites/2675/2452164_3dk4NsRt6vWsffEr.mp4_sprite.jpg',
  },
  // strings: JSON.parse(document.head.querySelector("[name=translations]").content),
}))

const player = new Player(config.value)

const rob = useResizeObserver(({ width, height }) => {
  player.resize({ width, height })
})

onMounted(() => {
  if (!settings.sources.length) {
    return
  }
  setTimeout(() => {
    if (!container.value) {
      return
    }
    player.attachTo(container.value)
  }, 0)
  if (container.value) {
    rob.start(container.value)
  }
})

onBeforeMount(() => {
  rob.stop()
  player.destroy()
})

watch(config, (newConfig) => {
  if (!newConfig.sources.length) {
    return
  }
  player.configure(newConfig)
  if (container.value) {
    player.destroy()
    player.attachTo(container.value)
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
@import "tailwindcss";

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
