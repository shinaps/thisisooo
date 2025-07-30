import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {env} from "@/lib/env";
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
  emailAndPassword: {
    enabled: true,
  },
});
