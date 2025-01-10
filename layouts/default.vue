<script setup lang="ts">
import { version } from "@gcorevideo/player";
// TODO
// import pkg from "../package.json" with { "type": "json" };

const pkg = {
  version: "1.2.3",
};

const ver = version();

const route = useRoute()
const query = route.query
</script>

<template>
  <NuxtRouteAnnouncer />
  <div class="flex flex-col md:grid md:grid-cols-2 h-screen md:grid-rows-2 md:py-4">
    <header class="w-full py-2 md:py-8 px-2 flex flex-wrap md:flex-col md:flex-nowrap gap-2">
      <div class="flex basis-1/4 items-center gap-4 md:basis-auto">
        <img src="~/assets/img/gcore_orange_001.svg" alt="Gcore logo" class="logo" width="40" height="40" />
        <div class="text-lg invisible md:visible">Gcore video player</div>
      </div>
      <nav class="flex gap-2 basis-1/2 md:justify-center md:items-start md:basis-auto">
        <router-link :to="{ path: '/', query }" id="nav_home" class="r">Home</router-link>
        <router-link :to="{
          path: '/settings',
          query,
        }" id="nav_settings">Settings</router-link>
        <router-link :to="{ path: '/source', query }" id="nav_source">Source</router-link>
      </nav>
      <slot name="header"></slot>
    </header>
    <main class="basis-full md:pt-1 px-2 w-full md:h-full">
      <slot></slot>
    </main>
    <footer class="w-full mt-8 mb-4 mx-auto basis-auto md:col-span-2 flex md:items-end justify-between gap-4 px-2 items-center">
      <div class="m:w-6 flex justify-evenly gap-4">
        <a href="https://dashjs.org" target="_blank" rel="noopener noreferrer" title="DASH.js">
          DASH.js
        </a>
        <a href="https://hlsjs.video-dev.org/demo/" target="_blank" rel="noopener noreferrer" title="HLS.js">
          HLS.js
        </a>
      </div>
      <div class="text-end text-slate-700 text-sm">
        <p>
          {{ pkg.version }}/gplayer {{ ver.gplayer }}/clappr {{ ver.clappr }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@tailwind components;

:root {
  --footer-height: 30px;
}

header,
header .wrapper {
  align-items: center;
  place-items: center;
}

header .wrapper {
  display: flex;
  gap: 0.5rem;
}

h1 {
  text-align: center;
}

.logo {
  display: block;
}

nav a.router-link-exact-active {
  /* color: var(--color-text); */
  @apply text-slate-600;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  @apply text-orange-600;
}

nav a:first-of-type {
  border: 0;
}

main {
  flex: 100% 1 1;
}

footer a {
  @apply text-orange-600;
}

footer .version {
  font-size: 0.8rem;
}

footer b {
  font-weight: 600;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  h1 {
    text-align: left;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start center;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
  }

  main {
    min-height: calc(var(--view-height) - var(--footer-height));
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>