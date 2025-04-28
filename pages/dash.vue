<template>
  <nuxt-layout>
    <template #header>
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
        DASH.js API documentation
      </a>
    </template>
    <div class="flex flex-col gap-4">
      <h2 class="font-semibold font-lg">DASH</h2>
      <dash-settings class="block mb-4" />
    </div>
  </nuxt-layout>
</template> 

<script setup></script>