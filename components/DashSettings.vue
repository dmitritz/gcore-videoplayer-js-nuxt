<template>
  <div
    class="flex flex-col md:grid gap-2 my-2 md:grid-cols-3 md:content-center md:items-center"
  >
    <div class="font-medium text-slate-600">Bitrate</div>
    <label
      for="dash_bitrate_auto_switch"
      class="text-slate-600 font-medium text-sm"
    >
      <input
        type="checkbox"
        id="dash_bitrate_auto_switch"
        :checked="autoSwitchBitrate"
        @change="e => toggleBitrateAutoSwitch((e.target as HTMLInputElement).checked)"
      />
      Auto switch
    </label>
    <div class="row text-xs">
      <button
        @click="setSdBitrate"
        :class="{ btn: true, active: mbrIsSd && ibrIsSd }"
      >
        SD
      </button>
      <button
        @click="setHdBitrate"
        :class="{ btn: true, active: mbrIsHd && ibrIsHd }"
      >
        HD
      </button>
      <button
        @click="setAutoBitrate"
        :class="{
          btn: true,
          active: mbrIsAuto && ibrIsAuto,
        }"
      >
        auto
      </button>
    </div>
    <label for="dash_initial_bitrate" class="sub-label">initial</label>
    <div class="row col-span-2">
      <input
        type="number"
        id="dash_initial_bitrate"
        :value="initialBitrate"
        class="rounded border p-1 w-20 mr-2"
        @change="e => setInitialBitrate((e.target as HTMLInputElement).value)"
      />
      <span class="field-suffix">Kbps</span>
    </div>
    <label for="dash_max_bitrate" class="sub-label">max</label>
    <div class="row col-span-2">
      <input
        type="number"
        id="dash_max_bitrate"
        :value="maxBitrate"
        class="textfield"
        @change="e => setMaxBitrate((e.target as HTMLInputElement).value)"
      />
      <span class="field-suffix">Kbps</span>
    </div>
    <div class="mb-2 col-span-3"></div>
    <label for="dash_target_latency" class="label">Target latency</label>
    <div class="row">
      <input
        type="number"
        id="dash_target_latency"
        :value="targetLatency"
        step="0.1"
        class="textfield"
        @change="e => setTargetLatency((e.target as HTMLInputElement).value)"
      />
      <span class="field-suffix">sec</span>
    </div>
    <div class="row">
      <button
        @click="setTargetLatencyAuto"
        :class="{
          btn: true,
          active: targetLatencyAuto,
        }"
        title="From manifest"
      >
        auto
      </button>
      <button
        @click="setTargetLatencyRecommended"
        :class="{
          btn: true,
          active: targetLatencyDefault,
        }"
        title="Tuned for the Gcore live streaming platform"
      >
        recommended
      </button>
    </div>
    <div class="mb-2 col-span-3"></div>
    <div class="label col-span-3 mb:col-span-1">Live catchup</div>
    <div class="row md:col-start-3">
      <button
        @click="disableLiveCatchup"
        :class="{ btn: true, active: liveCatchupDisabled }"
      >
        disable
      </button>
      <button
        @click="resetLiveCatchup"
        :class="{ btn: true, active: liveCatchupDefault }"
      >
        default
      </button>
    </div>
    <label for="dash_max_drift" class="sub-label">max drift</label>
    <div class="row col-span-2">
      <input
        type="number"
        id="dash_max_drift"
        :value="maxDrift"
        step="0.1"
        class="textfield"
        @change="e => setMaxDrift((e.target as HTMLInputElement).value)"
      />
      <span class="field-suffix"></span>
    </div>
    <label for="dash_playback_rate_max" class="sub-label"
      >playback rate max</label
    >
    <div class="row col-span-2">
      <input
        type="number"
        id="dash_playback_rate_max"
        :value="playbackRateMax"
        step="0.1"
        min="0"
        max="1"
        class="textfield"
        @change="e => setPlaybackRateMax((e.target as HTMLInputElement).value)"
      />
      <span class="field-suffix"> 0..1.0, 0.5=50% </span>
    </div>
    <label for="dash_playback_rate_min" class="sub-label"
      >playback rate min</label
    >
    <div class="row col-span-2">
      <input
        type="number"
        id="dash_playback_rate_min"
        :value="playbackRateMin"
        step="0.1"
        min="-0.5"
        max="0"
        class="textfield"
        @change="e => setPlaybackRateMin((e.target as HTMLInputElement).value)"
      />
      <span class="field-suffix"> -0.5..0 </span>
    </div>
    <div class="mb-2 col-span-3"></div>
    <div class="label col-span-3">ABR</div>
    <div class="sub-label col-span-3 md:col-span-1">strategy</div>
    <div class="col-span-3 md:col-span-2 grid grid-cols-3 gap-1 text-sm">
      <label
        v-for="strategy of ABR_STRATEGIES"
        :key="strategy"
        :for="`dash_abr_strategy_${strategy}`"
        class=""
      >
        <input
          type="radio"
          :id="`dash_abr_strategy_${strategy}`"
          name="abr_strategy"
          :checked="abrStrategy === strategy"
          @change="setAbrStrategy(strategy)"
        />
        {{ ABR_STRATEGY_LABELS[strategy] }}
      </label>
    </div>
    <div class="sub-label col-span-3 md:col-span-1">additional rules</div>
    <div class="col-span-3 md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-1">
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
    <div class="mb-2 col-span-3"></div>
  </div>
