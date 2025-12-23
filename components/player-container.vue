<template>
  <div class="relative">
    <div class="video-container-wrap bg-black text-white relative" :class="{ 'full-page': fullPage }">
      <div ref="container" class="video-container absolute"></div>
    </div>
    <span class="absolute inset-1/2 text-white w-20 text-center text-sm no-source" v-if="noSource">Source not
      configured</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { $ } from '@clappr/core'
import {
  MediaControl,
  Player,
  type PlayerConfig,
  type TelemetryPluginSettings,
} from '@gcorevideo/player'

import useSettingsStore from '../store/settings'
import { SPEEDTEST_SERVERS } from '../constants'
import strings from '~/assets/strings.json'
import gcoreSvg from '~/assets/img/gcore_orange_001.svg'
import usePluginsConfig from '~/composables/use-plugins-config'
import type { PluginName } from '~/types'

const props = defineProps<{
  options?: Partial<PlayerConfig>
  excludePlugins?: PluginName[]
  fullPage?: boolean
}>()
const emit = defineEmits<{
  init: [Player]
}>()

const container = ref<HTMLDivElement | null>(null)
const settings = useSettingsStore()
const noSource = computed(() => !settings.sources.length)

const mediaControlSettings = MediaControl.extendSettings({
  left: ['dvr', 'clips'],
  right: ['*'],
})

const streamConfigUrl = useStreamConfig(settings)

const stats = useStatsEndpoint(streamConfigUrl)

const config = computed(() =>
  $.extend(
    true,
    {
      autoPlay: settings.autoplay,
      dash: $.extend(
        true,
        {
          streaming: {
            retryAttempts: {
              MPD: 10,
              IndexSegment: 10,
              InitializationSegment: 10,
            },
          },
        },
        settings.dash
      ),
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
        recycleVideo: !!settings.recycleVideo,
      },
      playbackType: settings.playbackType,
      priorityTransport: settings.priorityTransport,
      sources: settings.sources,
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
      mediaControl: mediaControlSettings,
      // hideMediaControlDelay: 3600000,
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
      playbackSettings: {
        restrictResolution: settings.restrictResolution,
      },
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
        // backdropHeight: settings.thumbnails.backdropHeight,
        backdropMinOpacity: 0.9,
        backdropMaxOpacity: 0.99,
        // spotlightHeight: settings.thumbnails.spotlightHeight || 100,
        spotlightHeight: 100,
        vtt: settings.thumbnails.vtt,
        sprite: settings.thumbnails.sprite,
      },
      strings,
      telemetry: {
        send: (data) => {
          stats.send(data)
        },
      } as TelemetryPluginSettings,
    },
    props.options
  )
)

let player: Player | undefined

let rob: ReturnType<typeof useResizeObserver> | undefined

usePluginsConfig(props.excludePlugins)

onMounted(() => {
  if (!settings.sources.length) {
    return
  }
  player = new Player(config.value)
  emit('init', player)

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
</script>

<style lang="css" scoped>
@reference '~/assets/css/main.css';

.video-container-wrap {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
}

.video-container-wrap.full-page {
  padding-bottom: 0;
  height: 100vh;
}

.video-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
