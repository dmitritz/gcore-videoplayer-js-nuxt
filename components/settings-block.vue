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
        <label for="option_recycle_video" class="sublabel">
          <input
            type="checkbox"
            id="option_recycle_video"
            :checked="settings.recycleVideo"
            @change="e => settings.setRecycleVideo((e.target as HTMLInputElement)?.checked)"
            class="mr-2"
          />
          Recycle video
        </label>
      </div>
    </div>
    <div class="label">UI</div>
    <plugin-settings class="block mb-4" />
  </div>
</template>

<script lang="ts" setup>
import useSettingsStore from '../store/settings'

const settings = useSettingsStore()
</script>
