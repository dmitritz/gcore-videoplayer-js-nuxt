export type StreamKind = 'stream' | 'video';
export type StreamDto = Record<string, unknown>;

export type PluginName =
  | 'audio_selector'
  | 'big_mute_button'
  | 'bottom_gear'
  | 'click_to_pause'
  | 'clips'
  | 'clappr_stats'
  | 'context_menu'
  | 'dvr_controls'
  | 'error_screen'
  | 'example_ui'
  | 'media_control'
  | 'nerd_stats'
  | 'level_selector'
  | 'multicamera'
  | 'pip'
  | 'playback_rate'
  | 'poster'
  | 'seek_time'
  | 'share'
  | 'spinner'
  | 'source_controller'
  | 'subtitles'
  | 'thumbnails'
  | 'volume_fade'

export const PLUGIN_NAMES: PluginName[] = [
  'audio_selector',
  'big_mute_button',
  'click_to_pause',
  'clips',
  'clappr_stats',
  'context_menu',
  'error_screen',
  'example_ui',
  'media_control',
  'nerd_stats',
  'dvr_controls',
  'bottom_gear',
  'level_selector',
  'multicamera',
  'pip',
  'playback_rate',
  'poster',
  'seek_time',
  'share',
  'spinner',
  'source_controller',
  'subtitles',
  'thumbnails',
  'volume_fade',
]
