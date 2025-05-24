import { unstable_cache } from 'next/cache'
import { drizzle } from 'drizzle-orm/neon-http'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('Not valid database url')

const db = drizzle(connectionString)
