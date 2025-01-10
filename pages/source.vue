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
          <input type="text" id="token" v-model="token" />
        </div>
        <div class="font-medium">
          Kind
        </div>
        <div class="flex gap-2">
          <label for="kind_stream">
            <input type="radio" name="kind" value="stream" v-model="kind" id="kind_stream" />
            Live stream
          </label>
          <label for="kind_video">
            <input type="radio" name="kind" value="video" v-model="kind" id="kind_video" />
            Video
          </label>
        </div>
        <div>
          <label for="stream_id" class="font-medium">ID</label>
        </div>
        <div>
          <input type="text" id="stream_id" v-model="streamId" />
        </div>
        <div></div>
        <div class="flex gap-2">
          <button @click="fetchItem" :disabled="!resourceUrl || !token || pending">Fetch</button>
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
import type { StreamSource } from '../store/settings';
import usePersistence from '../composables/use-persistence';

console.log('sources.vue client:%s', import.meta.client);

const API_URL = 'https://api.gcore.com/streaming';

const streamId = ref(0);

const token = ref('')

const streamInfo = ref<Record<string, unknown> | null>(null);

const error = ref('');

const pending = ref(false);

type StreamKind = 'stream' | 'video';

const kind = ref<StreamKind>('stream');

const resourceUrl = computed(() => {
  return streamId.value ? `${API_URL}/${kind.value}s/${streamId.value}` : '';
});

const settings = useSettingsStore();

const persistedId = usePersistence('source.streamId', String, Number, 0);
const id = <T = string>(a: string) => (a as T);
const persistedToken = usePersistence('source.token', id, id, '');
const persistKind = usePersistence<StreamKind>('source.kind', id, id, 'stream');

watch(streamId, (val) => {
  if (val) {
    persistedId.set(val)
  }
});

watch(token, (val) => {
  if (val) {
    persistedToken.set(val);
  }
})

watch(kind, (val) => {
  persistKind.set(val);
})

watch(streamInfo, (val) => {
  if (val) {
    settings.setStreamSource(parseStreamDto(val, kind.value));
  }
})

onMounted(() => {
  streamId.value = persistedId.get() as number;
  token.value = persistedToken.get() as string;
  kind.value = persistKind.get();
});

function setStreamInfo(si: Record<string, unknown>, sk: StreamKind) {
  streamInfo.value = si;
  settings.setStreamSource(parseStreamDto(si, sk));
}

function parseStreamDto(data: Record<string, unknown>, sk: StreamKind): StreamSource {
  return {
    master: (data.uri || data.hls_url) as string,
    dash: data.dash_url as string,
    hlsCmaf: data.hls_cmaf_url as string,
    hlsMpegts: data.hls_mpegts_url as string,
    poster: (data.screenshot || data.poster) as string,
  };
}

function fetchItem() {
  pending.value = true;
  error.value = '';
  console.log("fetchItem", resourceUrl.value, token.value);

  fetch(resourceUrl.value, {
    headers: {
      authorization: `APIKey ${token.value}`
    },
    mode: 'cors',
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    return res.json()
  })
    .then((data) => {
      setStreamInfo(data, kind.value);
    })
    .catch(e => {
      error.value = String(e);
    })
    .finally(() => {
      pending.value = false;
    })
}

function clear() {
  streamInfo.value = null;
  token.value = '';
  streamId.value = 0;
  error.value = '';
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
}

input[type="text"] {
  @apply px-4 py-1 border border-slate-300;
}
</style>