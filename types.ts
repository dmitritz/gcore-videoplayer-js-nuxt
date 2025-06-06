export type StreamKind = 'stream' | 'video';
export type StreamDto = Record<string, unknown>;

export type PluginName =
  | 'audio_tracks'
  | 'big_mute_button'
  | 'bottom_gear'
  | 'cc'
  | 'click_to_pause'
  | 'clips'
  | 'clappr_stats'
  | 'cmcd'
  | 'context_menu'
  | 'dvr_controls'
  | 'error_screen'
  | 'example_ui'
  | 'favicon'
  | 'media_control'
  | 'nerd_stats'
  | 'level_selector'
  | 'multicamera'
  | 'pip'
  | 'playback_rate'
  | 'playback_settings'
  | 'poster'
  | 'seek_time'
  | 'skip_time'
  | 'share'
  | 'spinner'
  | 'source_controller'
  | 'thumbnails'
  | 'volume_fade'

export const PLUGIN_NAMES: PluginName[] = [
  'audio_tracks',
  'big_mute_button',
  'cc',
  'click_to_pause',
  'clips',
  'clappr_stats',
  'context_menu',
  'error_screen',
  'example_ui',
  'favicon',
  'media_control',
  'nerd_stats',
  'dvr_controls',
  'bottom_gear',
  'level_selector',
  'multicamera',
  'pip',
  'playback_rate',
  // playback_settings is a phantom plugin
  'poster',
  'seek_time',
  'share',
  'spinner',
  'source_controller',
  'thumbnails',
  'volume_fade',
]
