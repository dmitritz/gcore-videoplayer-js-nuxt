<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
    <plugin-item
      v-for="plugin of PLUGIN_NAMES"
      :key="plugin"
      :name="plugin"
      :disabled="disabledPlugins.includes(plugin)"
    >
      {{ PLUGIN_LABELS[plugin] }}
      <star-icon class="w-3 h-3" v-if="PLUGIN_OPTIONS[plugin]?.starred" />
    </plugin-item>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 mb-4">
    <div class="text-sm col-span-2 md:col-span-3">Some plugins depend on others, for instance:<br/>
      <b>Bottom gear</b> and <b>Picture in picture</b> both depend on <b>Media control</b>,<br/>
      <b>Nerd stats</b> depends on <b>Media control</b>, <b>Stats</b>, and <b>Bottom gear</b>,<br/>
      etc.<br/>
      See the <a href="https://github.com/G-Core/gcore-videoplayer-js/blob/main/packages/player/docs/api/index.md" target="_blank">documentation</a> for more details.
    </div>
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
import type { PluginName } from '../types'

const { disabledPlugins } = usePluginsDeps()

const PLUGIN_LABELS: Partial<Record<PluginName, string>> = {
  big_mute_button: 'Big mute button',
  click_to_pause: 'Click to pause',
  clappr_stats: 'Stats',
  disable_controls: 'Disable controls',
  error_screen: 'Error screen',
  example_ui: 'Example UI',
  media_control: 'Media control',
  media_control_audio_selector: 'Audio selector',
  media_control_nerd_stats: 'Stats for nerds',
  media_control_dvr: 'DVR controls',
  media_control_gear: 'Bottom gear',
  media_control_level_selector: 'Level selector',
  media_control_multicamera: 'Multi camera',
  media_control_pip: 'Picture in picture',
  media_control_playback_rate: 'Playback rate',
  media_control_subtitles: 'Subtitles',
  media_control_thumbnails: 'Thumbnails',
  // media_control_seek_time: 'Seek time',
  // media_control_share: 'Share',
  poster: 'Poster',
  spinner: 'Spinner',
  source_controller: 'Source controller',
  volume_fade: 'Volume fade',
}

const PLUGIN_NAMES = Object.keys(PLUGIN_LABELS) as PluginName[]

type PluginOptions = {
  underlined?: true
  starred?: true
}
const PLUGIN_OPTIONS: Partial<Record<PluginName, PluginOptions>> = {
  example_ui: {
    starred: true,
  },
}

const settings = useSettingsStore()

const levelSelectorPluginDisabled = computed(() => {
  return (
    !settings.plugins.includes('media_control_level_selector') ||
    disabledPlugins.value.includes('media_control_level_selector')
  )
})

const restrictResolution = ref(settings.restrictResolution)
watch(restrictResolution, () => {
  settings.setRestrictResolution(restrictResolution.value)
})
</script>
