import { describe, it, expect } from 'vitest'
import { getDisabledPlugins, getRegistrationOrder } from '../plugins'
import type { PluginName } from '../../types'

describe('plugins', () => {
  describe('getDisabledPlugins', () => {
    it.each([
      ['audio_tracks', [], true],
      ['audio_tracks', ['media_control'], false],
      ['bottom_gear', ['bottom_gear'], true],
      ['bottom_gear', ['media_control'], false],
      ['bottom_gear', [], true],
      ['clips', [], true],
      ['clips', ['media_control'], false],
      ['dvr_controls', [], true],
      ['dvr_controls', ['media_control'], false],
      ['level_selector', ['level_selector', 'bottom_gear'], true],
      ['level_selector', ['level_selector', 'media_control'], true],
      [
        'level_selector',
        ['level_selector', 'media_control', 'bottom_gear'],
        false,
      ],
      ['multicamera', [], true],
      ['multicamera', ['media_control'], false],
      [
        'nerd_stats',
        ['nerd_stats', 'media_control', 'bottom_gear', 'clappr_stats'],
        false,
      ],
      ['nerd_stats', ['bottom_gear', 'media_control'], true],
      ['nerd_stats', ['clappr_stats', 'media_control'], true],
      ['nerd_stats', ['clappr_stats', 'bottom_gear'], true],
      ['cc', ['media_control'], false],
      ['cc', [], true],
      ['playback_rate', ['media_control', 'bottom_gear'], false],
      ['playback_rate', ['media_control'], true],
      ['playback_rate', ['bottom_gear'], true],
      ['playback_rate', [], true],
      ['pip', ['media_control'], false],
      ['pip', [], true],
      ['seek_time', ['media_control'], false],
      ['seek_time', [], true],
      ['share', ['media_control'], false],
      ['share', [], true],
      ['thumbnails', ['media_control'], false],
      ['thumbnails', [], true],
      // TODO
    ])(
      '%s | %s : %s',
      (plugin: string, srcPlugins: string[], expectDisabled: boolean) => {
        const disabledPlugins = getDisabledPlugins(srcPlugins as PluginName[])
        if (expectDisabled) {
          expect(disabledPlugins).toContain(plugin)
        } else {
          expect(disabledPlugins).not.toContain(plugin)
        }
      }
    )
  })
  describe('getRegistrationOrder', () => {
    it.each([
      [
        [
          'level_selector',
          'nerd_stats',
          'clappr_stats',
          'bottom_gear',
          'media_control',
        ],
        [
          'clappr_stats',
          'media_control',
          'bottom_gear',
          'level_selector',
          'nerd_stats',
        ],
      ],
    ])('%s -> %s', (srcPlugins, expectOrder) => {
      const order = getRegistrationOrder(srcPlugins as PluginName[])
      expect(order).toEqual(expectOrder)
    })
  })
})
