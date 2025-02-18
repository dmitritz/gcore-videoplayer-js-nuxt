<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
    <plugin-item v-for="plugin of PLUGIN_NAMES" :key="plugin" :name="plugin">
      {{ PLUGIN_LABELS[plugin] }}
      <star-icon class="w-3 h-3" v-if="PLUGIN_OPTIONS[plugin]?.starred" />
    </plugin-item>
  </div>
  <div class="my-2 grid grid-cols-2 md:grid-cols-3 gap-2">
    <div class="label">Quality level restriction</div>
    <div class="flex gap-2 md:col-span-2">
      <label for="option_restrict_quality_level_0">
        <input
          type="radio"
          id="option_restrict_quality_level_0"
          value="0"
          :checked="restrictResolution === 0"
          @change="e => restrictResolution = parseInt((e.target as HTMLInputElement).value, 10)"
          :disabled="levelSelectorPluginDisabled"
        />
        Off
      </label>
      <label for="option_restrict_quality_level_360">
        <input
          type="radio"
          id="option_restrict_quality_level_360"
          value="360"
          :checked="restrictResolution === 360"
          @change="e => restrictResolution = parseInt((e.target as HTMLInputElement).value, 10)"
          :disabled="levelSelectorPluginDisabled"
        />
        360
      </label>
      <label for="option_restrict_quality_level_720">
        <input
          type="radio"
          id="option_restrict_quality_level_720"
          value="720"
          :checked="restrictResolution === 720"
          @change="e => restrictResolution = parseInt((e.target as HTMLInputElement).value, 10)"
          :disabled="levelSelectorPluginDisabled"
        />
        720
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { StarIcon } from '@heroicons/vue/24/outline'

import useSettingsStore from '../store/settings'

const PLUGIN_LABELS: Record<string, string> = {
  big_mute_button: 'Big mute button',
  bottom_gear: 'Bottom gear',
  click_to_pause: 'Click to pause',
  clappr_nerd_stats: 'Stats for nerds',
  clappr_stats: 'Stats',
  disable_controls: 'Disable controls',
  dvr_controls: 'DVR controls',
  error_screen: 'Error screen',
  example_ui: 'Example UI',
  level_selector: 'Level selector',
  media_control: 'Media control',
  multi_camera: 'Multi camera',
  picture_in_picture: 'Picture in picture',
  playback_rate: 'Playback rate',
  poster: 'Poster',
  spinner: 'Spinner',
  source_controller: 'Source controller',
  subtitles: 'Subtitles',
  thumbnails: 'Thumbnails',
  volume_fade: 'Volume fade',
}

const PLUGIN_NAMES = Object.keys(PLUGIN_LABELS)

type PluginOptions = {
  underlined?: true
  starred?: true
}
const PLUGIN_OPTIONS: Partial<
  Record<(typeof PLUGIN_NAMES)[number], PluginOptions>
> = {
  example_ui: {
    starred: true,
  },
}

const settings = useSettingsStore()

const levelSelectorPluginDisabled = computed(() => {
  return !settings.plugins.includes('level_selector')
})

const restrictResolution = ref(settings.restrictResolution)
watch(restrictResolution, () => {
  settings.setRestrictResolution(restrictResolution.value)
})
</script>
