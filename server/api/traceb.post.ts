import { consola } from 'consola'

// TODO protect with a token
export default defineEventHandler(async function (event) {
  event.node.res.end()
  const { records } = await readBody(event) // TODO validate
  for (const { message, detail, time } of records) {
    consola.info('%s: TRACE %s %o', new Date(time).toISOString(), message, detail)
  }
})
