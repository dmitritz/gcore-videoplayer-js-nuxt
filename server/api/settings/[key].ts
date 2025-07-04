import { Redis } from '@upstash/redis'
import consola from 'consola'
import { defineEventHandler } from 'h3'

import { parseSettings } from '~/store/marshal'

const config = useRuntimeConfig()
const redis = new Redis({
  url: config.redisUrl,
  token: config.redisToken,
})

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key is required',
    })
  }

  consola.info(`${event.method} settings/${key}`)

  switch (event.method) {
    case 'GET':
      // Fetch data from Redis
      const result = await redis.get(key)
      return { result }
    case 'PUT':
      const body = await readBody(event)
      await redis.set(key, validateSettings(body))
      return { result: 'ok' }
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
      })
  }
})

function validateSettings(body: any) {
  try {
    return parseSettings(body)
  } catch (error) {
    consola.error(error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid settings',
    })
  }
}
