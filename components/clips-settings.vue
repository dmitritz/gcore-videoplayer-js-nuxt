<template>
  <div class="mb-8 flex flex-col gap-2 pb-4 border-b border-slate-200">
    <div>
      <div class="flex gap-2 justify-between">
        <label for="clips_text" class="label text-lg">Clips</label>
        <span v-show="loaded" class="loaded"
          >Loaded</span
        >
        <button
          @click="saveClipsText"
          class="btn"
          :disabled="!changed || empty"
          v-show="!loaded"
        >
          Load
        </button>
      </div>
      <div class="text-sm" v-if="!settingsStore.plugins.includes('clips')">
        <exclamation-triangle-icon class="w-4 h-4 inline-block" />
        Enable <b>Clips</b> plugin on the
        <router-link to="settings">Settings</router-link> tab
      </div>
    </div>
    <div class="row flex flex-col gap-2 items-start">
      <textarea
        id="clips_text"
        v-model="clipsText"
        class="w-full rounded border border-slate-300 p-2"
        :class="{ 'changed': changed }"
        rows="10"
      />
      <div class="text-sm text-slate-500">
        Example:<br />
        <pre class="overflow-auto">
  00 Introduction
  01:30 Our sponsors
  31:30 Questions
  01:00:30 Conclusion
        </pre>
      </div>
      <!-- <div class="flex flex-row gap-2">
        <span v-show="loaded" class="px-2 py-2 text-sm text-slate-500"
          >Loaded</span
        >
        <button
          @click="saveClipsText"
          class="rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300"
          :disabled="!changed || empty"
          v-show="!loaded"
        >
          Load
        </button>
        <button
          @click="clear"
          class="rounded text-white disabled:bg-slate-300"
          :disabled="empty && !loaded"
        >
          Clear
        </button>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import useSettingsStore from '../store/settings'

const settingsStore = useSettingsStore()

const clipsText = ref(settingsStore.clips)

const changed = computed(
  () => clipsText.value.trim() !== settingsStore.clips.trim()
)
const empty = computed(() => clipsText.value.trim() === '')
const loaded = computed(() => !empty.value && !changed.value)

const saveClipsText = () => {
  // TODO persist
  settingsStore.setClipsText(clipsText.value)
}

function clear() {
  clipsText.value = ''
  settingsStore.setClipsText('')
}
</script>


<style scoped>
@reference '~/assets/css/main.css';
</style>