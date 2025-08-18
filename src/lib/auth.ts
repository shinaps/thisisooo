import { createClient } from '@libsql/client/web'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { openAPI } from 'better-auth/plugins'
import { drizzle as drizzleTurso } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getDb } from '@/drizzle/client'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'
import * as schema from '@/drizzle/schema/turso/auth-schema'
import { env } from '@/lib/env'

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

const db = drizzleTurso(client, { schema })

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'http://localhost:3000', //
    'http://localhost:8787', //
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
    deleteUser: {
      enabled: true,
    },
  },
  telemetry: {
    enabled: false,
  },
  plugins: [openAPI()],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/callback/:id')) {
        const newSession = ctx.context.newSession
        if (newSession) {
          const db = getDb()
          const [user] = await db
            .select() //
            .from(userProfile)
            .where(eq(userProfile.userId, newSession.user.id))

          if (!user) {
            await db.insert(userProfile).values({
              userId: newSession.user.id,
              name: newSession.user.name,
              image: newSession.user.image,
            })
          }
        }
      }
    }),
  },
})

export type User = (typeof auth.$Infer.Session)['user']
