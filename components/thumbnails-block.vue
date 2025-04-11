<template>
  <div class="flex flex-col gap-y-3 mb-4 gap-1">
    <div class="label">
      Thumbnails
      <span class="text-sm text-slate-500">
        also known as <i>Timeline hover previews</i>.
        <a
          href="https://gcore.com/docs/streaming-platform/video-hosting/timeline-hover-previews-use-in-players-and-roku-devices"
          target="_blank"
          >More on this</a
        >
      </span>
      <div class="text-sm" v-if="!settingsStore.plugins.includes('thumbnails')">
        <exclamation-triangle-icon class="w-4 h-4 inline-block" />
        Enable <b>Thumbnails</b> plugin on the
        <router-link to="settings">Settings</router-link> tab
      </div>
    </div>
    <div class="_">
      <label for="thumbnails_sprite_url" class="sublabel">Sprite URL</label>
    </div>
    <div class="mb-1">
      <input
        type="text"
        id="thumbnails_sprite_url"
        v-model="spriteURL"
        class="w-full rounded border border-slate-300 p-2"
      />
    </div>
    <div>
      <label for="thumbnails_sprite_vtt" class="sublabel">VTT</label>
    </div>
    <div class="mb-1">
      <textarea
        id="thumbnails_sprite_vtt"
        v-model="spriteVTT"
        class="w-full rounded border border-slate-300 p-2"
        :class="{ invalid: invalidVTT }"
        rows="10"
      />
    </div>
    <div class="flex flex-row gap-2 mb-2">
      <span v-show="loaded" class="loaded">Loaded</span>
      <button
        @click="saveSpriteVTT"
        :disabled="!changed || empty || invalidVTT"
        v-show="!loaded"
      >
        Load
      </button>
    </div>
    <div class="mb-1" v-if="invalidVTT">
      <div class="text-sm text-red-500 mb-2" v-show="invalidVTT">
        Invalid VTT. You probably have newline characters escaped inside your
        VTT. Unescape them and try again. Your VTT must consist of multiple
        lines, like this:
      </div>
      <pre v-show="invalidVTT" class="text-slate-500 text-sm overflow-auto">
1
00:00:00,000 --> 00:00:10,000
3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,0,100,56

2
00:00:10,000 --> 00:00:20,000
3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,0,100,56
...
      </pre>
      <div class="text-sm text-red-500 mb-2" v-show="invalidVTT">
        not like this:
      </div>
      <pre v-show="invalidVTT" class="text-slate-500 text-sm overflow-auto">
00:00:00,000 --> 00:00:10,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=0,0,100,56\n\n00:00:10,000 --> 00:00:20,000\n3dk4NsRt6vWsffEr_sprite.jpg#xywh=100,0,100,56\n</pre
      >
    </div>
    <div>
      <label for="thumbnails_backdrop_height" class="sublabel"
        >Backdrop height</label
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import useSettingsStore from '../store/settings'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
const settingsStore = useSettingsStore()

const spriteURL = ref(settingsStore.thumbnails.sprite)
const spriteVTT = ref(settingsStore.thumbnails.vtt)
// const backdropHeight = ref(settingsStore.thumbnails.backdropHeight)

const changed = computed(
  () =>
    spriteURL.value.trim() !== settingsStore.thumbnails.sprite.trim() ||
    spriteVTT.value.trim() !== settingsStore.thumbnails.vtt.trim()
)
const empty = computed(
  () => spriteURL.value.trim() === '' || spriteVTT.value.trim() === ''
)
const loaded = computed(() => !empty.value && !changed.value)
const invalidVTT = computed(
  () =>
    spriteVTT.value.trim() !== '' &&
    spriteVTT.value.split('\n').length === 1 &&
    spriteVTT.value.indexOf('\\n') !== -1
)

const saveSpriteVTT = () => {
  settingsStore.setThumbnailsURL(spriteURL.value)
  settingsStore.setThumbnailsVTT(spriteVTT.value)
  // settingsStore.setThumbnailsOptions({ backdropHeight: backdropHeight.value })
}
</script>

<style scoped>
@import 'tailwindcss';

textarea.invalid {
  @apply border-red-500;
}
</style>
