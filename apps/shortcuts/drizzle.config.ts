import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  out: './lib/db/migrations',
  schema: './lib/db/schema.ts',
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
})
