import { $ } from '@clappr/core'
import type {
  PlaybackType,
  PlayerDebugTag,
  TransportPreference,
} from '@gcorevideo/player'
import { defineStore } from 'pinia'
import { z } from 'zod'

import usePersistence from '@/composables/use-persistence'

export type AdditionalAbrRulesSettings = {
  insufficientBufferRule?: boolean
  droppedFramesRule?: boolean
  switchHistoryRule?: boolean
  abandonRequestsRule?: boolean
}

export type DashAbrStrategy = 'abrDynamic' | 'abrBola' | 'abrL2A' | 'abrLoLP' | 'abrThroughput'

export const DASH_DEFAULT_LIVE_DELAY = 2.2
export const DASH_DEFAULT_MAX_DRIFT = 1
export const DASH_DEFAULT_LC_PLAYBACK_RATE_MAX = 0.1
export const DASH_DEFAULT_LC_PLAYBACK_RATE_MIN = -0.1
export const DEFAULT_MEDIA_TRANSPORT: TransportPreference = 'dash'
export type DashSettings = {
  streaming: {
    abr?: {
      ABRStrategy?: DashAbrStrategy
      additionalAbrRules?: AdditionalAbrRulesSettings
      autoSwitchBitrate?: {
        audio?: boolean
        video?: boolean
      }
      initialBitrate?: {
        audio?: number
        video?: number
      }
      maxBitrate?: {
        audio?: number
        video?: number
      }
    }
    delay?: {
      liveDelay: number
    }
    liveCatchup?: {
      maxDrift?: number
      playbackRate?: {
        max?: number
        min?: number
      }
    }
  }
}

type State = {
  autoplay: boolean
  dash: DashSettings
  debug: PlayerDebugTag
  experimental: Record<string, unknown>
  loop: boolean
  mute: boolean
  playbackType: PlaybackType
  plugins: string[]
  poster: string
  priorityTransport: TransportPreference
  sources: string[]
}

type MainSettings = {
  autoplay: boolean
  loop: boolean
  mute: boolean
  playbackType: PlaybackType
  priorityTransport: TransportPreference
}

type Getters = {
  serialized: () => string
}

type Actions = {
  addPlugin(name: string): void
  removePlugin(name: string): void
  setAutoplay(value: boolean): void
  setLoop(value: boolean): void
  setDashSettings(value: Partial<DashSettings>): void
  setMute(value: boolean): void
  setPlaybackType(value: PlaybackType): void
  setPriorityTransport(value: TransportPreference): void
  setPoster(value: string): void
  setSources(value: string[]): void
  reset(): void
}

const DEFAULT_MAIN_SETTINGS: MainSettings = {
  autoplay: false,
  loop: false,
  mute: true,
  playbackType: 'vod',
  priorityTransport: DEFAULT_MEDIA_TRANSPORT,
}

const DEFAULT_PLUGINS = [
  'bottom_gear',
  'dvr_controls',
  'media_control',
  'level_selector',
  'error_screen',
  'example_ui',
  'poster',
  'spinner',
]

const DEFAULT_DASH_SETTINGS: DashSettings = {
  streaming: {
    abr: {
      ABRStrategy: 'abrL2A',
      maxBitrate: { video: -1 },
      initialBitrate: { video: -1 },
      autoSwitchBitrate: { video: true },
    },
    delay: {
      liveDelay: DASH_DEFAULT_LIVE_DELAY,
    },
    liveCatchup: {
      maxDrift: DASH_DEFAULT_MAX_DRIFT,
      playbackRate: {
        max: DASH_DEFAULT_LC_PLAYBACK_RATE_MAX,
        min: DASH_DEFAULT_LC_PLAYBACK_RATE_MIN,
      },
    },
  },
}

