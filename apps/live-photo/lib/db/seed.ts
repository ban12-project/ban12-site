import { config } from 'dotenv'
import { desc } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

config({ path: ['.env'] })

const db = drizzle(process.env.DATABASE_URL!)

async function main() {

  console.log('done')
}

main()
