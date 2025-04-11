import { $ } from '@clappr/core'
import type {
  PlaybackType,
  PlayerDebugTag,
  TransportPreference,
} from '@gcorevideo/player'
import { defineStore } from 'pinia'
import { z } from 'zod'

import usePersistence from '@/composables/use-persistence'
import { PLUGIN_NAMES, type PluginName } from '~/types'

export type AdditionalAbrRulesSettings = {
  insufficientBufferRule?: boolean
  droppedFramesRule?: boolean
  switchHistoryRule?: boolean
  abandonRequestsRule?: boolean
}

export type DashAbrStrategy =
  | 'abrDynamic'
  | 'abrBola'
  | 'abrL2A'
  | 'abrLoLP'
  | 'abrThroughput'

export const DASH_DEFAULT_LIVE_DELAY = 2.2
export const DASH_DEFAULT_MAX_DRIFT = 1
export const DASH_DEFAULT_LC_PLAYBACK_RATE_MAX = 0.1
export const DASH_DEFAULT_LC_PLAYBACK_RATE_MIN = -0.1
export const DEFAULT_PRIORITY_TRANSPORT: TransportPreference = 'dash'
type CMCDKey =
  | 'br'
  | 'd'
  | 'ot'
  | 'tb'
  | 'bl'
  | 'dl'
  | 'mtp'
  | 'nor'
  | 'nrr'
  | 'su'
  | 'bs'
  | 'rtp'
  | 'cid'
  | 'pr'
  | 'sf'
  | 'sid'
  | 'st'
  | 'v'
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
    cmcd?: {
      enabled: boolean
      enabledKeys?: CMCDKey[]
      // TODO ...
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
  cmcd: CmcdSettings
  dash: DashSettings
  debug: PlayerDebugTag
  experimental: Record<string, unknown>
  loop: boolean
  mute: boolean
  playbackType?: PlaybackType
  plugins: PluginName[]
  poster: string
  priorityTransport: TransportPreference
  sources: string[]
  visitorId: string
  restrictResolution: number
  clips: string
  thumbnails: {
    sprite: string
    vtt: string
    backdropHeight: number
    // backdropMinOpacity: number
    // backdropMaxOpacity: number
    spotlightHeight: number
  }
}

type MainSettings = {
  autoplay: boolean
  loop: boolean
  mute: boolean
  playbackType?: PlaybackType
  priorityTransport: TransportPreference
}

type CmcdSettings = {
  enabled: boolean
}

type StructuredSettings = Record<string, string | boolean | number | null>

type Getters = {
  serialized: () => string
  structured: () => StructuredSettings
}

type Actions = {
  addPlugin(name: string): void
  removePlugin(name: string): void
  setAutoplay(value: boolean): void
  setCmcdEnabled(value: boolean): void
  setDashSettings(value: Partial<DashSettings>): void
  setLoop(value: boolean): void
  setMute(value: boolean): void
  setPlaybackType(value: PlaybackType): void
  setPriorityTransport(value: TransportPreference): void
  setPoster(value: string): void
  setSources(value: string[]): void
  reset(): void
  setVisitorId(value: string): void
  setRestrictResolution(value: number): void
  setClipsText(value: string): void
  setThumbnailsURL(value: string): void
  setThumbnailsVTT(value: string): void
  setThumbnailsOptions(
    options: Partial<{ backdropHeight: number; spotlightHeight: number }>
  ): void
}

const DEFAULT_MAIN_SETTINGS: MainSettings = {
  autoplay: false,
  loop: false,
  mute: true,
  // playbackType: 'vod',
  priorityTransport: DEFAULT_PRIORITY_TRANSPORT,
}

