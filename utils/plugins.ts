import { type PluginName } from '../types'

export function getDisabledPlugins(plugins: PluginName[]): PluginName[] {
  const disabled: PluginName[] = []
  PLUGIN_DEPS_CHECK_CHAIN.forEach(([plugin, deps]) => {
    for (const dep of deps) {
      if (!plugins.includes(dep) || disabled.includes(dep)) {
        disabled.push(plugin)
        return
      }
    }
  })
  return disabled
}

export function getRegistrationOrder(plugins: PluginName[]): PluginName[] {
  const independent: PluginName[] = []
  const dependent: PluginName[] = []
  const DEPS = PLUGIN_DEPS_CHECK_CHAIN.map(([p]) => p)
  plugins.forEach(plugin => {
    if (!DEPS.includes(plugin)) {
      independent.push(plugin)
    } else {
      dependent.push(plugin)
    }
  })
  return independent.concat(
    PLUGIN_DEPS_CHECK_CHAIN.map(([p]) => p).filter(p => dependent.includes(p))
  )
}

const PLUGIN_DEPS_CHECK_CHAIN = buildPluginDepsCheckChain(
  {
    audio_tracks: ['media_control'],
    bottom_gear: ['media_control'],
    cc: ['media_control'],
    clips: ['media_control'],
    dvr_controls: ['media_control'],
    level_selector: ['media_control','bottom_gear'],
    multicamera: ['media_control'],
    nerd_stats: ['media_control','bottom_gear', 'clappr_stats'],
    playback_rate: ['media_control','bottom_gear'],
    pip: ['media_control'],
    seek_time: ['media_control'],
    share: ['media_control'],
    thumbnails: ['media_control'],
  }
)

function buildPluginDepsCheckChain(
  rules: Partial<Record<PluginName, PluginName[]>>
): Array<[PluginName, PluginName[]]> {
  const checked: PluginName[] = []
  const queue: PluginName[] = Object.keys(rules) as PluginName[]
  let iter = 0 // circuit breaker, TODO implement a better way
  while (queue.length > 0) {
    for (const p of queue.splice(0, queue.length)) {
      const deps = rules[p]
      if (deps?.every((dep) => !(dep in rules) || checked.includes(dep))) {
        checked.push(p)
      } else {
        queue.push(p)
      }
    }
    iter++
    if (iter > 10) {
      throw new Error(
        'Plugin deps chain build took too many iterations, probably circular dependency'
      )
    }
  }
  return checked.map((p) => [p, rules[p]] as [PluginName, PluginName[]])
}


