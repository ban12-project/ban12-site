import { config } from 'dotenv'
import { desc } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { posts, restaurant } from './schema'

config({ path: ['.env'] })

const db = drizzle(process.env.DATABASE_URL!)

async function main() {
  const record = await db
    .select()
    .from(restaurant)
    .orderBy(desc(restaurant.created_at))
    .limit(1)

  console.log(record)

  // await log()

  // migrateRestaurant()

  console.log('done')
}

/* async function log() {
  const biliURL =
    'https://api.bilibili.com/x/space/wbi/arc/search?mid=429748638&ps=40&tid=0&pn=1&keyword=&order=pubdate&platform=web&web_location=1550101&order_avoided=true'
  const supabaseEndpoint =
    'https://asvqdezayhhtnygrivcb.supabase.co/functions/v1/bilibili/'

  const response = await fetch(supabaseEndpoint + encodeURIComponent(biliURL), {
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

  const [result, lastRow] = await Promise.all([
    response.json(),
    db
      .select({ created: gangchelin.created })
      .from(gangchelin)
      .orderBy(desc(gangchelin.created)),
  ])
  const lastCreated = lastRow.length > 0 ? lastRow[0].created : 0

  const newVideos = [] // 用于收集新视频的数组

  for (const video of result.data.list.vlist) {
    // 如果视频的 created 时间戳在数据库中最近一条视频的 created 时间戳之前，则跳过
    if (video.created <= lastCreated) continue

    newVideos.push(video)
  }

  if (newVideos.length === 0) {
    console.log("Don't have new videos")
    return
  }

  await db.insert(gangchelin).values(
    newVideos.map((video) => ({
      comment: video.comment,
      typeid: video.typeid,
      play: video.play,
      pic: video.pic,
      subtitle: video.subtitle,
      description: video.description,
      copyright: video.copyright,
      title: video.title,
      review: video.review,
      author: video.author,
      mid: video.mid,
      created: video.created,
      length: video.length,
      video_review: video.video_review,
      aid: video.aid,
      bvid: video.bvid,
      hide_click: video.hide_click,
      is_pay: video.is_pay,
      is_union_video: video.is_union_video,
      is_steins_gate: video.is_steins_gate,
      is_live_playback: video.is_live_playback,
      is_lesson_video: video.is_lesson_video,
      is_lesson_finished: video.is_lesson_finished,
      lesson_update_info: video.lesson_update_info,
      jump_url: video.jump_url,
      meta: video.meta,
      is_avoided: video.is_avoided,
      season_id: video.season_id,
      attribute: video.attribute,
      is_charging_arc: video.is_charging_arc,
      elec_arc_type: video.elec_arc_type,
      vt: video.vt,
      enable_vt: video.enable_vt,
      vt_display: video.vt_display,
      playback_position: video.playback_position,
      is_self_view: video.is_self_view,
    })),
  )
} */

/* async function migrateRestaurant() {
  const data = await db.select().from(restaurant)

  const insertMetadata = data.map(({ id, youtube, status, invisible, updated_at, ai_summarize, location, ...props }) => ({ metadata: props, authorId: 1 })) 

  await db.insert(posts).values(insertMetadata)
} */

main()
