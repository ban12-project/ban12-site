import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export type VisaPolicyType =
  | 'visa_free_15'
  | 'visa_free_30'
  | 'transit_240h'
  | 'visa_required';

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  code: varchar('code', { length: 3 }), // ISO 3166-1 alpha-2/3
  visaPolicy: varchar('visa_policy', { length: 50 })
    .$type<VisaPolicyType>()
    .notNull()
    .default('visa_required'),
  policyDetails: text('policy_details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;
