<template>
  <div class="mb-4 grid grid-cols-3">
    <label for="clips_text" class="label">Clips</label>
    <div class="row col-span-2 flex flex-col gap-2 items-start">
      <textarea
        id="clips_text"
        v-model="clipsText"
        class="w-full rounded border border-slate-300 p-2"
        rows="10"
        placeholder="[[00:]00:]00 text, one per line"
      />
      <div class="flex flex-row gap-2">
        <span v-show="loaded" class="text-sm text-slate-500">Loaded</span>
        <button
          @click="saveClipsText"
          class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-slate-300"
          :disabled="!changed || empty"
          v-show="!loaded"
        >
          Load
        </button>
      </div>
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
  settingsStore.setClipsText(clipsText.value)
}
</script>
