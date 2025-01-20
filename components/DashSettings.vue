<template>
  <div class="grid content-center items-center gap-2 my-2 grid-cols-3">
    <!-- <div class="col-span-full font-medium">
    </div> -->
    <label for="dash_max_bitrate" class="text-slate-600 font-medium"
      >Max bitrate</label
    >
    <div class="flex items-center gap-1">
      <input
        type="number"
        id="dash_max_bitrate"
        :value="maxBitrate"
        class="rounded border p-1 w-20"
        @change="e => setMaxBitrate((e.target as HTMLInputElement).value)"
      />
      <span class="text-xs text-slate-600">Kbps</span>
    </div>
    <div class="text-xs text-slate-600 flex items-center gap-1">
      <button
        @click="setSdMaxBitrate"
        :class="{ 'border-orange-300': mbrISd, 'text-orange-300': mbrISd }"
      >
        SD
      </button>
      <button
        @click="setHdMaxBitrate"
        :class="{ 'border-orange-300': mbrIsHd, 'text-orange-300': mbrIsHd }"
      >
        HD
      </button>
      <button
        @click="resetMaxBitrate"
        :class="{
          'border-orange-300': mbrIsAuto,
          'text-orange-300': mbrIsAuto,
        }"
      >
        auto
      </button>
    </div>
    <label for="dash_target_latency" class="text-slate-600 font-medium"
      >Target latency</label
    >
    <div class="flex items-center gap-1">
      <input
        type="number"
        id="dash_target_latency"
        :value="targetLatency"
        step="0.1"
        class="rounded border p-1 w-20"
        @change="e => setTargetLatency((e.target as HTMLInputElement).value)"
      />
      <span class="text-xs text-slate-600">sec</span>
    </div>
    <div class="text-xs text-slate-600 flex items-center gap-1">
      <button
        @click="resetTargetLatency"
        :class="{
          'border-orange-300': targetLatencyIsAuto,
          'text-orange-300': targetLatencyIsAuto,
        }"
        title="From manifest"
      >
        auto
      </button>
    </div>
    <div class="col-span-full font-medium">Live catchup</div>
    <label for="dash_max_drift" class="text-slate-600 font-medium">
      Max drift
    </label>
    <div class="flex items-center gap-1">
      <input
        type="number"
        id="dash_max_drift"
        :value="maxDrift"
        step="0.1"
        class="rounded border p-1 w-20"
        @change="e => setMaxDrift((e.target as HTMLInputElement).value)"
      />
      <span class="text-xs text-slate-600"> sec </span>
    </div>
    <div class="text-xs text-slate-600 flex items-center gap-1">
      <button
        @click="resetMaxDrift"
        :class="{
          'border-orange-300': maxDriftIsAuto,
          'text-orange-300': maxDriftIsAuto,
        }"
      >
        auto
      </button>
    </div>
    <label for="dash_playback_rate_max" class="text-slate-600 font-medium">
      Playback rate max
    </label>
    <div class="flex items-center gap-1">
      <input
        type="number"
        id="dash_playback_rate_max"
        :value="playbackRateMax"
        step="0.1"
        min="0"
        max="1"
        class="rounded border p-1 w-20"
        @change="e => setPlaybackRateMax((e.target as HTMLInputElement).value)"
      />
      <span class="text-xs text-slate-600"> 0..1.0, 0.5=50% </span>
    </div>
    <div class="text-xs text-slate-600 flex items-center gap-1">
      <button
        @click="resetPlaybackRateMax"
        :class="{
          'border-orange-300': playbackRateMaxIsAuto,
          'text-orange-300': playbackRateMaxIsAuto,
        }"
      >
        auto
      </button>
    </div>
    <label for="dash_playback_rate_min" class="text-slate-600 font-medium">
      Playback rate min
    </label>
    <div class="flex items-center gap-1">
      <input
        type="number"
        id="dash_playback_rate_min"
        :value="playbackRateMin"
        step="0.1"
        min="-0.5"
        max="0"
        class="rounded border p-1 w-20"
        @change="e => setPlaybackRateMin((e.target as HTMLInputElement).value)"
      />
      <span class="text-xs text-slate-600"> -0.5..0 </span>
    </div>
    <div class="text-xs text-slate-600 flex items-center gap-1">
      <button
        @click="resetPlaybackRateMin"
        :class="{
          'border-orange-300': playbackRateMinIsAuto,
          'text-orange-300': playbackRateMinIsAuto,
        }"
      >
        auto
      </button>
    </div>
    <div class="text-slate-600 font-medium">ABR rules</div>
    <div class="col-start-2 col-end-4 grid grid-cols-2 md:grid-cols-3 gap-1">
      <label
        v-for="rule of ABR_RULES"
        :key="rule"
        :for="`dash_rule_${rule}`"
        class="flex items-center gap-1 text-xs"
      >
        <input
          type="checkbox"
          :id="`dash_rule_${rule}`"
          :value="rule"
          :checked="abrRules.includes(rule)"
          @change="e => toggleRule(rule, (e.target as HTMLInputElement).checked)"
        />
        {{ RULE_LABELS[rule] }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import useSettingsStore from '~/store/settings'

const settings = useSettingsStore()
const maxBitrate = computed(() => settings.dash.streaming?.abr?.maxBitrate)
const mbrIsAuto = computed(() => maxBitrate.value === -1)
const mbrISd = computed(() => maxBitrate.value === 500)
const mbrIsHd = computed(() => maxBitrate.value === 2000)

const maxDrift = computed(() => settings.dash.streaming?.liveCatchup?.maxDrift)
// @ts-ignore TODO fix the types
const maxDriftIsAuto = computed(() => isNaN(maxDrift.value))

const playbackRateMax = computed(
  () => settings.dash.streaming?.liveCatchup?.playbackRate?.max
)
const playbackRateMaxIsAuto = computed(() =>
  // @ts-ignore TODO fix the types
  isNaN(settings.dash.streaming?.liveCatchup?.playbackRate?.max)
)

const playbackRateMin = computed(
  () => settings.dash.streaming?.liveCatchup?.playbackRate?.min
)
const playbackRateMinIsAuto = computed(() =>
  // @ts-ignore TODO fix the types
  isNaN(settings.dash.streaming?.liveCatchup?.playbackRate?.min)
)

const targetLatency = computed(() => settings.dash.streaming?.delay?.liveDelay)
// @ts-ignore TODO fix the types
const targetLatencyIsAuto = computed(() => isNaN(targetLatency.value))

const ABR_RULES = [
  'throughput',
  'insufficientBuffer',
  'droppedFrames',
  'switchHistory',
  'abandonRequest',
  'bola',
  'lolp',
  'l2a',
]
const RULE_LABELS: Record<(typeof ABR_RULES)[number], string> = {
  throughput: 'Throughput',
  insufficientBuffer: 'Insufficient buffer',
  droppedFrames: 'Dropped frames',
  switchHistory: 'Switch history',
  abandonRequest: 'Abandon request',
  bola: 'BOLA',
  lolp: 'LoLP',
  l2a: 'L2A',
}

const abrRules = ref<string[]>([])

function setMaxBitrate(value: string) {
  settings.setDashSettings({
    streaming: {
      abr: {
        maxBitrate: parseInt(value, 10),
      },
    },
  })
}

function resetMaxBitrate() {
  settings.setDashSettings({
    streaming: {
      abr: {
        maxBitrate: -1,
      },
    },
  })
}

function setHdMaxBitrate() {
  settings.setDashSettings({
    streaming: {
      abr: {
        maxBitrate: 2000,
      },
    },
  })
}

function setSdMaxBitrate() {
  settings.setDashSettings({
    streaming: {
      abr: {
        maxBitrate: 500,
      },
    },
  })
}

function setTargetLatency(value: string) {
  settings.setDashSettings({
    streaming: {
      delay: {
        liveDelay: parseFloat(value),
      },
    },
  })
}

function resetTargetLatency() {
  settings.setDashSettings({
    streaming: {
      delay: {
        liveDelay: NaN,
      },
    },
  })
}

function resetMaxDrift() {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        maxDrift: NaN,
      },
    },
  })
}

