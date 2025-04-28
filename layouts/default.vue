<script setup lang="ts">
import { reportError, version } from '@gcorevideo/player'
import copy from 'copy-to-clipboard'
import {
  BugAntIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/16/solid'
import { ClipboardIcon } from '@heroicons/vue/24/outline'

import pkg from '../package.json'

import useSettingsStore from '~/store/settings'

const ver = version()

const route = useRoute()
const query = route.query
const reported = ref(false)
const settings = useSettingsStore()
const noSource = computed(() => !settings.sources.length)
const showVisitorId = ref(false)

function report() {
  reported.value = true
  if (settings.visitorId) {
    showVisitorId.value = true
  }
  reportError(new Error('User error report'))
  setTimeout(() => {
    reported.value = false
  }, 1000)
}

function copyVisitorId() {
  copy(settings.visitorId)
  showVisitorId.value = false
}
</script>

<template>
  <NuxtRouteAnnouncer />
  <div
    class="flex flex-col md:grid md:grid-cols-2 h-screen xmd:grid-rows-2 md:py-4 g-container"
  >
    <header
      class="w-full py-2 md:py-8 px-2 flex flex-wrap md:flex-col md:flex-nowrap gap-2 md:gap-4"
    >
      <div class="flex basis-auto items-center gap-4 w-full pl-5">
        <img
          src="~/assets/img/gcore_orange_001.svg"
          alt="Gcore logo"
          class="logo"
          width="40"
          height="40"
        />
        <div class="text-lg hidden md:block">Gcore video player</div>
        <player-link />
        <button
          class="rounded border text-sm inline-flex border-red-300 justify-self-end relative"
          @click="report"
          :disabled="reported"
          title="Report a bug"
        >
          <bug-ant-icon class="w-4 h-4 text-red-500" v-if="!reported" />
          <check-icon class="w-4 h-4 text-red-500" title="Reported" v-else />
          <div
            class="absolute p-2 top-8 left-0 rounded border bg-white text-xs"
            v-if="showVisitorId"
            @click.stop="copyVisitorId"
          >
            <div class="flex gap-2 items-center">
              <clipboard-icon class="w-4 h-4 text-slate-600" />
              <code>{{ settings.visitorId }}</code>
            </div>
            tell this ID to the support
          </div>
        </button>
      </div>
      <nav
        class="flex gap-2 basis-1/2 md:justify-start md:items-start md:basis-auto w-full"
      >
        <router-link :to="{ path: '/', query }" id="nav_home" class="r"
          >Home</router-link
        >
        <router-link
          :to="{
            path: '/settings',
            query,
          }"
          id="nav_settings"
          >Settings</router-link
        >
        <router-link :to="{ path: '/source', query }" id="nav_source">
          Source
          <exclamation-circle-icon
            v-if="noSource"
            class="w-3 h-3 inline align-baseline"
          />
        </router-link>
        <transition name="fade">
          <router-link :to="{ path: '/dash', query }" id="nav_dash" v-if="settings.godMode">
            DASH
          </router-link>
        </transition>
      </nav>
      <slot name="header"></slot>
    </header>
    <main class="basis-full md:pt-1 md:px-2 w-full md:h-full">
      <slot></slot>
    </main>
    <footer
      class="w-full py-2 mx-auto basis-auto md:col-span-2 flex md:items-end justify-end gap-4 px-2 items-center"
    >
      <div class="text-end text-slate-700 dark:text-slate-300 text-sm">
        <p>
          {{ pkg.version }}/{{ ver.gplayer }}/<a
            href="https://clappr.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            class="p-0"
            >clappr</a
          >
          {{ ver.clappr }}/<a
            href="https://dashjs.org"
            target="_blank"
            rel="noopener noreferrer"
            class="p-0"
            >dash.js</a
          >
          {{ ver.dashjs }}/<a
            href="https://hlsjs.video-dev.org/demo/"
            target="_blank"
            rel="noopener noreferrer"
            class="p-0"
            >hls.js</a
          >
          {{ ver.hlsjs }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import '~/assets/css/main.css';

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
  @apply text-slate-600 dark:text-slate-300;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  @apply text-orange-600 dark:text-orange-400;
}

nav a:first-of-type {
  border: 0;
}

main {
  flex: 100% 1 1;
}

footer a {
  @apply text-orange-600 dark:text-orange-400;
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
    min-height: var(--content-height);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .g-container {
    grid-template-rows: max-content var(--footer-height);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition-delay: 0.1s;
  transition-duration: 0.5s;
  transition-property: opacity background-color;
  transition-timing-function: ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

a.fade-enter-to {
  @apply bg-orange-500 text-white;
}
</style>
