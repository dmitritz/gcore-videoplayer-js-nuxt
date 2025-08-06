import { $ } from '@clappr/core'
import type {
  PlaybackType,
  PlayerDebugTag,
  TransportPreference,
} from '@gcorevideo/player'
// import { trace } from '@gcorevideo/player'
import { defineStore } from 'pinia'

import usePersistence from '@/composables/use-persistence'
import { PLUGIN_NAMES, type PluginName } from '~/types'
export type { DashSettings, PersistentSettings } from './marshal'
import {
  parseDashSettings,
  parseSettings,
  type DashSettings,
  type PersistentSettings,
} from './marshal'

export const DASH_DEFAULT_LIVE_DELAY = 2.2
export const DASH_DEFAULT_MAX_DRIFT = 1
export const DASH_DEFAULT_LC_PLAYBACK_RATE_MAX = 0.1
export const DASH_DEFAULT_LC_PLAYBACK_RATE_MIN = -0.1
export const DEFAULT_PRIORITY_TRANSPORT: TransportPreference = 'dash'

type State = {
  autoplay: boolean
  dash: DashSettings
  debug: PlayerDebugTag
  experimental: Record<string, unknown>
  godMode: boolean
  loop: boolean
  mute: boolean
  persistKey: string
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
    // backdropHeight: number
    // backdropMinOpacity: number
    // backdropMaxOpacity: number
    // spotlightHeight: number
  }
  recycleVideo: boolean
  streamConfigUrl: string
}

type MainSettings = {
  autoplay: boolean
  loop: boolean
  mute: boolean
  playbackType?: PlaybackType
  priorityTransport: TransportPreference
  recycleVideo: boolean
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
  setDashSettings(value: Partial<DashSettings>): void
  setLoop(value: boolean): void
  setMute(value: boolean): void
  setPlaybackType(value: PlaybackType): void
  setPriorityTransport(value: TransportPreference): void
  setPoster(value: string): void
  setSources(value: string[]): void
  reset(): void
  setVisitorId(value: string): void
  setStreamConfigUrl(value: string): void
  setRestrictResolution(value: number): void
  setClipsText(value: string): void
  setThumbnailsURL(value: string): void
  setThumbnailsVTT(value: string): void
  setThumbnailsOptions(
    options: Partial<{ backdropHeight: number; spotlightHeight: number }>
  ): void
  setRecycleVideo(value: boolean): void
  setGodMode(): void

  load(): void
  persist(): Promise<string>
}

