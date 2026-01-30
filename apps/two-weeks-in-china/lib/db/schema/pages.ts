import {
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const pages = pgTable(
  'pages',
  {
    id: serial('id').primaryKey(),
    path: text('path').notNull(), // e.g., "/en/plan-trip/visa-policy", "/zh/destinations/beijing"
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    content: text('content').notNull(), // MDX content
    metadata: jsonb('metadata').$type<{
      icon?: string; // lucide icon name
      href?: string; // external link
      tags?: string[];
      order?: number; // for sorting
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('pages_path_idx').on(table.path)],
);

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
