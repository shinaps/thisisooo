import 'server-only'

import { createClient } from '@libsql/client/web'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '@/drizzle/schema/auth-schema'
import { env } from '@/lib/env'

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

const db = drizzle(client, { schema })

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'http://localhost:3000', //
    'https://next-dev.shinaps.jp',
    'https://next-preview.shinaps.jp',
    'https://thisis.ooo/',
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: true,
        unique: true,
        defaultValue: () => crypto.randomUUID(),
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
})

export type User = (typeof auth.$Infer.Session)['user']