const useSettingsStore = () => {
  const persistedSources = usePersistence<string[]>(
    'settings.sources',
    String,
    (s) => s.split(',').filter(Boolean),
    []
  )
  const persistedPlugins = usePersistence<string[]>(
    'settings.plugins',
    (a: string[]) => a.join(),
    (v: string) => v.split(','),
    DEFAULT_PLUGINS
  )

  const persistedBasic = usePersistence<MainSettings>(
    'settings.basic',
    JSON.stringify,
    JSON.parse,
    DEFAULT_MAIN_SETTINGS
  )

  const persistedPoster = usePersistence('settings.poster', id, id, '')

  const url = useRequestURL()
  if (
    url.searchParams.has('autoplay') ||
    url.searchParams.has('loop') ||
    url.searchParams.has('mute') ||
    url.searchParams.has('playback_type') ||
    url.searchParams.has('priority_transport')
  ) {
    const pm = persistedBasic.get()
    persistedBasic.set({
      ...persistedBasic.get(),
      autoplay: parseBoolean(
        url.searchParams.get('autoplay'),
        pm.autoplay ?? DEFAULT_MAIN_SETTINGS.autoplay
      ),
      loop: parseBoolean(
        url.searchParams.get('loop'),
        pm.loop ?? DEFAULT_MAIN_SETTINGS.loop
      ),
      mute: parseBoolean(
        url.searchParams.get('mute'),
        pm.mute ?? DEFAULT_MAIN_SETTINGS.mute
      ),
      playbackType:
        parseSelectOption<PlaybackType>(
          ['vod', 'live'],
          url.searchParams.get('playback_type'),
          'vod'
        ) ??
        pm.playbackType ??
        DEFAULT_MAIN_SETTINGS.playbackType, // TODO sanitize
      priorityTransport: transportPreference(
        url.searchParams.get('priority_transport') || pm.priorityTransport,
      ),
    })
  }
  persistedSources.set(url.searchParams.get('sources')?.split(',') ?? [])
  const debug = debugTag(url.searchParams.get('debug') || 'clappr') ?? 'all'
  const {
    autoplay,
    mute,
    loop,
    playbackType = 'vod',
    priorityTransport,
  } = persistedBasic.get()

  const usePersistedPlugins = !url.searchParams.has('plugins')
  const plugins =
    (usePersistedPlugins
      ? persistedPlugins.get()
      : url.searchParams.get('plugins')?.split(',')) ?? []
  const sources = persistedSources.get()

  if (url.searchParams.has('poster')) {
    persistedPoster.set(url.searchParams.get('poster') ?? '')
  }
  const poster = persistedPoster.get()

  return defineStore<'settings', State, Getters, Actions>('settings', {
    state: () => ({
      autoplay,
      dash: deserializeDashSettings(url.searchParams.get('dash') ?? '{}'),
      debug,
      experimental: {},
      loop,
      mute,
      playbackType,
      plugins,
      priorityTransport: transportPreference(priorityTransport, 'dash'),
      poster,
      sources,
    }),
    getters: {
      serialized() {
        const items: string[] = []
        if (this.autoplay) {
          items.push('autoplay=true')
        }
        if (this.mute) {
          items.push('mute=true')
        }
        if (this.loop) {
          items.push('loop=true')
        }
        if (this.playbackType !== 'vod') {
          items.push(`playback_type=${this.playbackType}`)
        }
        if (this.priorityTransport !== DEFAULT_MEDIA_TRANSPORT) {
          items.push(`priority_transport=${this.priorityTransport}`)
        }
        if (this.plugins.length > 0) {
          items.push(`plugins=${this.plugins.join(',')}`)
        }
        if (this.sources.length > 0) {
          items.push(`sources=${encodeURIComponent(this.sources.join(','))}`)
        }
        if (this.debug !== 'all') {
          items.push(`debug=${this.debug}`)
        }
        if (isCustomDashSettings(this.dash)) {
          items.push(
            `dash=${encodeURIComponent(serializeDashSettings(this.dash))}`
          )
        }
        return items.join('&')
      },
    },
    actions: {
      addPlugin(name: string) {
        if (this.plugins.includes(name)) {
          return
        }
        this.plugins.push(name)
        if (
          name === 'clappr_nerd_stats' &&
          !this.plugins.includes('clappr_stats')
        ) {
          this.plugins.push('clappr_stats')
        }
        persistedPlugins.set(this.plugins)
      },
      removePlugin(name: string) {
        const index = this.plugins.indexOf(name)
        if (index === -1) {
          return
        }
        this.plugins.splice(index, 1)
        if (
          name === 'clappr_stats' &&
          this.plugins.includes('clappr_nerd_stats')
        ) {
          this.plugins.splice(this.plugins.indexOf('clappr_nerd_stats'), 1)
        }
        persistedPlugins.set(this.plugins)
      },
      setAutoplay(value: boolean) {
        this.autoplay = value
        persistBasicSettings(this)
      },
      setDashSettings(value: Partial<DashSettings>) {
        this.dash = $.extend(true, {}, this.dash, value)
        // TODO persist?
      },
      setLoop(value: boolean) {
        this.loop = value
        persistBasicSettings(this)
      },
      setMute(value: boolean) {
        this.mute = value
        persistBasicSettings(this)
      },
      setPlaybackType(value: PlaybackType) {
        this.playbackType = value
        persistBasicSettings(this)
      },
      setPoster(value: string) {
        this.poster = value
        persistedPoster.set(value)
      },
      setPriorityTransport(value: TransportPreference) {
        this.priorityTransport = value
        persistBasicSettings(this)
      },
      setSources(value: string[]) {
        this.sources = value
        persistedSources.set(value)
      },
      reset() {
        this.autoplay = true
        this.mute = true
        this.loop = false
        this.plugins = DEFAULT_PLUGINS.slice()
        this.priorityTransport = DEFAULT_MEDIA_TRANSPORT
        this.playbackType = 'vod'
        this.dash = structuredClone(DEFAULT_DASH_SETTINGS)
      },
    },
  })()

  function persistBasicSettings(state: State) {
    persistedBasic.set({
      autoplay: state.autoplay,
      loop: state.loop,
      mute: state.mute,
      playbackType: state.playbackType,
      priorityTransport: state.priorityTransport,
    })
  }
}

