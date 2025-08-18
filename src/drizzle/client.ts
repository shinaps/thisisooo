import 'server-only'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import { cache } from 'react'

export const getDb = cache(() => {
  const { env } = getCloudflareContext()
  return drizzle(env.D1)
})

export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle(env.D1)
})
