<template>
  <div class="flex items-center gap-2 my-2">
    <label for="token" class="font-medium">Max. bitrate, Kbps</label>
    <input
      type="number"
      id="token"
      :value="maxBitrate"
      class="rounded border p-1"
      @change="e => setMaxBitrate((e.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import useSettingsStore from '~/store/settings'

const settings = useSettingsStore()
const maxBitrate = computed(() => settings.dash.maxBitrate)

function setMaxBitrate(value: string) {
  settings.setDashSettings({
    maxBitrate: parseInt(value, 10),
  })
}
</script>
