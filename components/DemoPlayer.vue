<template>
  <div class="demo-player">
    <div ref="container" class="video-container"></div>
  </div>
  <div class="settings controls my-1 px-2 items-baseline">
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
        {{ playback }}
      </button>
    </div>
    <div
      class="absolute p-4 rounded bg-white opacity-90 right-0 w-full overflow-x-scroll z-10 max-w-96"
      @click="showSource = false"
      v-if="showSource"
    >
      {{ activeSource }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'

import { Player, PlayerEvent } from '@gcorevideo/player'

import usePluginsConfig from '../composables/use-plugins-config'
import useSettingsStore from '../store/settings'
import { SPEEDTEST_SERVERS } from '../constants'

const container = ref<HTMLDivElement>()
const playing = ref(false)
const paused = ref(false)
const ready = ref(false)
const starting = ref(false)
const stopped = ref(true)
const playback = ref('')
const hd = ref(false)
const bitrate = ref(0)
const width = ref(0)
const height = ref(0)
const playbackType = ref('')
const showTime = computed(() => playing.value)

const currentTime = ref<Date>(new Date())

const settings = useSettingsStore()

const noSource = computed(() => !settings.multisources.length)

const showSource = ref(false)

const activeSource = ref<string | null>(null)

usePluginsConfig()

const config = computed(() => ({
  autoPlay: settings.autoplay,
  dash: settings.dash,
  debug: settings.debug,
  // poster: settings.multisources[0]?.poster || '',
  poster: 'https://static.gvideo.co/videoplatform/streams/2675/21960/screenshots/last.jpg',
  // 'https://static.gvideo.co/videoplatform/streams/2675/19146/screenshots/last.jpg',
  // TODO
  // realtimeApi: "wss://realtime-api.gvideo.co/ws/subscribe/message/2675_live_19146_0_GWxvgWFBHP3eEter8V9g",
  mute: settings.mute,
  width: '100%',
  height: '100%',
  // dash: {
  //   streaming: {
  //     lowLatencyEnabled: true,
  //     liveDelay: 3,
  //     abr: {
  //       initialBitrate: {
  //         video: 2000
  //       }
  //     }
  //   }
  // },
  // language: "en", // strings plugin
  loop: settings.loop,
  pluginSettings: {
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
    // disableClickOnPause: true, // vast_ads
    // disableMediaControl: true, // disable_controls, ...
    // embed: true, // share plugin
    // fullscreenDisable: true, // media_control
    levelSelector: {
      labels: {
        '2160': '4K',
        '1080': 'Full HD',
        '720': 'HD',
      },
    },
    // multicameraPlay: true, // multi_camera
    multisources: settings.multisources,
    multisourcesMode: 'show_all', // multi_camera
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
  },
  // multisources: settings.multisources,
  playbackType: settings.playbackType,
  priorityTransport: settings.priorityTransport,
  sources: settings.sources,
    // settings.multisources.length && settings.multisources[0].sourceDash
    //   ? [settings.multisources[0].sourceDash]
    //   : [],
  strings: { en: {} },
  // strings: JSON.parse(document.head.querySelector("[name=translations]").content),
}))

const player = new Player(config.value)

player.on(PlayerEvent.Ended, () => {
  playing.value = false
  paused.value = false
  starting.value = false
  stopped.value = true
})

let playbackMonitorTimerId: ReturnType<typeof setInterval> | null = null

player.on(PlayerEvent.Play, () => {
  playing.value = true
  paused.value = false
  stopped.value = false
  starting.value = false
  playback.value = player.activePlayback || ''
  playbackType.value = player.playbackType || ''
  if (playbackMonitorTimerId) {
    clearInterval(playbackMonitorTimerId)
  }
  playbackMonitorTimerId = setInterval(() => {
    hd.value = player.hd
    if (player.bitrate) {
      bitrate.value = player.bitrate.bitrate
      width.value = player.bitrate.width
      height.value = player.bitrate.height
    } else {
      bitrate.value = 0
      width.value = 0
      height.value = 0
    }
    activeSource.value = player.activeSource
  }, 1000)
})

player.on(PlayerEvent.Pause, () => {
  playing.value = false
  paused.value = true
})

player.on(PlayerEvent.Ready, () => {
  ready.value = true
})

player.on(PlayerEvent.Stop, () => {
  playing.value = false
  playback.value = ''
  playbackType.value = ''
  stopped.value = true
  hd.value = false
  bitrate.value = 0
  width.value = 0
  height.value = 0
  paused.value = false
  starting.value = false
  if (playbackMonitorTimerId) {
    clearInterval(playbackMonitorTimerId)
    playbackMonitorTimerId = null
  }
})

const rob = useResizeObserver(({ width, height }) => {
  player.resize({ width, height })
})

onMounted(() => {
  setTimeout(() => {
    if (!container.value) {
      return
    }
    player.init(container.value)
  }, 0)
  setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
  if (container.value) {
    rob.start(container.value)
  }
})

onBeforeMount(() => {
  rob.stop()
  player.destroy()
})

watch(config, (newConfig) => {
  player.configure(newConfig)
  if (container.value) {
    player.destroy()
    player.init(container.value)
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

function formatTime(date: Date): string {
  return `${date.getUTCMinutes().toFixed(0).padStart(2, '0')}:${date
    .getUTCSeconds()
    .toFixed(0)
    .padEnd(2, '0')}`
}
</script>

<style lang="css" scoped>
@tailwind components;

.video-container {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background-color: black;
  color: #fff;
}

.settings {
  display: grid;
  grid-template-columns: max-content auto;
  grid-auto-rows: minmax(1.5rem, auto);
  gap: 0.5rem 1rem;
}

.status {
  margin: 0.5rem 0;
}

.local-time {
  width: 4rem;
}
</style>
