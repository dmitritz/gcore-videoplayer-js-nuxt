<template>
  <nuxt-layout>
    <template #header>
      <reference-links>
        <a href="https://github.com/G-Core/gcore-videoplayer-js" target="_blank"
          >Player SDK documentation</a
        >
        <a
          href="https://dashif.org/dash.js/pages/usage/low-latency.html"
          target="_blank"
        >
          Low latency streaming with DASH
        </a>
        <a
          href="https://cdn.dashjs.org/latest/jsdoc/index.html"
          target="_blank"
        >
          DASH.js API documentation</a
        >
      </reference-links>
    </template>
    <div class="h-full px-2">
      <settings-block />
    </div>
  </nuxt-layout>
</template>
