import type { PlayerDebugTag, StreamMediaSource, TransportPreference } from '@gcorevideo/player';
import { defineStore } from 'pinia'

import usePersistence from '@/composables/use-persistence';

type State = {
  autoplay: boolean;
  debug: PlayerDebugTag;
  loop: boolean;
  mute: boolean;
  plugins: string[];
  priorityTransport: TransportPreference;
  source: StreamSource;
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
  setAutoplay(value: boolean): void;
  setLoop(value: boolean): void;
  setMute(value: boolean): void;
  setPriorityTransport(value: TransportPreference): void;
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

const DEFAULT_SOURCE: StreamSource = {
  master: null,
}

const useSettingsStore = () => {
  const persistedSource = usePersistence<StreamSource>('settings.source', JSON.stringify, JSON.parse, DEFAULT_SOURCE);
  const persistedPlugins = usePersistence<string[]>(
    'settings.plugins',
    (a: string[]) => a.join(),
    (v: string) => v.split(','),
    DEFAULT_PLUGINS
  );
  const persistedMain = usePersistence<MainSettings>('settings.basic', JSON.stringify, JSON.parse, DEFAULT_MAIN_SETTINGS);

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
  // const autoplay = parseBoolean(url.searchParams.get('autoplay'), false);
  // const mute = parseBoolean(url.searchParams.get('mute'), true);
  // const loop = parseBoolean(url.searchParams.get('loop'), false);
  // const priorityTransport = transportPreference(url.searchParams.get('priority_transport') || 'auto')
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
      autoplay,
      debug,
      loop,
      mute,
      plugins,
      priorityTransport,
      source,
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

export default useSettingsStore;
