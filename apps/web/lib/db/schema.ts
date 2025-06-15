import {
  bigint,
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  point,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
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

const restaurantStatusEnum = pgEnum('status', [
  'pending',
  'processing',
  'success',
  'failed',
])

export const restaurant = pgTable('restaurant', {
  comment: integer('comment').notNull(),
  typeid: integer('typeid').notNull(),
  play: integer('play').notNull(),
  pic: text('pic').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').notNull(),
  copyright: varchar('copyright').notNull(),
  title: text('title').notNull(),
  review: integer('review').notNull(),
  author: text('author').notNull(),
  mid: integer('mid').notNull(),
  created: integer('created').notNull(),
  length: varchar('length').notNull(),
  video_review: integer('video_review').notNull(),
  aid: bigint({ mode: 'number' }).notNull(),
  bvid: varchar('bvid').notNull(),
  hide_click: boolean('hide_click').notNull(),
  is_pay: integer('is_pay').notNull(),
  is_union_video: integer('is_union_video').notNull(),
  is_steins_gate: integer('is_steins_gate').notNull(),
  is_live_playback: integer('is_live_playback').notNull(),
  is_lesson_video: integer('is_lesson_video').notNull(),
  is_lesson_finished: integer('is_lesson_finished').notNull(),
  lesson_update_info: text('lesson_update_info').notNull(),
  jump_url: text('jump_url').notNull(),
  meta: jsonb('meta').$type<{
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
  }>(),
  is_avoided: integer('is_avoided').notNull(),
  season_id: integer('season_id').notNull(),
  attribute: integer('attribute').notNull(),
  is_charging_arc: boolean('is_charging_arc').notNull(),
  elec_arc_type: integer('elec_arc_type').notNull(),
  vt: integer('vt').notNull(),
  enable_vt: integer('enable_vt').notNull(),
  vt_display: text('vt_display').notNull(),
  playback_position: integer('playback_position').notNull(),
  is_self_view: boolean('is_self_view').notNull(),
  id: uuid('id').primaryKey().defaultRandom(),
  youtube: text('youtube'),
  status: restaurantStatusEnum().default('pending').notNull(),
  invisible: boolean('invisible').default(false).notNull(),
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
  location: point('location')
})

export type SelectRestaurant = typeof restaurant.$inferSelect
