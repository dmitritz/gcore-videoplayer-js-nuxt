export type StreamKind = 'stream' | 'video';
export type StreamDto = Record<string, unknown>;

export type PluginName =
  | 'big_mute_button'
  | 'click_to_pause'
  | 'clappr_stats'
  | 'disable_controls'
  | 'error_screen'
  | 'example_ui'
  | 'media_control'
  | 'media_control_audio_selector'
  | 'media_control_nerd_stats'
  | 'media_control_dvr'
  | 'media_control_gear'
  | 'media_control_level_selector'
  | 'media_control_multicamera'
  | 'media_control_pip'
  | 'media_control_playback_rate'
  | 'media_control_seek_time'
  | 'media_control_share'
  | 'media_control_subtitles'
  | 'media_control_thumbnails'
  | 'poster'
  | 'spinner'
  | 'source_controller'
  | 'volume_fade'

export const PLUGIN_NAMES: PluginName[] = [
  'big_mute_button',
  'click_to_pause',
  'clappr_stats',
  'disable_controls',
  'error_screen',
  'example_ui',
  'media_control',
  'media_control_audio_selector',
  'media_control_nerd_stats',
  'media_control_dvr',
  'media_control_gear',
  'media_control_level_selector',
  'media_control_multicamera',
  'media_control_pip',
  'media_control_playback_rate',
  'media_control_seek_time',
  'media_control_share',
  'media_control_subtitles',
  'media_control_thumbnails',
  'poster',
  'spinner',
  'source_controller',
  'volume_fade',
]
