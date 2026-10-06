import { relations, sql } from 'drizzle-orm';
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
} from 'drizzle-orm/pg-core';

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
    {
      accountProviderKey: uniqueIndex('account_provider_account_id_idx').on(
        account.providerId,
        account.accountId,
      ),
    },
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
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    credentialID: text('credentialID').notNull(),
    counter: integer('counter').notNull(),
    deviceType: text('deviceType').notNull(),
    backedUp: boolean('backedUp').notNull(),
    transports: text('transports'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    aaguid: text('aaguid'),
  },
  (passkey) => [
    uniqueIndex('passkey_credential_id_idx').on(passkey.credentialID),
    index('passkey_user_id_idx').on(passkey.userId),
    foreignKey({ columns: [passkey.userId], foreignColumns: [users.id] })
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

export const platformEnum = pgEnum('platform', ['bilibili']);

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  platform: platformEnum().default('bilibili').notNull(),
  platformId: text('platformId'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type SelectAuthor = typeof authors.$inferSelect;

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorId: integer('authorId')
    .notNull()
    .references(() => authors.id, { onDelete: 'cascade' }),
  metadata: jsonb('metadata')
    .$type<{
      comment: number;
      typeid: number;
      play: number;
      pic: string;
      subtitle: string;
      description: string;
      copyright: string;
      title: string;
      review: number;
      author: string;
      mid: number;
      created: number;
      length: string;
      video_review: number;
      aid: bigint;
      bvid: string;
      hide_click: boolean;
      is_pay: number;
      is_union_video: number;
      is_steins_gate: number;
      is_live_playback: number;
      is_lesson_video: number;
      is_lesson_finished: number;
      lesson_update_info: string;
      jump_url: string;
      meta: {
        id: number;
        title: string;
        cover: string;
        mid: number;
        intro: string;
        sign_state: number;
        attribute: number;
        stat: {
          season_id: number;
          view: number;
          danmaku: number;
          reply: number;
          favorite: number;
          coin: number;
          share: number;
          like: number;
          mtime: number;
          vt: number;
          vv: number;
        };
        ep_count: number;
        first_aid: number;
        ptime: number;
        ep_num: number;
      };
      is_avoided: number;
      season_id: number;
      attribute: number;
      is_charging_arc: boolean;
      elec_arc_type: number;
      vt: number;
      enable_vt: number;
      vt_display: string;
      playback_position: number;
      is_self_view: boolean;
    }>()
    .notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ many }) => ({
  postsToRestaurants: many(postsToRestaurants),
}));

export type SelectPost = typeof posts.$inferSelect;

export const restaurantStatusEnum = pgEnum('status', [
  'pending',
  'processing',
  'success',
  'failed',
]);

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
      restaurantName: string;
      restaurantAddress: string;
      rating: number;
      price: string;
      waitingTime: string;
      dishes: string;
      service: string;
      precautions: string[];
    }>(),
    /**
     * [lng, lat]
     */
    location: point('location'),
  },
  () => [
    index('restaurant_name_idx').on(sql`((ai_summarize->>'restaurantName'))`),
  ],
);

export const restaurantsRelations = relations(restaurant, ({ many }) => ({
  postsToRestaurants: many(postsToRestaurants),
}));

export type SelectRestaurant = typeof restaurant.$inferSelect;

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
);

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
);

export type SelectPostsToRestaurants = typeof postsToRestaurants.$inferSelect;