const DEFAULT_PLUGINS: PluginName[] = [
  'media_control',
  'bottom_gear',
  'dvr_controls',
  'level_selector',
  'source_controller',
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
  const persistedPlugins = usePersistence<PluginName[]>(
    'settings.plugins',
    (a: PluginName[]) => a.join(','),
    (v: string) => sanitizePlugins(v.split(',')),
    DEFAULT_PLUGINS
  )

  const persistedBasic = usePersistence<MainSettings>(
    'settings.basic',
    JSON.stringify,
    JSON.parse,
    DEFAULT_MAIN_SETTINGS
  )

  const persistedPoster = usePersistence('settings.poster', id, id, '')
  const persistedThumbnails = usePersistence(
    'settings.thumbnails',
    JSON.stringify,
    JSON.parse,
    { sprite: '', vtt: '', backdropHeight: 0, spotlightHeight: 0 }
  )
  const persistedClips = usePersistence('settings.clips', id, id, '')
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
          url.searchParams.get('playback_type')
        ) ??
        pm.playbackType ??
        DEFAULT_MAIN_SETTINGS.playbackType, // TODO sanitize
      priorityTransport: transportPreference(
        url.searchParams.get('priority_transport') || pm.priorityTransport
      ),
    })
  }
  const debug = debugTag(url.searchParams.get('debug') || 'clappr') ?? 'all'
  const { autoplay, mute, loop, playbackType, priorityTransport } =
    persistedBasic.get()

  const usePersistedPlugins = !url.searchParams.has('plugins')
  const plugins =
    (usePersistedPlugins
      ? persistedPlugins.get()
      : sanitizePlugins(
          url.searchParams.get('plugins')?.split(',') ?? DEFAULT_PLUGINS
        )) ?? []
  const usePersistedSources = !url.searchParams.has('sources')
  const sources = usePersistedSources
    ? persistedSources.get()
    : url.searchParams.get('sources')?.split(',') ?? []
  persistedSources.set(sources)

  if (url.searchParams.has('poster')) {
    persistedPoster.set(url.searchParams.get('poster') ?? '')
  }
  const poster = persistedPoster.get()
  const persistedCmcd = usePersistence<CmcdSettings>(
    'settings.cmcd',
    JSON.stringify,
    JSON.parse,
    { enabled: false }
  )
  const cmcd = persistedCmcd.get()
  const thumbnails = persistedThumbnails.get()

  return defineStore<'settings', State, Getters, Actions>('settings', {
    state: () => ({
      autoplay,
      cmcd,
      dash: deserializeDashSettings(url.searchParams.get('dash') ?? '{}'),
      debug,
      experimental: {},
      loop,
      mute,
      playbackType,
      plugins,
      priorityTransport: transportPreference(
        priorityTransport,
        DEFAULT_PRIORITY_TRANSPORT
      ),
      poster,
      sources,
      visitorId: '',
      restrictResolution: parseInt(
        parseSelectOption(
          ['360', '720', '0'],
          url.searchParams.get('restrict_resolution')
        ) ?? '0',
        10
      ),
      clips: persistedClips.get(),
      thumbnails,
    }),
    getters: {
      serialized() {
        return Object.entries(this.structured)
          .map(([key, value]) => {
            if (value === null) {
              return null
            }
            return `${key}=${value}`
          })
          .filter(Boolean)
          .join('&')
      },
      structured() {
        const retval: StructuredSettings = {}
        if (this.autoplay) {
          retval.autoplay = true
        }
        if (this.mute) {
          retval.mute = true
        }
        if (this.loop) {
          retval.loop = true
        }
        if (this.playbackType === 'live') {
          retval.playback_type = this.playbackType
        }
        if (this.priorityTransport !== DEFAULT_PRIORITY_TRANSPORT) {
          retval.priority_transport = this.priorityTransport
        }
        if (this.plugins.length > 0) {
          retval.plugins = this.plugins.join(',')
        }
        if (this.sources.length > 0) {
          retval.sources = this.sources.join(',')
        }
        if (this.debug !== 'all') {
          retval.debug = this.debug
        }
        if (isCustomDashSettings(this.dash)) {
          retval.dash = serializeDashSettings(this.dash)
        }
        return retval
      },
    },
    actions: {
      addPlugin(name: PluginName) {
        if (this.plugins.includes(name)) {
          return
        }
        this.plugins.push(name)
        persistedPlugins.set(this.plugins)
      },
      removePlugin(name: PluginName) {
        const index = this.plugins.indexOf(name)
        if (index === -1) {
          return
        }
        this.plugins.splice(index, 1)
        persistedPlugins.set(this.plugins)
      },
      setAutoplay(value: boolean) {
        this.autoplay = value
        persistBasicSettings(this)
      },
      setClipsText(value: string) {
        this.clips = value
        persistedClips.set(value)
      },
      setCmcdEnabled(value: boolean) {
        this.cmcd.enabled = value
        persistedCmcd.set(this.cmcd)
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
      setThumbnailsURL(value: string) {
        this.thumbnails.sprite = value
        persistedThumbnails.set(this.thumbnails)
      },
      setThumbnailsVTT(value: string) {
        this.thumbnails.vtt = value
        persistedThumbnails.set(this.thumbnails)
      },
      setThumbnailsOptions(
        options: Partial<{ backdropHeight: number; spotlightHeight: number }>
      ) {
        this.thumbnails = $.extend(true, {}, this.thumbnails, options)
        persistedThumbnails.set(this.thumbnails)
      },
      setVisitorId(value: string) {
        this.visitorId = value
      },
      reset() {
        this.autoplay = true
        this.mute = true
        this.loop = false
        this.plugins = DEFAULT_PLUGINS.slice()
        this.priorityTransport = DEFAULT_PRIORITY_TRANSPORT
        this.playbackType = undefined
        this.dash = structuredClone(DEFAULT_DASH_SETTINGS)
        this.restrictResolution = 0
      },
      setRestrictResolution(value: number) {
        this.restrictResolution = value
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
  return parseSelectOption<TransportPreference>(['dash', 'hls'], input) ?? def
}

function parseSelectOption<T extends string>(
  options: string[], // T[]
  input: string | null
): T | undefined {
  if (input === null) {
    return
  }
  if (options.includes(input)) {
    return input as T
  }
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

function sanitizePlugins(plugins: string[]): PluginName[] {
  return plugins.filter((p) =>
    PLUGIN_NAMES.includes(p as PluginName)
  ) as PluginName[]
}
