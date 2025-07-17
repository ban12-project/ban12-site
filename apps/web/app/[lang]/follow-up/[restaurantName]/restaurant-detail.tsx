import { Suspense } from 'react'
import { headers } from 'next/headers'
import coordtransform from 'coordtransform'
import { ExternalLink, Star } from 'lucide-react'

import { type Messages } from '#/lib/i18n'
import { generateMapLink } from '#/lib/map-links'

import type { RestaurantWithPosts } from '../actions'

type Restaurant = WithNonNullableKey<
  NonNullable<RestaurantWithPosts['restaurant']>,
  'ai_summarize'
>

export default function RestaurantDetail({
  restaurant,
  posts,
}: {
  restaurant: Restaurant
  posts: RestaurantWithPosts['posts']
  messages: Messages
}) {
  return (
    <div className="grid gap-8">
      <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="flex flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {restaurant.ai_summarize.restaurantName}
          </h1>
          <div className="flex items-center">
            <span className="mr-2 text-yellow-500">
              <Star className="h-5 w-5 fill-current" />
            </span>
            <span className="text-gray-700 dark:text-gray-200">
              {restaurant.ai_summarize.rating || 'N/A'}
            </span>
          </div>
          {posts && (
            <a
              href={`https://www.bilibili.com/video/${posts.metadata.bvid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto block w-full self-end md:w-fit"
            >
              {posts.metadata.title}
              <ExternalLink className="ml-1 inline size-3" />
            </a>
          )}
        </div>
        <div className="mt-2 items-center space-x-2 text-sm text-gray-600 md:flex dark:text-gray-300">
          <p>{restaurant.ai_summarize.restaurantAddress}</p>
          <Suspense fallback={<span>Loading map links...</span>}>
            <JumpToThirdPartyMap restaurant={restaurant} />
          </Suspense>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          <span className="rounded-2xl bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            Price: {restaurant.ai_summarize.price || 'N/A'}
          </span>
          <span className="rounded-2xl bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            Wait Time: {restaurant.ai_summarize.waitingTime || 'N/A'}
          </span>
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Dishes
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {restaurant.ai_summarize.dishes}
        </p>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Service
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {restaurant.ai_summarize.service}
        </p>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Precautions
        </h2>
        <ul className="mt-2 list-disc pl-5 text-gray-600 dark:text-gray-300">
          {restaurant.ai_summarize.precautions.map((precaution, index) => (
            <li key={index}>{precaution}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

async function JumpToThirdPartyMap({ restaurant }: { restaurant: Restaurant }) {
  const headersList = await headers()
  const country = headersList.get('x-vercel-ip-country')
  const inChina = country === 'CN'
  const latlng = restaurant.location?.toReversed() as [number, number] | null

  if (!latlng) return null

  return (
    <>
      <a
        href={generateMapLink('apple', {
          q: restaurant.ai_summarize.restaurantName,
          ll: inChina
            ? latlng.join(',')
            : coordtransform
                .gcj02towgs84(...(latlng.toReversed() as [number, number]))
                .toReversed()
                .join(','),
        })}
        target="_blank"
        rel="noopener noreferrer"
      >
        Apple Map
        <ExternalLink className="ml-1 inline size-3" />
      </a>
      <a
        href={generateMapLink('google', {
          api: '1',
          query: latlng.join(','),
        })}
        target="_blank"
        rel="noopener noreferrer"
      >
        Google Map
        <ExternalLink className="ml-1 inline size-3" />
      </a>
      {inChina && (
        <>
          <a
            href={generateMapLink('amap', {
              position: latlng.toReversed().join(','),
              name: restaurant.ai_summarize.restaurantName,
              callnative: '1',
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            高德地图
            <ExternalLink className="ml-1 inline size-3" />
          </a>
          <a
            href={generateMapLink('baidu', {
              location: coordtransform
                .gcj02tobd09(...(latlng.toReversed() as [number, number]))
                .toReversed()
                .join(','),
              title: restaurant.ai_summarize.restaurantName,
              output: 'html',
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            百度地图
            <ExternalLink className="ml-1 inline size-3" />
          </a>
          <a
            href={generateMapLink('tencent', {
              marker: `coord:${latlng.join(',')};title:${restaurant.ai_summarize.restaurantName};addr:${restaurant.ai_summarize.restaurantAddress}`,
              referer: process.env.SITE_NAME!,
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            腾讯地图
            <ExternalLink className="ml-1 inline size-3" />
          </a>
        </>
      )}
    </>
  )
}
