import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle/d1',
  schema: './src/drizzle/schema/d1',
  dialect: 'sqlite',
})