function debugTag(input: string): PlayerDebugTag | undefined {
  if (['all', 'clappr', 'dash', 'hls', 'none'].includes(input)) {
    return input as PlayerDebugTag
  }
}

function transportPreference(
  input: string | null,
  def: TransportPreference = 'dash'
): TransportPreference {
  return parseSelectOption<TransportPreference>(
    ['dash', 'hls'],
    input,
    def
  )
}

function parseSelectOption<T extends string>(
  options: string[],
  input: string | null,
  def: T
): T {
  if (input === null) {
    return def
  }
  return options.includes(input) ? (input as T) : def
}

function parseBoolean(val: string | null, defaultValue = false): boolean {
  if (val === null) {
    return defaultValue
  }
  return ['true', 'yes', '1'].includes(val)
}

function isCustomDashSettings(settings: DashSettings): boolean {
  // TODO
  return (
    settings.streaming.abr?.maxBitrate?.video !== -1 ||
    settings.streaming.abr?.initialBitrate?.video !== -1 ||
    settings.streaming.abr?.autoSwitchBitrate?.video !== true ||
    Object.keys(settings.streaming.abr?.additionalAbrRules ?? {}).length > 0 ||
    settings.streaming.delay?.liveDelay !== undefined ||
    settings.streaming.liveCatchup?.maxDrift !== undefined ||
    settings.streaming.liveCatchup?.playbackRate?.max !== undefined ||
    settings.streaming.liveCatchup?.playbackRate?.min !== undefined
  )
}

function serializeDashSettings(settings: DashSettings): string {
  return JSON.stringify(settings)
}

function deserializeDashSettings(input: string): DashSettings {
  try {
    return sanitizeDashSettings(JSON.parse(input))
  } catch (e) {
    console.error(e)
    return DEFAULT_DASH_SETTINGS
  }
}

function sanitizeDashSettings(settings: unknown): DashSettings {
  const ruleSchema = z.object({ active: z.boolean() })
  const schema = z.object({
    streaming: z.object({
      abr: z.object({
        ABRStrategy: z
          .enum(['abrDynamic', 'abrThroughput', 'abrBola'])
          .optional(),
        additionalAbrRules: z
          .object({
            throughputRule: z.boolean().optional(),
            insufficientBufferRule: ruleSchema.optional(),
            droppedFramesRule: ruleSchema.optional(),
            switchHistoryRule: ruleSchema.optional(),
          })
          .optional(),
        autoSwitchBitrate: z
          .object({
            audio: z.boolean().optional(),
            video: z.boolean().optional(),
          })
          .optional(),
        initialBitrate: z
          .object({
            audio: z.number().optional(),
            video: z.number().optional(),
          })
          .optional(),
        maxBitrate: z
          .object({
            audio: z.number().optional(),
            video: z.number().optional(),
          })
          .optional(),
      }),
      delay: z.object({ liveDelay: z.number().optional() }).optional(),
      liveCatchup: z
        .object({
          maxDrift: z.number().optional(),
          playbackRate: z
            .object({
              max: z.number().optional(),
              min: z.number().optional(),
            })
            .optional(),
        })
        .optional(),
    }),
  })
  const { success, data } = schema.safeParse(settings)
  return success ? (data as DashSettings) : DEFAULT_DASH_SETTINGS
}

export default useSettingsStore

function id<T = string>(a: string) {
  return a as T
}