</template>

<script setup lang="ts">
import useSettingsStore, {
  DASH_DEFAULT_LC_PLAYBACK_RATE_MAX,
  DASH_DEFAULT_LC_PLAYBACK_RATE_MIN,
  DASH_DEFAULT_LIVE_DELAY,
  DASH_DEFAULT_MAX_DRIFT,
} from '~/store/settings'
import type {
  AdditionalAbrRulesSettings,
  DashAbrStrategy,
} from '~/store/settings'

const settings = useSettingsStore()
const maxBitrate = computed(
  () => settings.dash.streaming?.abr?.maxBitrate?.video
)
const mbrIsAuto = computed(() => maxBitrate.value === -1)
const mbrIsSd = computed(() => maxBitrate.value === 500)
const mbrIsHd = computed(() => maxBitrate.value === 2000)
const initialBitrate = computed(
  () => settings.dash.streaming?.abr?.initialBitrate?.video
)
const ibrIsAuto = computed(() => initialBitrate.value === -1)
const ibrIsSd = computed(() => initialBitrate.value === 500)
const ibrIsHd = computed(() => initialBitrate.value === 2000)
const autoSwitchBitrate = computed(
  () => !!settings.dash.streaming?.abr?.autoSwitchBitrate?.video
)

const maxDrift = computed(() => settings.dash.streaming?.liveCatchup?.maxDrift)

const playbackRateMax = computed(
  () => settings.dash.streaming?.liveCatchup?.playbackRate?.max
)

const playbackRateMin = computed(
  () => settings.dash.streaming?.liveCatchup?.playbackRate?.min
)

const targetLatency = computed(() => settings.dash.streaming?.delay?.liveDelay)
// @ts-ignore TODO fix the types
const targetLatencyAuto = computed(() => isNaN(targetLatency.value))
const targetLatencyDefault = computed(
  () => targetLatency.value === DASH_DEFAULT_LIVE_DELAY
)

const liveCatchupDisabled = computed(
  () =>
    !settings.dash.streaming?.liveCatchup?.maxDrift &&
    !settings.dash.streaming?.liveCatchup?.playbackRate?.max &&
    !settings.dash.streaming?.liveCatchup?.playbackRate?.min
)

const liveCatchupDefault = computed(
  () =>
    settings.dash.streaming?.liveCatchup?.maxDrift === DASH_DEFAULT_MAX_DRIFT &&
    settings.dash.streaming?.liveCatchup?.playbackRate?.max ===
      DASH_DEFAULT_LC_PLAYBACK_RATE_MAX &&
    settings.dash.streaming?.liveCatchup?.playbackRate?.min ===
      DASH_DEFAULT_LC_PLAYBACK_RATE_MIN
)

const abrStrategy = computed(() => settings.dash.streaming?.abr?.ABRStrategy)

