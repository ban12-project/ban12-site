import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  varchar,
} from 'drizzle-orm/pg-core'

type Meta = {
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

export const restaurant = pgTable(
  'restaurant',
  {
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
    meta: jsonb('meta').$type<Meta>(),
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
  },
  (table) => [primaryKey({ columns: [table.aid, table.bvid] })],
)

export type SelectRestaurant = typeof restaurant.$inferSelect
