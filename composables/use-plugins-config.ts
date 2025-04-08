import { onBeforeMount } from 'vue'
import {
  Player,
  AudioTracks,
  BigMuteButton,
  BottomGear,
  ClapprStats,
  ClickToPause,
  Clips,
  ClosedCaptions,
  DvrControls,
  ErrorScreen,
  Favicon,
  MediaControl,
  MultiCamera,
  NerdStats,
  PictureInPicture,
  PlaybackRate,
  Poster,
  QualityLevels,
  SeekTime,
  Share,
  SourceController,
  SpinnerThreeBounce,
  Thumbnails,
  ContextMenu,
  type PlayerPluginConstructor,
  trace,
  VolumeFade,
  SkipTime,
  // Logo,
} from '@gcorevideo/player'

import useSettingsStore from '../store/settings'
import { ExampleUI } from '../components/plugins/ExampleUI'
import type { PluginName } from '../types'
import assert from 'assert'

type Plugins = Partial<Record<PluginName, PlayerPluginConstructor>>
const _P: PlayerPluginConstructor[] = [
  AudioTracks,
  BigMuteButton,
  BottomGear,
  ClapprStats,
  NerdStats,
  ClickToPause,
  Clips,
  ClosedCaptions,
  ContextMenu,
  DvrControls,
  ErrorScreen,
  ExampleUI,
  Favicon,
  // Logo,
  MediaControl,
  MultiCamera,
  PictureInPicture,
  PlaybackRate,
  Poster,
  QualityLevels,
  SeekTime,
  Share,
  SkipTime,
  SourceController,
  SpinnerThreeBounce,
  Thumbnails,
  VolumeFade,
]
const PLUGINS: Plugins = _P.reduce((ps: Plugins, p: PlayerPluginConstructor) => {
  ps[p.prototype.name as PluginName] = p
  return ps
}, {}) as Plugins

const T = 'app.use-plugins-config'

const usePluginsConfig = () => {
  const settings = useSettingsStore()
  const { disabledPlugins } = usePluginsDeps()

  onBeforeMount(configurePlugins)
  onBeforeUnmount(() => {
    trace(`${T} unregister plugins`)
    settings.plugins.forEach((name) => {
      trace(`${T} unregister plugin`, {
        name
      })
      const plugin = PLUGINS[name as PluginName]
      assert(plugin, `Plugin ${name} not found`)
      Player.unregisterPlugin(plugin.prototype.name) // TODO or just name
    })
  })

  function configurePlugins() {
    trace(`${T} register plugins`)
    getRegistrationOrder(settings.plugins).forEach((name) => {
      const plugin = PLUGINS[name as PluginName]
      assert(plugin, `Plugin ${name} not found`)
      if (!disabledPlugins.value.includes(name)) {
        Player.registerPlugin(plugin as PlayerPluginConstructor)
      }
    })
  }
}

export default usePluginsConfig