const ABR_RULES = [
  // 'throughput',
  'insufficientBuffer',
  'droppedFrames',
  'switchHistory',
  'abandonRequest',
  // 'bola',
  // 'lolp',
  // 'l2a',
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

const ABR_STRATEGIES: DashAbrStrategy[] = [
  'abrDynamic',
  'abrThroughput',
  'abrBola',
]
const ABR_STRATEGY_LABELS: Record<DashAbrStrategy, string> = {
  abrDynamic: 'Dynamic',
  abrThroughput: 'Throughput',
  abrBola: 'BOLA',
}

type BitrateFieldKey = 'maxBitrate' | 'initialBitrate'

function setMaxBitrate(value: string) {
  setBitrateValue('maxBitrate', value)
}

function setInitialBitrate(value: string) {
  setBitrateValue('initialBitrate', value)
}

function setBitrateValue(key: BitrateFieldKey, value: string) {
  settings.setDashSettings({
    streaming: {
      abr: {
        [key]: { video: parseInt(value, 10) },
      },
    },
  })
}

function resetBitrateValue(key: BitrateFieldKey) {
  settings.setDashSettings({
    streaming: {
      abr: {
        [key]: { video: -1 },
      },
    },
  })
}

function setHdBitrate() {
  setHdBitrateValue('maxBitrate')
  setHdBitrateValue('initialBitrate')
}

function setSdBitrate() {
  setSdBitrateValue('maxBitrate')
  setSdBitrateValue('initialBitrate')
}

function setHdBitrateValue(key: BitrateFieldKey) {
  settings.setDashSettings({
    streaming: {
      abr: {
        [key]: { video: 2000 },
      },
    },
  })
}

function setSdBitrateValue(key: BitrateFieldKey) {
  settings.setDashSettings({
    streaming: {
      abr: {
        [key]: { video: 500 },
      },
    },
  })
}

function setAutoBitrate() {
  settings.setDashSettings({
    streaming: {
      abr: {
        maxBitrate: { video: -1 },
        initialBitrate: { video: -1 },
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

function setTargetLatencyAuto() {
  settings.setDashSettings({
    streaming: {
      delay: {
        liveDelay: NaN,
      },
    },
  })
}

function setTargetLatencyRecommended() {
  settings.setDashSettings({
    streaming: {
      delay: {
        liveDelay: DASH_DEFAULT_LIVE_DELAY,
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

function toggleRule(rule: string, on: boolean) {
  if (on) {
    abrRules.value.push(rule)
  } else {
    abrRules.value = abrRules.value.filter((r) => r !== rule)
  }
  settings.setDashSettings({
    streaming: {
      abr: {
        additionalAbrRules: getAdditionalRules(abrRules.value),
        // rules: {
        //   throughputRule: {
        //     active: abrRules.value.includes('throughput'),
        //   },
        //   bolaRule: {
        //     active: abrRules.value.includes('bola'),
        //   },
        //   insufficientBufferRule: {
        //     active: abrRules.value.includes('insufficientBuffer'),
        //     // TODO
        //   },
        //   droppedFramesRule: {
        //     active: abrRules.value.includes('droppedFrames'),
        //     // TODO
        //   },
        //   switchHistoryRule: {
        //     active: abrRules.value.includes('switchHistory'),
        //     // TODO
        //   },
        //   abandonRequestRule: {
        //     active: abrRules.value.includes('abandonRequest'),
        //     // TODO
        //   },
        //   l2ARule: {
        //     // TODO support
        //     // active: false
        //     active: abrRules.value.includes('l2a'),
        //   },
        //   loLPRule: {
        //     // TODO support
        //     // active: false
        //     active: abrRules.value.includes('lolp'),
        //   },
        // },
      },
    },
  })
}

function getAdditionalRules(allRules: string[]): AdditionalAbrRulesSettings {
  return {
    // throughputRule: allRules.includes('throughput'),
    insufficientBufferRule: allRules.includes('insufficientBuffer'),
    droppedFramesRule: allRules.includes('droppedFrames'),
    switchHistoryRule: allRules.includes('switchHistory'),
    abandonRequestsRule: allRules.includes('abandonRequest'),
    // bola: allRules.includes('bola'),
    // lolp: allRules.includes('lolp'),
    // l2a: allRules.includes('l2a'),
  }
}

function toggleBitrateAutoSwitch(on: boolean) {
  settings.setDashSettings({
    streaming: {
      abr: {
        autoSwitchBitrate: {
          video: on,
        },
      },
    },
  })
}

function disableLiveCatchup() {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        maxDrift: 0,
        playbackRate: {
          max: 0,
          min: 0,
        },
      },
    },
  })
}

function resetLiveCatchup() {
  settings.setDashSettings({
    streaming: {
      liveCatchup: {
        maxDrift: DASH_DEFAULT_MAX_DRIFT,
        playbackRate: {
          max: DASH_DEFAULT_LC_PLAYBACK_RATE_MAX,
          min: DASH_DEFAULT_LC_PLAYBACK_RATE_MIN,
        },
      },
    },
  })
}

function setAbrStrategy(strategy: DashAbrStrategy) {
  settings.setDashSettings({
    streaming: {
      abr: {
        ABRStrategy: strategy,
      },
    },
  })
}
</script>

<style lang="css" scoped>
.label {
  @apply font-medium text-slate-600;
}
.btn {
  @apply border border-slate-300 rounded text-xs text-slate-600;
}
.btn.active {
  @apply border-orange-300 text-orange-300;
}
.row {
  @apply flex items-center gap-1;
}
.textfield {
  @apply rounded border p-1 w-20 mr-2;
}
.field-suffix {
  @apply text-xs text-slate-600;
}
.sub-label {
  @apply label;
  @apply md:text-right text-left;
}
</style>
