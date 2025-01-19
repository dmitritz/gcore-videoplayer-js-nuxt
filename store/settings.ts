import type { PlaybackType, PlayerDebugTag, StreamMediaSource, TransportPreference } from '@gcorevideo/player';
import { defineStore } from 'pinia'

import usePersistence from '@/composables/use-persistence';
import type { StreamDto, StreamKind } from '~/types';
import { parseStreamDto } from '~/utils/fetch-stream';

type DashSettings = {
  maxBitrate: number;
}

type State = {
  apiToken: string | null;
  autoplay: boolean;
  dash: DashSettings;
  debug: PlayerDebugTag;
  experimental: Record<string, unknown>;
  loop: boolean;
  mute: boolean;
  playbackType: PlaybackType;
  plugins: string[];
  priorityTransport: TransportPreference;
  source: StreamSource;
  sources: string[];
  streamDto: StreamDto | null;
  streamId: number;
  streamKind: StreamKind;
}

export type StreamSource = {
  master: string | null;
  dash?: string;
  hlsMpegts?: string;
  hlsCmaf?: string;
  poster?: string;
}

type MainSettings = {
  autoplay: boolean;
  loop: boolean;
  mute: boolean;
  playbackType: PlaybackType;
  priorityTransport: TransportPreference;
}

type Getters = {
  multisources: () => StreamMediaSource[];
}

type Actions = {
  addPlugin(name: string): void;
  removePlugin(name: string): void;
  setApiToken(value: string): void;
  setAutoplay(value: boolean): void;
  setLoop(value: boolean): void;
  setDashSettings(value: Partial<DashSettings>): void;
  setMute(value: boolean): void;
  setPlaybackType(value: PlaybackType): void;
  setPriorityTransport(value: TransportPreference): void;
  setSources(value: string[]): void;
  setStreamDto(value: StreamDto | null, kind: StreamKind): void;
  setStreamId(value: number): void;
  setStreamKind(value: StreamKind): void;
  setStreamSource(value: StreamSource): void;
  reset(): void;
}

const DEFAULT_MAIN_SETTINGS: MainSettings = {
  autoplay: false,
  loop: false,
  mute: true,
  playbackType: 'vod',
  priorityTransport: 'auto',
}

const DEFAULT_PLUGINS = ['media_control', 'level_selector', 'bottom_gear', 'error_screen', 'poster']

const NO_SOURCE: StreamSource = {
  master: null,
}

const DEFAULT_STREAM_KIND: StreamKind = 'stream'

const DEFAULT_DASH_SETTINGS = {
  maxBitrate: 0,
}

