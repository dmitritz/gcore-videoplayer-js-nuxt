import { PLUGIN_NAMES, type PluginName } from '../types'

export function getDisabledPlugins(plugins: PluginName[]): PluginName[] {
  const disabled: PluginName[] = []
  PLUGIN_DEPS_CHECK_CHAIN.forEach(([plugin, deps]) => {
    // if (!plugins.includes(plugin)) {
    //   return
    // }
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
  addMediaControlDeps({
    media_control_level_selector: ['media_control_gear'],
    media_control_nerd_stats: ['media_control_gear', 'clappr_stats'],
  })
)

function addMediaControlDeps(
  origRules: Partial<Record<PluginName, PluginName[]>>
): Partial<Record<PluginName, PluginName[]>> {
  const rules = { ...origRules }
  PLUGIN_NAMES.forEach((plugin) => {
    if (plugin.startsWith('media_control_')) {
      if (rules[plugin]) {
        rules[plugin].push('media_control')
      } else {
        rules[plugin] = ['media_control']
      }
    }
  })
  return rules
}

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


