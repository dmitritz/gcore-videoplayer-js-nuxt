<template>
  <div class="flex items-center gap-2 my-2">
    <label for="dash_max_bitrate" class="font-medium">Max. bitrate</label>
    <input
      type="number"
      id="dash_max_bitrate"
      :value="maxBitrate"
      class="rounded border p-1 w-20"
      @change="e => setMaxBitrate((e.target as HTMLInputElement).value)"
    />
    <div class="text-xs text-slate-600 flex items-center gap-1">
      Kbps
      <button @click="setSdMaxBitrate" :class="{'border-orange-300': isSd, 'text-orange-300': isSd}">SD</button>
      <button @click="setHdMaxBitrate" :class="{'border-orange-300': isHd, 'text-orange-300': isHd}">HD</button>
      <button @click="resetMaxBitrate" :class="{'border-orange-300': isAuto, 'text-orange-300': isAuto}">auto</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import useSettingsStore from '~/store/settings'

const settings = useSettingsStore()
const maxBitrate = computed(() => settings.dash.maxBitrate)
const isAuto = computed(() => maxBitrate.value === -1)
const isSd = computed(() => maxBitrate.value === 500)
const isHd = computed(() => maxBitrate.value === 2000)

function setMaxBitrate(value: string) {
  settings.setDashSettings({
    maxBitrate: parseInt(value, 10),
  })
}

function resetMaxBitrate() {
  settings.setDashSettings({
    maxBitrate: -1,
  })
}

function setHdMaxBitrate() {
  settings.setDashSettings({
    maxBitrate: 2000,
  })
}

function setSdMaxBitrate() {
  settings.setDashSettings({
    maxBitrate: 500,
  })
}
</script>