const useSettingsStore = () => {
  const persistedSource = usePersistence<StreamSource>('settings.source', JSON.stringify, JSON.parse, NO_SOURCE);
  const persistedSources = usePersistence<string[]>('settings.sources', String, s => s.split(',').filter(Boolean), []);
  const persistedPlugins = usePersistence<string[]>(
    'settings.plugins',
    (a: string[]) => a.join(),
    (v: string) => v.split(','),
    DEFAULT_PLUGINS
  );

  const persistedBasic = usePersistence<MainSettings>('settings.basic', JSON.stringify, JSON.parse, DEFAULT_MAIN_SETTINGS);
  const persistedId = usePersistence('settings.streamId', String, Number, 0);
  const persistedToken = usePersistence('settings.apiToken', id, id, '');
  const persistKind = usePersistence<StreamKind>('settings.streamKind', id, id, 'stream');

  const url = useRequestURL()
  if (url.searchParams.has('autoplay') || url.searchParams.has('mute') || url.searchParams.has('loop') || url.searchParams.has('priority_transport') || url.searchParams.has('playback_type')) {
    const pm = persistedBasic.get();
    persistedBasic.set({
      ...persistedBasic.get(),
      autoplay: parseBoolean(url.searchParams.get('autoplay'), pm.autoplay ?? DEFAULT_MAIN_SETTINGS.autoplay),
      loop: parseBoolean(url.searchParams.get('loop'), pm.loop ?? DEFAULT_MAIN_SETTINGS.loop),
      mute: parseBoolean(url.searchParams.get('mute'), pm.mute ?? DEFAULT_MAIN_SETTINGS.mute),
      playbackType: parseSelectOption<PlaybackType>(['vod', 'live'], url.searchParams.get('playback_type'), 'vod') ?? pm.playbackType ?? DEFAULT_MAIN_SETTINGS.playbackType, // TODO sanitize
      priorityTransport: transportPreference(url.searchParams.get('priority_transport'), pm.priorityTransport),
    })
  }
  const debug = debugTag(url.searchParams.get('debug') || 'all') ?? 'all';
  const apiToken = url.searchParams.get('token') ?? '';
  const parsedStreamId = parseStreamId(url.searchParams.get('source') ?? '');
  persistedToken.set(apiToken);
  persistKind.set(parsedStreamId[0]);
  persistedId.set(parsedStreamId[1]);
  const streamKind = persistKind.get();
  const streamId = persistedId.get();
  const {
    autoplay,
    mute,
    loop,
    playbackType = 'vod',
    priorityTransport
  } = persistedBasic.get();

  const usePersistedPlugins = !url.searchParams.has('plugins')
  const plugins = (usePersistedPlugins ? persistedPlugins.get() : url.searchParams.get('plugins')?.split(',')) ?? []
  const source = persistedSource.get();
  const sources = persistedSources.get();

  return defineStore<'settings', State, Getters, Actions>('settings', {
    state: () => ({
      apiToken,
      autoplay,
      dash: DEFAULT_DASH_SETTINGS,
      debug,
      experimental: {},
      loop,
      mute,
      playbackType,
      plugins,
      priorityTransport,
      source,
      sources,
      streamDto: null,
      streamId,
      streamKind,
    }),
    getters: {
      multisources() {
        if (!this.source.master && !this.source.dash && !this.source.hlsMpegts && !this.source.hlsCmaf) {
          return [];
        }
        const item = {
          description: '',
          dvr: false,
          hlsCmafUrl: this.source.hlsCmaf ?? null,
          hlsMpegtsUrl: this.source.hlsMpegts ?? null,
          id: 1,
          live: true,
          priorityTransport: this.priorityTransport,
          poster: this.source.poster ?? null,
          projection: null,
          screenshot: null,
          source: this.source.master,
          sourceDash: this.source.dash ?? null,
          sprite: null,
          title: 'Live stream',
          vtt: null,
        };
        return [item];
      },
    },
    actions: {
      addPlugin(name: string) {
        if (this.plugins.includes(name)) {
          return;
        }
        this.plugins.push(name);
        if (name === "clappr_nerd_stats" && !this.plugins.includes("clappr_stats")) {
          this.plugins.push("clappr_stats");
        }
        persistedPlugins.set(this.plugins);
      },
      removePlugin(name: string) {
        const index = this.plugins.indexOf(name);
        if (index === -1) {
          return;
        }
        this.plugins.splice(index, 1);
        if (name === "clappr_stats" && this.plugins.includes("clappr_nerd_stats")) {
          this.plugins.splice(this.plugins.indexOf("clappr_nerd_stats"), 1);
        }
        persistedPlugins.set(this.plugins);
      },
      setApiToken(value: string) {
        this.apiToken = value;
      },
      setAutoplay(value: boolean) {
        this.autoplay = value;
        persistBasicSettings(this)
      },
      setDashSettings(value: Partial<DashSettings>) {
        this.dash = { ...this.dash, ...value };
      },
      setLoop(value: boolean) {
        this.loop = value;
        persistBasicSettings(this)
      },
      setMute(value: boolean) {
        this.mute = value;
        persistBasicSettings(this)
      },
      setPlaybackType(value: PlaybackType) {
        this.playbackType = value;
        persistBasicSettings(this)
      },
      setPriorityTransport(value: TransportPreference) {
        this.priorityTransport = value;
        persistBasicSettings(this)
      },
      setSources(value: string[]) {
        this.sources = value;
        persistedSources.set(value);
      },
      setStreamDto(value: StreamDto | null, kind: StreamKind = 'stream') {
        this.streamDto = value;
        if (value) {
          this.setStreamSource(parseStreamDto(value, kind));
        } else {
          this.setStreamSource(NO_SOURCE);
        }
      },
      setStreamId(value: number) {
        this.streamId = value
      },
      setStreamKind(value: StreamKind) {
        this.streamKind = value
      },
      setStreamSource(value: StreamSource) {
        this.source = value;
        persistedSource.set(value);
      },
      reset() {
        this.autoplay = false;
        this.mute = true;
        this.loop = false;
        this.plugins = DEFAULT_PLUGINS;
        this.priorityTransport = 'auto';
      }
    },
  })();

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
    return input as PlayerDebugTag;
  }
}

function transportPreference(input: string | null, def: TransportPreference = 'auto'): TransportPreference {
  return parseSelectOption<TransportPreference>(['auto', 'hls', 'dash', 'mpegts'], input, def)
}

function parseSelectOption<T extends string>(options: string[], input: string | null, def: T): T {
  if (input === null) {
    return def;
  }
  return options.includes(input) ? input as T : def;
}

function parseBoolean(val: string | null, defaultValue = false): boolean {
  if (val === null) {
    return defaultValue;
  }
  return ['true', 'yes', '1'].includes(val);
}

function parseStreamId(input: string): [StreamKind, number] {
  const parts = input.split(':');
  if (parts.length !== 2) {
    return [DEFAULT_STREAM_KIND, 0];
  }
  return [parts[0] as StreamKind, Number(parts[1])];
}

function id<T = string>(a: string) {
  return a as T
}

export default useSettingsStore;
