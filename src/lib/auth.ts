import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {env} from "@/lib/env";
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from "@/drizzle/schemas";

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
});

const db = drizzle(client, {schema});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000","http://localhost:8787", "https://thisis.ooo/"],
});
