import { describe, it, expect } from 'vitest'
import { getDisabledPlugins, getRegistrationOrder } from '../plugins'
import type { PluginName } from '../../types'

describe('plugins', () => {
  describe('getDisabledPlugins', () => {
    it.each([
      ['media_control_gear', ['media_control_gear'], true],
      ['media_control_gear', ['media_control', 'media_control_gear'], false],
      ['media_control_gear', [], true],
      [
        'media_control_level_selector',
        ['media_control_level_selector', 'media_control_gear'],
        true,
      ],
      [
        'media_control_level_selector',
        ['media_control_level_selector', 'media_control'],
        true,
      ],
      [
        'media_control_level_selector',
        ['media_control_level_selector', 'media_control', 'media_control_gear'],
        false,
      ],
      [
        'media_control_nerd_stats',
        [
          'media_control_nerd_stats',
          'media_control',
          'media_control_gear',
          'clappr_stats',
        ],
        false,
      ],
      [
        'media_control_nerd_stats',
        ['media_control_nerd_stats', 'media_control_gear', 'media_control'],
        true,
      ],
      [
        'media_control_nerd_stats',
        ['media_control_nerd_stats', 'clappr_stats', 'media_control'],
        true,
      ],
      [
        'media_control_nerd_stats',
        ['media_control_nerd_stats', 'clappr_stats', 'media_control_gear'],
        true,
      ],
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
          'media_control_level_selector',
          'media_control_nerd_stats',
          'clappr_stats',
          'media_control_gear',
          'media_control',
        ],
        [
          'clappr_stats',
          'media_control',
          'media_control_gear',
          'media_control_level_selector',
          'media_control_nerd_stats',
        ]
      ]
    ])('%s -> %s', (srcPlugins, expectOrder) => {
      const order = getRegistrationOrder(srcPlugins as PluginName[])
      expect(order).toEqual(expectOrder)
    })
  })
})
