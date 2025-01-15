<template>
  <nuxt-layout>
    <template #header>
      <reference-links>
        <a href="https://api.gcore.com/docs/streaming#section/Introduction" target="_blank">Streaming
          API reference</a>
        <a href="https://gcore.com/docs/streaming-platform/live-streaming/webrtc-to-hls-transcoding#webrtc-ingest-and-transcoding-to-hlsdash"
          target="_blank" title="GCore Streaming API WebRTC to HLS">WebRTC to HLS</a>
      </reference-links>
    </template>
    <div class="source-settings w-full">
      <div class="controls grid grid-cols-2 gap-2 gap-y-3 mb-4">
        <div>
          <label for="token" class="font-medium">Token</label>
        </div>
        <div>
          <input type="text" id="token" :value="token" @change="e => setToken((e.target as HTMLInputElement).value)" />
        </div>
        <div class="font-medium">
          Kind
        </div>
        <div class="flex gap-4">
          <label for="kind_stream">
            <input type="radio" name="kind" value="stream" @change="e => setStreamKind((e.target as HTMLInputElement).value)"
              :checked="kind === 'stream'"
              id="kind_stream" />
            Live stream
          </label>
          <label for="kind_video">
            <input type="radio" name="kind" value="video" @change="e => setStreamKind((e.target as HTMLInputElement).value)"
              :checked="kind === 'video'"
              id="kind_video" />
            Video
          </label>
        </div>
        <div>
          <label for="stream_id" class="font-medium">ID</label>
        </div>
        <div>
          <input type="text" id="stream_id" :value="streamId" @change="e => setStreamId((e.target as HTMLInputElement).value)" />
        </div>
        <div></div>
        <div class="flex gap-2">
          <button @click="fetchSource" :disabled="!streamId || !token || pending">Fetch</button>
          <button @click="clear">Clear</button>
        </div>
      </div>
      <div v-if="error" class="text-red-950">{{ error }}</div>
      <pre class="stream-inf" v-if="streamInfo">{{ JSON.stringify(streamInfo, null, 2) }}</pre>
    </div>
  </nuxt-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import useSettingsStore from '../store/settings';
import { fetchStream } from '../utils/fetch-stream';
import type { StreamDto, StreamKind } from '../types';

const streamId = computed(() => settings.streamId);

const token = computed(() => settings.apiToken)

const error = ref('');

const pending = ref(false);

const kind = computed<StreamKind>(() => settings.streamKind);

const settings = useSettingsStore();

const streamInfo = computed<StreamDto | null>(() => settings.streamDto);

function fetchSource() {
  pending.value = true;
  error.value = '';
  if (!token.value || !streamId.value) {
    return;
  }
  fetchStream(token.value, streamId.value, kind.value)
    .then(s => settings.setStreamDto(s, kind.value))
    .catch(e => {
      error.value = String(e);
    })
    .finally(() => {
      pending.value = false;
    })
}

function clear() {
  settings.setStreamDto(null, kind.value);
  setToken('');
  setStreamKind('stream');
  setStreamId('');
  error.value = '';
}

function setToken(value: string) {
  settings.setApiToken(value)
}

function setStreamKind(value: string) {
  settings.setStreamKind(value as StreamKind);
}

function setStreamId(value: string) {
  settings.setStreamId(Number(value))
}
</script>

<style lang="css" scoped>
@tailwind components;

.controls {
  display: grid;
  grid-auto-rows: auto;
  grid-template-columns: max-content auto;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;
  ;
}

pre {
  word-wrap: break-word;
  overflow-y: auto;
  max-height: var(--content-height);
}

input[type="text"] {
  @apply px-4 py-1 border border-slate-300;
}

@media (min-width: 1024px) {
  .source-settings {
    --form-height: 150px;
  }

  pre {
    max-height: calc(var(--content-height) - var(--form-height));
  }
}
</style>
