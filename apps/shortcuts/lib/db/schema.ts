import { relations } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import type { Locale } from '#/lib/i18n';

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  password: text('password'),
});

export const accounts = pgTable(
  'account',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
    providerId: text('providerId').notNull(),
    accountId: text('accountId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { mode: 'date' }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { mode: 'date' }),
    scope: text('scope'),
    password: text('password'),
  },
  (account) => [
    uniqueIndex('account_provider_account_id_idx').on(
      account.providerId,
      account.accountId,
    ),
  ],
);

export const sessions = pgTable('session', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
});

export const verifications = pgTable('verification', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
});

export const passkeys = pgTable(
  'passkey',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    publicKey: text('publicKey').notNull(),
    credentialID: text('credentialID').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    counter: integer('counter').notNull(),
    deviceType: text('deviceType').notNull(),
    backedUp: boolean('backedUp').notNull(),
    transports: text('transports'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    aaguid: text('aaguid'),
  },
  (table) => [
    uniqueIndex('passkey_credential_id_idx').on(table.credentialID),
    index('passkey_user_id_idx').on(table.userId),
    foreignKey({ columns: [table.userId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  ],
);

export const authSchema = {
  user: users,
  account: accounts,
  session: sessions,
  verification: verifications,
  passkey: passkeys,
};

export type LocalizedString = { [key in Locale]: string };

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
    name: jsonb('name').notNull().$type<LocalizedString>(),
    description: jsonb('description').notNull().$type<LocalizedString>(),
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
);

export const album = pgTable('album', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'string' }).notNull(),
  title: jsonb('title').notNull().$type<LocalizedString>(),
  description: jsonb('description').notNull().$type<LocalizedString>(),
  collectionId: integer('collectionId').references(() => collection.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
});

export const collection = pgTable('collection', {
  id: serial('id').primaryKey().notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'string' }).notNull(),
  title: jsonb('title').notNull().$type<LocalizedString>(),
  image: text('image').notNull(),
  textColor: text('textColor').default(''),
});

export const shortcutRelations = relations(shortcut, ({ one }) => ({
  album: one(album, { fields: [shortcut.albumId], references: [album.id] }),
  collection: one(collection, {
    fields: [shortcut.collectionId],
    references: [collection.id],
  }),
}));

export const albumRelations = relations(album, ({ many, one }) => ({
  shortcuts: many(shortcut),
  collection: one(collection, {
    fields: [album.collectionId],
    references: [collection.id],
  }),
}));

export const collectionsRelations = relations(collection, ({ many }) => ({
  albums: many(album),
  shortcuts: many(shortcut),
}));

export type SelectShortcut = typeof shortcut.$inferSelect;
export type InsertShortcut = typeof shortcut.$inferInsert;
export type SelectAlbum = typeof album.$inferSelect;
export type InsertAlbum = typeof album.$inferInsert;
export type SelectCollection = typeof collection.$inferSelect;
export type InsertCollection = typeof collection.$inferInsert;
