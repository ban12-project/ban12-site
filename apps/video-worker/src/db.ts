import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set.')
  process.exit(1)
}

export const sql = postgres(process.env.DATABASE_URL)
