import { relations } from 'drizzle-orm/relations'

import { album, collection, shortcut } from './schema'

export const albumRelations = relations(album, ({ one, many }) => ({
  collection: one(collection, {
    fields: [album.collectionId],
    references: [collection.id],
  }),
  shortcuts: many(shortcut),
}))

export const collectionRelations = relations(collection, ({ many }) => ({
  albums: many(album),
  shortcuts: many(shortcut),
}))

export const shortcutRelations = relations(shortcut, ({ one }) => ({
  album: one(album, {
    fields: [shortcut.albumId],
    references: [album.id],
  }),
  collection: one(collection, {
    fields: [shortcut.collectionId],
    references: [collection.id],
  }),
}))
