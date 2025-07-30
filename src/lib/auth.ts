import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {drizzle} from "drizzle-orm/libsql";
import {env} from "@/lib/env";


const db = drizzle({ connection: {
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
}});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
  emailAndPassword: {
    enabled: true,
  },
});
