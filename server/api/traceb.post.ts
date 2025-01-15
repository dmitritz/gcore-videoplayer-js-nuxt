import { consola } from 'consola'
import ms from 'ms'

// TODO protect with a token
export default defineEventHandler(async function (event) {
  const { records, tags } = await readBody(event) // TODO validate
  let baseTime = records[0].time
  for (const { message, detail, time } of records) {
    const d = time - baseTime
    const t = d ? `+${ms(d)}` : ''
    const tokens = formatTokens({
      ...tags,
      ...detail,
    })
    consola.info('TRACE %s %s [%s]', t, message, tokens.length > 4000 ? `${tokens.substring(0, 4000)}...` : tokens)
  }
  event.node.res.end()
})

function formatTokens(tokens: Record<string, unknown>): string {
  return Object.entries(tokens)
    .map(([key, value]) => formatCompoundToken(key, value))
    .join(' ')
}

function formatCompoundToken(key: string, value: unknown): string {
  if (key.length >= 20) {
    return `${key}=${value}`
  }
  if (value === undefined) {
    return ''
  }
  if (
    value === null ||
    ['string', 'number', 'boolean'].includes(typeof value)
  ) {
    return `${key}=${value}`
  }
  if (Array.isArray(value)) {
    return `${key}=${value.join(',')}`
  }
  return Object.entries(value)
    .map(([k, v]) => formatCompoundToken(`${key}.${k}`, v))
    .join(' ')
}
