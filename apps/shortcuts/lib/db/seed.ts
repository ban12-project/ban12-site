import { config } from 'dotenv'
import { desc, eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'

import { answerTranslate } from '#/lib/prompt'

import { album, collection, LocalizedString, shortcut } from './schema'

config({ path: ['.env.production.local', '.env.local', '.env'] })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('Not valid database url')

export const db = drizzle(connectionString)

const fallback = (input = ''): LocalizedString => {
  return {
    en: input,
    'zh-CN': input,
    ja: input,
    sv: input,
    ar: input,
  }
}
async function main() {
  // const data = await db.select({ name: shortcut.name, description: shortcut.description }).from(shortcut).where(eq(shortcut.uuid, '00ede1e9-5d1e-42a3-8555-6e7f2d0788e2'))
  // console.log(data[0].description)

  //   await db.execute(sql`DO $$ BEGIN
  //   ALTER TABLE "album" ALTER COLUMN "title" TYPE jsonb USING "title"::jsonb;
  //   ALTER TABLE "album" ALTER COLUMN "description" TYPE jsonb USING "description"::jsonb;
  // END $$;`)

  //   DO $$ BEGIN
  //   ALTER TABLE "collection" ALTER COLUMN "title" TYPE jsonb USING "title"::jsonb;
  // END $$;

  // await db.execute(sql`
  //   DO $$ BEGIN
  //     ALTER TABLE "shortcut" ALTER COLUMN "name" TYPE jsonb USING "name"::jsonb;
  //     ALTER TABLE "shortcut" ALTER COLUMN "description" TYPE jsonb USING "description"::jsonb;
  //     ALTER TABLE "shortcut" ALTER COLUMN "description" SET NOT NULL;
  //   END $$;
  //   `)

  // await migrateAlbum()
  // await migrateShortcut()
  // await migrateCollection()

  console.log('done')
}

async function migrateAlbum() {
  const data = (
    await db
      .select({
        title: album.title,
        description: album.description,
        id: album.id,
      })
      .from(album)
  ).filter(
    (item) =>
      typeof item.title === 'string' || typeof item.description === 'string',
  )

  for (const { title, description, id } of data) {
    console.log(JSON.stringify({ id, title, description }))

    const [p1, p2] = await Promise.allSettled([
      answerTranslate(title as unknown as string),
      answerTranslate(description as unknown as string),
    ])

    const data: { title: LocalizedString; description: LocalizedString } = {
      title: fallback(typeof title === 'string' ? title : ''),
      description: fallback(typeof description === 'string' ? description : ''),
    }

    if (p1.status === 'fulfilled') data.title = p1.value
    if (p2.status === 'fulfilled') data.description = p2.value

    console.log(JSON.stringify(data))

    await db
      .update(album)
      .set({ title: data.title, description: data.description })
      .where(eq(album.id, id))
  }
}

async function migrateShortcut() {
  const data = (
    await db
      .select({
        name: shortcut.name,
        description: shortcut.description,
        uuid: shortcut.uuid,
      })
      .from(shortcut)
  ).filter(
    (item) =>
      typeof item.name === 'string' || typeof item.description === 'string',
  )

  for (const { name, description, uuid } of data) {
    console.log(JSON.stringify({ uuid, name, description }))

    const [p1, p2] = await Promise.allSettled([
      answerTranslate(name as unknown as string),
      answerTranslate(description as unknown as string),
    ])

    const data: { name: LocalizedString; description: LocalizedString } = {
      name: fallback(typeof name === 'string' ? name : ''),
      description: fallback(typeof description === 'string' ? description : ''),
    }

    if (p1.status === 'fulfilled') data.name = p1.value
    if (p2.status === 'fulfilled') data.description = p2.value

    console.log(JSON.stringify(data))

    await db
      .update(shortcut)
      .set({ name: data.name, description: data.description })
      .where(eq(shortcut.uuid, uuid))
  }
}

async function migrateCollection() {
  const data = (
    await db
      .select({ title: collection.title, id: collection.id })
      .from(collection)
  ).filter((item) => typeof item.title === 'string')

  for (const { title, id } of data) {
    console.log(JSON.stringify({ id, title }))

    const [p1] = await Promise.allSettled([
      answerTranslate(title as unknown as string),
    ])

    const data: { title: LocalizedString } = {
      title: fallback(typeof title === 'string' ? title : ''),
    }

    if (p1.status === 'fulfilled') data.title = p1.value

    console.log(JSON.stringify(data))

    await db
      .update(collection)
      .set({ title: data.title })
      .where(eq(collection.id, id))
  }
}

main()
