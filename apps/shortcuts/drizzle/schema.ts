import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const aal_level = pgEnum('aal_level', ['aal1', 'aal2', 'aal3'])
export const code_challenge_method = pgEnum('code_challenge_method', [
  's256',
  'plain',
])
export const factor_status = pgEnum('factor_status', ['unverified', 'verified'])
export const factor_type = pgEnum('factor_type', ['totp', 'webauthn'])
export const one_time_token_type = pgEnum('one_time_token_type', [
  'confirmation_token',
  'reauthentication_token',
  'recovery_token',
  'email_change_token_new',
  'email_change_token_current',
  'phone_change_token',
])
export const key_status = pgEnum('key_status', [
  'default',
  'valid',
  'invalid',
  'expired',
])
export const key_type = pgEnum('key_type', [
  'aead-ietf',
  'aead-det',
  'hmacsha512',
  'hmacsha256',
  'auth',
  'shorthash',
  'generichash',
  'kdf',
  'secretbox',
  'secretstream',
  'stream_xchacha20',
])
export const action = pgEnum('action', [
  'INSERT',
  'UPDATE',
  'DELETE',
  'TRUNCATE',
  'ERROR',
])
export const equality_op = pgEnum('equality_op', [
  'eq',
  'neq',
  'lt',
  'lte',
  'gt',
  'gte',
  'in',
])

export const authenticator = pgTable(
  'authenticator',
  {
    id: text('id').primaryKey().notNull(),
    credentialID: text('credentialID').notNull(),
    userId: text('userId').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (table) => {
    return {
      Authenticator_credentialID_key: uniqueIndex(
        'Authenticator_credentialID_key',
      ).using('btree', table.credentialID),
    }
  },
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

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().notNull(),
  userId: text('userId').notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
  oauth_token_secret: text('oauth_token_secret'),
  oauth_token: text('oauth_token'),
})

export const sessions = pgTable('sessions', {
  id: text('id').notNull(),
  sessionToken: text('sessionToken').primaryKey().notNull(),
  userId: text('userId').notNull(),
  expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
})

export const users = pgTable('users', {
  id: text('id').default('').primaryKey().notNull(),
  name: text('name'),
  email: text('email'),
  emailVerified: timestamp('emailVerified', { precision: 3, mode: 'string' }),
  image: text('image'),
  password: text('password'),
})

export const verification_tokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').primaryKey().notNull(),
  expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
})

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
  (table) => {
    return {
      Shortcut_uuid_key: uniqueIndex('Shortcut_uuid_key').using(
        'btree',
        table.uuid,
      ),
      shortcut_uuid_key: unique('shortcut_uuid_key').on(table.uuid),
    }
  },
)

export const _prisma_migrations = pgTable('_prisma_migrations', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  finished_at: timestamp('finished_at', { withTimezone: true, mode: 'string' }),
  migration_name: varchar('migration_name', { length: 255 }).notNull(),
  logs: text('logs'),
  rolled_back_at: timestamp('rolled_back_at', {
    withTimezone: true,
    mode: 'string',
  }),
  started_at: timestamp('started_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  applied_steps_count: integer('applied_steps_count').default(0).notNull(),
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
  })
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
