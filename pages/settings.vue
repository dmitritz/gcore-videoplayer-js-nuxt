<template>
  <nuxt-layout>
    <template #header>
      <reference-links>
        <a href="https://github.com/G-Core/gcore-videoplayer-js" target="_blank"
          >Player SDK documentation</a
        >
        <a
          href="https://github.com/video-dev/hls.js/blob/88bba9442f6e1430151e3ae77b88963afbe2199b/docs/API.md#hlsjs-v1-api"
          target="_blank"
        >
          HLS.js API documentation</a
        >
      </reference-links>
    </template>
    <div class="h-full px-2">
      <settings-block />
    </div>
  </nuxt-layout>
</template>
