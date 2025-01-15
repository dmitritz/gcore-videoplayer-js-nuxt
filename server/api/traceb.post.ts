import { consola } from 'consola'
import ms from 'ms'

// TODO protect with a token
export default defineEventHandler(async function (event) {
  event.node.res.end()
  const { records, tags } = await readBody(event) // TODO validate
  let baseTime = records[0].time
  for (const { message, detail, time } of records) {
    const d = time - baseTime
    const t = d ? `+${ms(d)}` : ''
    const tokens = formatTokens({
      ...tags,
      ...detail,
    })
    consola.info('TRACE %s %s [%s]', t, message, tokens)
  }
})

function formatTokens(tokens: Record<string, unknown>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(' ')
}
