<template>
  <div class="settings">
    <div class="flex justify-end">
      <button @click="settings.reset()">Reset</button>
    </div>
    <div class="heading font-semibold mb-2"></div>
    <div class="label">Basic</div>
    <div class="mb-4">
      <div class="grid grid-cols-2 md:grid-cols-3">
        <label for="option_autoplay" class="sublabel">
          <input
            type="checkbox"
            id="option_autoplay"
            :checked="settings.autoplay"
            @change="e => settings.setAutoplay((e.target as HTMLInputElement)?.checked)"
            class="mr-2"
          />
          Autoplay
        </label>
        <label for="option_mute" class="sublabel">
          <input
            type="checkbox"
            id="option_mute"
            :checked="settings.mute"
            @change="e => settings.setMute((e.target as HTMLInputElement)?.checked)"
            class="mr-2"
          />
          Mute
        </label>
        <label for="option_loop" class="sublabel">
          <input
            type="checkbox"
            id="option_loop"
            :checked="settings.loop"
            @change="e => settings.setLoop((e.target as HTMLInputElement)?.checked)"
            class="mr-2"
          />
          Loop
        </label>
      </div>
    </div>
    <div class="label">UI</div>
    <plugin-settings class="block mb-4" />
    <div class="label">DASH</div>
    <dash-settings class="block mb-4" />
    <div class="mb-4 grid grid-cols-3">
      <div>
        <div class="label">CMCD</div>
        <div class="text-xs text-slate-600">
          read more
          <a
            href="https://dashif.org/dash.js/pages/usage/cmcd.html#common-media-client-data"
            target="_blank"
            >DASH.js</a
          >
          <a
            href="https://github.com/video-dev/hls.js/blob/master/docs/API.md#cmcd"
            target="_blank"
            >HLS.js</a
          >
        </div>
      </div>
      <div class="row col-span-2">
        <label for="dash_cmcd_enable">
          <input
            type="checkbox"
            id="dash_cmcd_enable"
            :checked="settings.cmcd.enabled"
            @change="toggleCmcd"
          />
          Enable
        </label>
      </div>
    </div>
    <clips-settings v-if="settings.plugins.includes('clips')" />
  </div>
</template>

<script lang="ts" setup>
import useSettingsStore from '../store/settings'

const settings = useSettingsStore()

function toggleCmcd() {
  settings.setCmcdEnabled(!settings.cmcd.enabled)
}
</script>
