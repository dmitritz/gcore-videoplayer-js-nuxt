<template>
  <label :for="`plugin_${props.name}`" class="flex items-center gap-1">
    <input type="checkbox" :id="`plugin_${props.name}`" :checked="checked" @change="togglePlugin" class="mr-2" />
    <slot></slot>
  </label>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import useSettingsStore from "../store/settings";

const props = defineProps<{
  name: string;
}>()

const store = useSettingsStore()

const checked = computed(() => store.plugins.includes(props.name))

const togglePlugin = () => {
  if (checked.value) {
    store.removePlugin(props.name)
  } else {
    store.addPlugin(props.name)
  }
}
</script>
