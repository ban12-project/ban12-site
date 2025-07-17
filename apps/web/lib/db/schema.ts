import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  point,
  primaryKey,
  serial,
  text,
  timestamp,
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
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
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
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
)

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => [
    uniqueIndex('Authenticator_credentialID_key').using(
      'btree',
      authenticator.credentialID,
    ),
    primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
    foreignKey({ columns: [authenticator.userId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  ],
)

export const platformEnum = pgEnum('platform', ['bilibili'])

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  platform: platformEnum().default('bilibili').notNull(),
  platformId: text('platformId'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type SelectAuthor = typeof authors.$inferSelect

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorId: integer('authorId')
    .notNull()
    .references(() => authors.id, { onDelete: 'cascade' }),
  metadata: jsonb('metadata')
    .$type<{
      comment: number
      typeid: number
      play: number
      pic: string
      subtitle: string
      description: string
      copyright: string
      title: string
      review: number
      author: string
      mid: number
      created: number
      length: string
      video_review: number
      aid: bigint
      bvid: string
      hide_click: boolean
      is_pay: number
      is_union_video: number
      is_steins_gate: number
      is_live_playback: number
      is_lesson_video: number
      is_lesson_finished: number
      lesson_update_info: string
      jump_url: string
      meta: {
        id: number
        title: string
        cover: string
        mid: number
        intro: string
        sign_state: number
        attribute: number
        stat: {
          season_id: number
          view: number
          danmaku: number
          reply: number
          favorite: number
          coin: number
          share: number
          like: number
          mtime: number
          vt: number
          vv: number
        }
        ep_count: number
        first_aid: number
        ptime: number
        ep_num: number
      }
      is_avoided: number
      season_id: number
      attribute: number
      is_charging_arc: boolean
      elec_arc_type: number
      vt: number
      enable_vt: number
      vt_display: string
      playback_position: number
      is_self_view: boolean
    }>()
    .notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const postsRelations = relations(posts, ({ many }) => ({
  postsToRestaurants: many(postsToRestaurants),
}))

export type SelectPost = typeof posts.$inferSelect

export const restaurantStatusEnum = pgEnum('status', [
  'pending',
  'processing',
  'success',
  'failed',
])

export const restaurant = pgTable(
  'restaurant',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    youtube: text('youtube'),
    status: restaurantStatusEnum().default('pending').notNull(),
    invisible: boolean('invisible').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    ai_summarize: jsonb('ai_summarize').$type<{
      restaurantName: string
      restaurantAddress: string
      rating: number
      price: string
      waitingTime: string
      dishes: string
      service: string
      precautions: string[]
    }>(),
    /**
     * [lng, lat]
     */
    location: point('location'),
  },
  () => [
    index('restaurant_name_idx').on(sql`((ai_summarize->>'restaurantName'))`),
  ],
)

export const restaurantsRelations = relations(restaurant, ({ many }) => ({
  postsToRestaurants: many(postsToRestaurants),
}))

export type SelectRestaurant = typeof restaurant.$inferSelect

export const postsToRestaurants = pgTable(
  'postsToRestaurants',
  {
    postId: integer('postId')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    restaurantId: uuid('restaurantId')
      .notNull()
      .references(() => restaurant.id, { onDelete: 'cascade' }),
  },
  (postsToRestaurants) => [
    primaryKey({
      columns: [postsToRestaurants.postId, postsToRestaurants.restaurantId],
    }),
  ],
)

export const postsToRestaurantsRelations = relations(
  postsToRestaurants,
  ({ one }) => ({
    post: one(posts, {
      fields: [postsToRestaurants.postId],
      references: [posts.id],
    }),
    restaurant: one(restaurant, {
      fields: [postsToRestaurants.restaurantId],
      references: [restaurant.id],
    }),
  }),
)
