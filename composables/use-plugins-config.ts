import { onBeforeMount, onMounted, watch } from 'vue'
import {
  Player,
  type PlayerPlugin,
  // AudioSelector,
  BigMuteButton,
  BottomGear,
  ClapprNerdStats,
  ClapprStats,
  ClickToPause,
  DvrControls,
  ErrorScreen,
  LevelSelector,
  MediaControl,
  MultiCamera,
  PictureInPicture,
  PlaybackRate,
  Poster,
  Subtitles,
  SourceController,
  SpinnerThreeBounce,
  Thumbnails,
  VolumeFade,
  ContextMenu,
} from '@gcorevideo/player'

import useSettingsStore from '../store/settings'
import { ExampleUI } from '../components/plugins/ExampleUI'
import type { PluginName } from '../types'

const PLUGINS: Partial<Record<PluginName, PlayerPlugin>> = {
  big_mute_button: BigMuteButton,
  bottom_gear: BottomGear,
  click_to_pause: ClickToPause,
  context_menu: ContextMenu,
  dvr_controls: DvrControls,
  clappr_stats: ClapprStats,
  nerd_stats: ClapprNerdStats,
  error_screen: ErrorScreen,
  example_ui: ExampleUI,
  level_selector: LevelSelector,
  media_control: MediaControl,
  media_control_multicamera: MultiCamera,
  pip: PictureInPicture,
  playback_rate: PlaybackRate,
  // media_control_seek_time: SeekTime,
  // media_control_share: Share,
  subtitles: Subtitles,
  thumbnails: Thumbnails,
  poster: Poster,
  spinner: SpinnerThreeBounce,
  source_controller: SourceController,
  volume_fade: VolumeFade,
}

const usePluginsConfig = () => {
  const settings = useSettingsStore()
  const { disabledPlugins } = usePluginsDeps()

  onBeforeMount(configurePlugins)

  function configurePlugins() {
    getRegistrationOrder(settings.plugins).forEach((name) => {
      const plugin = PLUGINS[name as PluginName]
      if (!disabledPlugins.value.includes(name as PluginName)) {
        Player.registerPlugin(plugin as PlayerPlugin)
      }
    })
  }
}

export default usePluginsConfig
