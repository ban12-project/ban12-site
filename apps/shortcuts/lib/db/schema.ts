import { relations } from 'drizzle-orm'
import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
)

export const authenticator = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull(),
    userId: text('userId').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (table) => [
    uniqueIndex('Authenticator_credentialID_key').using(
      'btree',
      table.credentialID,
    ),
    primaryKey({ columns: [table.userId, table.credentialID] }),
    foreignKey({ columns: [table.userId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  ],
)

export const shortcut = pgTable(
  'shortcut',
  {
    createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    uuid: uuid('uuid').primaryKey().notNull(),
    icloud: text('icloud').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon'),
    backgroundColor: text('backgroundColor'),
    details: text('details'),
    language: text('language').default('zh-CN').notNull(),
    collectionId: integer('collectionId').references(() => collection.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    albumId: integer('albumId').references(() => album.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => [
    uniqueIndex('Shortcut_uuid_key').using('btree', table.uuid),
    unique('shortcut_uuid_key').on(table.uuid),
  ],
)

export const album = pgTable('album', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'string' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  collectionId: integer('collectionId').references(() => collection.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
})

export const collection = pgTable('collection', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'string' }).notNull(),
  title: text('title').notNull(),
  image: text('image').notNull(),
  textColor: text('textColor').default(''),
})

export const shortcutRelations = relations(shortcut, ({ one }) => ({
  album: one(album, { fields: [shortcut.albumId], references: [album.id] }),
  collection: one(collection, {
    fields: [shortcut.collectionId],
    references: [collection.id],
  }),
}))

export const albumRelations = relations(album, ({ many, one }) => ({
  shortcuts: many(shortcut),
  collection: one(collection, {
    fields: [album.collectionId],
    references: [collection.id],
  }),
}))

export const collectionsRelations = relations(collection, ({ many }) => ({
  albums: many(album),
  shortcuts: many(shortcut),
}))

export type SelectShortcut = typeof shortcut.$inferSelect
export type InsertShortcut = typeof shortcut.$inferInsert
export type SelectAlbum = typeof album.$inferSelect
export type InsertAlbum = typeof album.$inferInsert
export type SelectCollection = typeof collection.$inferSelect
export type InsertCollection = typeof collection.$inferInsert
