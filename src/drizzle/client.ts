import 'server-only'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'

export const getDb = async () => {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle(env.D1)
}
