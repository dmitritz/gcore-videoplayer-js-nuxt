import type { PlayerDebugTag, StreamMediaSource, TransportPreference } from '@gcorevideo/player';
import { defineStore } from 'pinia'

import usePersistence from '@/composables/use-persistence';
import type { StreamDto, StreamKind } from '~/types';
import { parseStreamDto } from '~/utils/fetch-stream';

type State = {
  apiToken: string | null;
  autoplay: boolean;
  debug: PlayerDebugTag;
  loop: boolean;
  mute: boolean;
  plugins: string[];
  priorityTransport: TransportPreference;
  source: StreamSource;
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
  setMute(value: boolean): void;
  setPriorityTransport(value: TransportPreference): void;
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
  priorityTransport: 'auto',
}

const DEFAULT_PLUGINS = ['media_control', 'level_selector', 'bottom_gear', 'error_screen', 'poster']

const NO_SOURCE: StreamSource = {
  master: null,
}

const DEFAULT_STREAM_KIND: StreamKind = 'stream'

const useSettingsStore = () => {
  const persistedSource = usePersistence<StreamSource>('settings.source', JSON.stringify, JSON.parse, NO_SOURCE);
  const persistedPlugins = usePersistence<string[]>(
    'settings.plugins',
    (a: string[]) => a.join(),
    (v: string) => v.split(','),
    DEFAULT_PLUGINS
  );

  const persistedMain = usePersistence<MainSettings>('settings.basic', JSON.stringify, JSON.parse, DEFAULT_MAIN_SETTINGS);
  const persistedId = usePersistence('settings.streamId', String, Number, 0);
  const persistedToken = usePersistence('settings.apiToken', id, id, '');
  const persistKind = usePersistence<StreamKind>('settings.streamKind', id, id, 'stream');

  const url = useRequestURL()
  if (url.searchParams.has('autoplay') || url.searchParams.has('mute') || url.searchParams.has('loop') || url.searchParams.has('priority_transport')) {
    persistedMain.set({
      ...persistedMain.get(),
      autoplay: parseBoolean(url.searchParams.get('autoplay'), DEFAULT_MAIN_SETTINGS.autoplay),
      mute: parseBoolean(url.searchParams.get('mute'), DEFAULT_MAIN_SETTINGS.mute),
      loop: parseBoolean(url.searchParams.get('loop'), DEFAULT_MAIN_SETTINGS.loop),
      priorityTransport: transportPreference(url.searchParams.get('priority_transport') ?? ''),
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
    priorityTransport
  } = persistedMain.get();

  const usePersistedPlugins = !url.searchParams.has('plugins')
  const plugins = (usePersistedPlugins ? persistedPlugins.get() : url.searchParams.get('plugins')?.split(',')) ?? []
  const source = persistedSource.get();

  return defineStore<'settings', State, Getters, Actions>('settings', {
    state: () => ({
      apiToken,
      autoplay,
      debug,
      loop,
      mute,
      plugins,
      priorityTransport,
      source,
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
        persistedMain.set({ autoplay: value, mute: this.mute, loop: this.loop, priorityTransport: this.priorityTransport });
      },
      setLoop(value: boolean) {
        this.loop = value;
        persistedMain.set({ autoplay: this.autoplay, mute: this.mute, loop: value, priorityTransport: this.priorityTransport });
      },
      setMute(value: boolean) {
        this.mute = value;
        persistedMain.set({ autoplay: this.autoplay, mute: value, loop: this.loop, priorityTransport: this.priorityTransport });
      },
      setPriorityTransport(value: TransportPreference) {
        this.priorityTransport = value;
        persistedMain.set({ autoplay: this.autoplay, mute: this.mute, loop: this.loop, priorityTransport: value });
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
}

function debugTag(input: string): PlayerDebugTag | undefined {
  if (['all', 'clappr', 'dash', 'hls', 'none'].includes(input)) {
    return input as PlayerDebugTag;
  }
}

function transportPreference(input: string): TransportPreference {
  if (['hls', 'dash', 'mpegts'].includes(input)) {
    return input as TransportPreference;
  }
  return 'auto';
}

function parseBoolean(val: string | null, defaultValue: boolean): boolean {
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
