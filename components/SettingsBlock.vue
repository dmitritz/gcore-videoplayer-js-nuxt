<template>
  <div class="settings">
    <div class="heading font-semibold">Basic</div>
    <div class="grid grid-cols-2 md:grid-cols-3 mb-4">
      <label for="option_autoplay" class="text-bold">
        <input type="checkbox" id="option_autoplay" :checked="settings.autoplay"
          @change="e => settings.setAutoplay((e.target as HTMLInputElement)?.checked)"
          class="mr-2"
        >
        Autoplay
      </label>
      <label for="option_mute">
        <input type="checkbox" id="option_mute" :checked="settings.mute"
          @change="e => settings.setMute((e.target as HTMLInputElement)?.checked)"
          class="mr-2"
        >
        Mute
      </label>
      <label for="option_loop">
        <input type="checkbox" id="option_loop" :checked="settings.loop"
          @change="e => settings.setLoop((e.target as HTMLInputElement)?.checked)"
          class="mr-2"
        >
        Loop
      </label>
    </div>
    <div class="heading font-semibold">Priority transport</div>
    <div class="grid grid-cols-4 mb-4">
      <label v-for="t of TRANSPORTS" :key="t" :for="`priority_transport_${t}`">
        <input type="radio" :id="`priority_transport_${t}`" name="priority_transport" :value="t"
          :checked="settings.priorityTransport === t"
          @change="e => settings.setPriorityTransport((e.target as HTMLInputElement)?.value as TransportPreference)"
          class="mr-2"
        >
        {{ TRANSPORT_LABELS[t] }}
      </label>
    </div>
    <div class="font-semibold">UI</div>
    <plugin-settings class="block mb-4" />
    <div class="heading font-semibold"></div>
    <div class="buttons">
      <button @click="settings.reset()">Reset</button>
    </div>
  </div>
</template>

<script lang="ts" setup>

import type { TransportPreference } from "@gcorevideo/player";
import useSettingsStore from "../store/settings";

const TRANSPORTS = ['dash', 'hls', 'mpegts', 'auto']

type ElementType<T> = T extends (infer E)[] ? E : never
const TRANSPORT_LABELS: Record<ElementType<typeof TRANSPORTS>, string> = {
  'dash': 'DASH',
  'hls': 'HLS',
  'mpegts': 'No-LL',
  'auto': 'Auto',
}

const settings = useSettingsStore()
</script>
