import { onBeforeMount } from 'vue'
import {
  Player,
  type PlayerPlugin,
  AudioSelector,
  BigMuteButton,
  BottomGear,
  ClapprNerdStats,
  ClapprStats,
  ClickToPause,
  ClosedCaptions,
  DvrControls,
  ErrorScreen,
  Favicon,
  LevelSelector,
  MediaControl,
  MultiCamera,
  PictureInPicture,
  PlaybackRate,
  Poster,
  SeekTime,
  Share,
  SourceController,
  SpinnerThreeBounce,
  Thumbnails,
  VolumeFade,
  ContextMenu,
  type PlayerPluginConstructor,
  trace,
  Logo,
} from '@gcorevideo/player'

import useSettingsStore from '../store/settings'
import { ExampleUI } from '../components/plugins/ExampleUI'
import type { PluginName } from '../types'
import assert from 'assert'

type Plugins = Partial<Record<PluginName, PlayerPluginConstructor>>
const _P: PlayerPluginConstructor[] = [
  AudioSelector,
  BigMuteButton,
  BottomGear,
  ClapprStats,
  ClapprNerdStats,
  ClickToPause,
  ClosedCaptions,
  ContextMenu,
  DvrControls,
  ErrorScreen,
  ExampleUI,
  Favicon,
  LevelSelector,
  // Logo,
  MediaControl,
  MultiCamera,
  PictureInPicture,
  PlaybackRate,
  Poster,
  SeekTime,
  Share,
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
      Player.unregisterPlugin(plugin?.prototype.name) // TODO or just name
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