function setMaxDrift(val: string) {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        maxDrift: parseFloat(val),
      },
    },
  })
}

function setPlaybackRateMax(val: string) {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        playbackRate: {
          max: parseFloat(val),
        },
      },
    },
  })
}

function resetPlaybackRateMax() {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        playbackRate: {
          max: NaN,
        },
      },
    },
  })
}

function setPlaybackRateMin(val: string) {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        playbackRate: {
          min: parseFloat(val),
        },
      },
    },
  })
}

function resetPlaybackRateMin() {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        playbackRate: {
          min: NaN,
        },
      },
    },
  })
}

function toggleRule(rule: string, on: boolean) {
  if (on) {
    abrRules.value.push(rule)
  } else {
    abrRules.value = abrRules.value.filter((r) => r !== rule)
  }
  settings.setDashSettings({
    streaming: {
      abr: {
        // additionalAbrRules: getAdditionalRules(abrRules.value),
        rules: {
          throughputRule: {
            active: abrRules.value.includes('throughput'),
          },
          bolaRule: {
            active: abrRules.value.includes('bola'),
          },
          insufficientBufferRule: {
            active: abrRules.value.includes('insufficientBuffer'),
            // TODO
          },
          droppedFramesRule: {
            active: abrRules.value.includes('droppedFrames'),
            // TODO
          },
          switchHistoryRule: {
            active: abrRules.value.includes('switchHistory'),
            // TODO
          },
          abandonRequestRule: {
            active: abrRules.value.includes('abandonRequest'),
            // TODO
          },
          l2ARule: {
            // TODO support
            // active: false
            active: abrRules.value.includes('l2a'),
          },
          loLPRule: {
            // TODO support
            // active: false
            active: abrRules.value.includes('lolp'),
          },
        },
      },
    },
  })
}

type AdditionalAbrRulesConfig = Record<string, boolean>

function getAdditionalRules(allRules: string[]): AdditionalAbrRulesConfig {
  return {
    // throughputRule: allRules.includes('throughput'),
    insufficientBufferRule: allRules.includes('insufficientBuffer'),
    droppedFramesRule: allRules.includes('droppedFrames'),
    switchHistoryRule: allRules.includes('switchHistory'),
    abandonRequestRule: allRules.includes('abandonRequest'),
    // bola: allRules.includes('bola'),
    // lolp: allRules.includes('lolp'),
    // l2a: allRules.includes('l2a'),
  }
}
</script>
