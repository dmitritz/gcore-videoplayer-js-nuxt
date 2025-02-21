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
  | 'nerd_stats'
  | 'media_control_dvr'
  | 'bottom_gear'
  | 'level_selector'
  | 'media_control_multicamera'
  | 'pip'
  | 'playback_rate'
  | 'media_control_seek_time'
  | 'media_control_share'
  | 'subtitles'
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
  'nerd_stats',
  'media_control_dvr',
  'bottom_gear',
  'level_selector',
  'media_control_multicamera',
  'pip',
  'playback_rate',
  'media_control_seek_time',
  'media_control_share',
  'subtitles',
  'media_control_thumbnails',
  'poster',
  'spinner',
  'source_controller',
  'volume_fade',
]