const DEFAULT_MAIN_SETTINGS: MainSettings = {
  autoplay: false,
  loop: false,
  mute: true,
  // playbackType: 'vod',
  priorityTransport: DEFAULT_PRIORITY_TRANSPORT,
  recycleVideo: true,
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

// const T = 'store.settings'

const useSettingsStore = () => {
  const url = useRequestURL()
  const localPersistKey = usePersistence('settings.persistKey', id, id, '')
  if (url.searchParams.has('k')) {
    localPersistKey.set(url.searchParams.get('k') ?? '')
  }
  const persistKey = localPersistKey.get()

  const localSources = usePersistence<string[]>(
    'settings.sources',
    String,
    (s) => s.split(',').filter(Boolean),
    []
  )
  const localPlugins = usePersistence<PluginName[]>(
    'settings.plugins',
    (a: PluginName[]) => a.join(','),
    (v: string) => sanitizePlugins(v.split(',')),
    DEFAULT_PLUGINS
  )

  const localBasic = usePersistence<MainSettings>(
    'settings.basic',
    JSON.stringify,
    JSON.parse,
    DEFAULT_MAIN_SETTINGS
  )

  const localPoster = usePersistence('settings.poster', id, id, '')
  const localThumbnails = usePersistence(
    'settings.thumbnails',
    JSON.stringify,
    JSON.parse,
    { sprite: '', vtt: '', backdropHeight: 0, spotlightHeight: 0 }
  )
  const localClips = usePersistence('settings.clips', id, id, '')
  if (
    url.searchParams.has('autoplay') ||
    url.searchParams.has('loop') ||
    url.searchParams.has('mute') ||
    url.searchParams.has('playback_type') ||
    url.searchParams.has('priority_transport')
  ) {
    const pm = localBasic.get()
    localBasic.set({
      ...localBasic.get(),
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
      recycleVideo: parseBoolean(
        url.searchParams.get('recycle_video'),
        pm.recycleVideo ?? DEFAULT_MAIN_SETTINGS.recycleVideo
      ),
    })
  }
  const debug = debugTag(url.searchParams.get('debug') || 'clappr') ?? 'all'
  const { autoplay, mute, loop, playbackType, priorityTransport } =
    localBasic.get()

  const usePersistedPlugins = !url.searchParams.has('plugins')
  const plugins =
    (usePersistedPlugins
      ? localPlugins.get()
      : sanitizePlugins(
          url.searchParams.get('plugins')?.split(',') ?? DEFAULT_PLUGINS
        )) ?? []
  const usePersistedSources = !url.searchParams.has('sources')
  const sources = usePersistedSources
    ? localSources.get()
    : url.searchParams.get('sources')?.split(',') ?? []
  localSources.set(sources)

  if (url.searchParams.has('poster')) {
    localPoster.set(url.searchParams.get('poster') ?? '')
  }
  const poster = localPoster.get()
  const thumbnails = localThumbnails.get()

  return defineStore<'settings', State, Getters, Actions>('settings', {
    state: () => ({
      autoplay,
      dash: deserializeDashSettings(url.searchParams.get('dash') ?? '{}'),
      debug,
      experimental: {},
      godMode: false,
      loop,
      mute,
      persistKey: persistKey ?? '',
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
      clips: localClips.get(),
      thumbnails,
      recycleVideo: localBasic.get().recycleVideo,
      streamConfigUrl: '',
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
        localPlugins.set(this.plugins)
      },
      removePlugin(name: PluginName) {
        const index = this.plugins.indexOf(name)
        if (index === -1) {
          return
        }
        this.plugins.splice(index, 1)
        localPlugins.set(this.plugins)
      },
      setAutoplay(value: boolean) {
        this.autoplay = value
        persistBasicSettings(this)
      },
      setClipsText(value: string) {
        this.clips = value
        localClips.set(value)
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
        localPoster.set(value)
      },
      setPriorityTransport(value: TransportPreference) {
        this.priorityTransport = value
        persistBasicSettings(this)
      },
      setSources(value: string[]) {
        this.sources = value
        localSources.set(value)
      },
      setThumbnailsURL(value: string) {
        this.thumbnails.sprite = value
        localThumbnails.set(this.thumbnails)
      },
      setThumbnailsVTT(value: string) {
        this.thumbnails.vtt = value
        localThumbnails.set(this.thumbnails)
      },
      setThumbnailsOptions(
        options: Partial<{ backdropHeight: number; spotlightHeight: number }>
      ) {
        this.thumbnails = { ...this.thumbnails, ...options }
        localThumbnails.set(this.thumbnails)
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
        this.recycleVideo = DEFAULT_MAIN_SETTINGS.recycleVideo
        this.dash = structuredClone(DEFAULT_DASH_SETTINGS)
        this.restrictResolution = 0
        this.streamConfigUrl = ''
      },
      setStreamConfigUrl(value: string) {
        this.streamConfigUrl = value
      },
      // TODO implement plugins getter that would mix in playback_settings plugin if restrictResolution is set
      setRestrictResolution(value: number) {
        this.restrictResolution = value
        if (value) {
          if (!this.plugins.includes('playback_settings')) {
            this.plugins.push('playback_settings')
          }
        } else {
          this.plugins = this.plugins.filter((p) => p !== 'playback_settings')
        }
      },
      setRecycleVideo(value: boolean) {
        this.recycleVideo = value
        persistBasicSettings(this)
      },
      setGodMode() {
        this.godMode = true
      },
      async load() {
        if (!this.persistKey) {
          return
        }
        const res = await $fetch(`/api/settings/${this.persistKey}`)
        if (res.result) {
          const settings = parseSettings(res.result)
          if (typeof settings.autoplay !== 'undefined') {
            this.setAutoplay(settings.autoplay)
          }
          if (typeof settings.loop !== 'undefined') {
            this.setLoop(settings.loop)
          }
          if (typeof settings.mute !== 'undefined') {
            this.setMute(settings.mute)
          }
          if (typeof settings.playbackType !== 'undefined') {
            this.setPlaybackType(settings.playbackType)
          }
          if (typeof settings.poster !== 'undefined') {
            this.setPoster(settings.poster)
          }
          if (typeof settings.priorityTransport !== 'undefined') {
            this.setPriorityTransport(settings.priorityTransport)
          }
          if (typeof settings.sources !== 'undefined') {
            this.setSources(settings.sources)
          }
          if (typeof settings.restrictResolution !== 'undefined') {
            this.setRestrictResolution(settings.restrictResolution)
          }
          if (typeof settings.clips !== 'undefined') {
            this.setClipsText(settings.clips)
          }
          if (typeof settings.thumbnails !== 'undefined') {
            this.setThumbnailsURL(settings.thumbnails.sprite)
            this.setThumbnailsVTT(settings.thumbnails.vtt)
          }
          if (typeof settings.recycleVideo !== 'undefined') {
            this.setRecycleVideo(settings.recycleVideo)
          }
          if (typeof settings.dash !== 'undefined') {
            this.setDashSettings(settings.dash)
          }
          if (typeof settings.streamConfigUrl !== 'undefined') {
            this.setStreamConfigUrl(settings.streamConfigUrl)
          }
        }
      },
      async persist() {
        if (!this.persistKey) {
          this.persistKey = crypto.randomUUID()
          localPersistKey.set(this.persistKey)
        }
        const res = await $fetch(`/api/settings/${this.persistKey}`, {
          method: 'PUT',
          body: {
            autoplay: this.autoplay,
            clips: this.clips,
            dash: this.dash,
            debug: this.debug,
            loop: this.loop,
            mute: this.mute,
            playbackType: this.playbackType,
            plugins: this.plugins,
            poster: this.poster,
            priorityTransport: this.priorityTransport,
            restrictResolution: this.restrictResolution,
            recycleVideo: this.recycleVideo,
            sources: this.sources,
            thumbnails: this.thumbnails,
          } as PersistentSettings,
        })
        return this.persistKey
      },
    },
  })()

  function persistBasicSettings(state: State) {
    localBasic.set({
      autoplay: state.autoplay,
      loop: state.loop,
      mute: state.mute,
      playbackType: state.playbackType,
      priorityTransport: state.priorityTransport,
      recycleVideo: state.recycleVideo,
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
  return (
    settings?.streaming?.abr?.maxBitrate?.video !== -1 ||
    settings?.streaming?.abr?.initialBitrate?.video !== -1 ||
    settings?.streaming?.abr?.autoSwitchBitrate?.video !== true ||
    Object.keys(settings?.streaming?.abr?.additionalAbrRules ?? {}).length >
      0 ||
    settings?.streaming?.delay?.liveDelay !== undefined ||
    settings?.streaming?.liveCatchup?.maxDrift !== undefined ||
    settings?.streaming?.liveCatchup?.playbackRate?.max !== undefined ||
    settings?.streaming?.liveCatchup?.playbackRate?.min !== undefined
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
  try {
    return parseDashSettings(settings)
  } catch (e) {
    console.error(e)
    return DEFAULT_DASH_SETTINGS
  }
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
