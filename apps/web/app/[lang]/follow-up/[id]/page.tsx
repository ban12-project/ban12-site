import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import coordtransform from 'coordtransform'
import { ExternalLink, Star } from 'lucide-react'

import { getRestaurantById } from '#/lib/db/queries'
import { getDictionary, Locale } from '#/lib/i18n'
import { generateMapLink } from '#/lib/map-links'

type Props = {
  params: Promise<{ lang: Locale; id: string }>
}

const defaultPrecautions = ['No precautions found.']
const defaultDishes = 'No dishes information available.'

export default async function Page({ params }: Props) {
  const { id, lang } = await params
  const [restaurant, messages, headersList] = await Promise.all([
    getRestaurantById(id),
    getDictionary(lang),
    headers(),
  ])

  if (!restaurant || !restaurant.ai_summarize) {
    notFound()
  }

  const country = headersList.get('x-vercel-ip-country')
  const isChina = country === 'CN'
  const latlng = [restaurant.lat, restaurant.lng].map((i) => Number(i))

  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'Restaurant',
    name: restaurant.ai_summarize.restaurantName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.ai_summarize.restaurantAddress,
    },
    servesCuisine: restaurant.ai_summarize.dishes,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: restaurant.ai_summarize.rating,
      ratingCount: 5,
    },
    priceRange: restaurant.ai_summarize.price,
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid gap-8">
        <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="flex">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {restaurant.ai_summarize.restaurantName}
            </h1>
            <div className="ml-4 flex items-center">
              <span className="mr-2 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
              </span>
              <span className="text-gray-700 dark:text-gray-200">
                {restaurant.ai_summarize.rating || 'N/A'}
              </span>
            </div>
          </div>
          <div className="mt-2 items-center space-x-2 text-sm text-gray-600 md:flex dark:text-gray-300">
            <p>{restaurant.ai_summarize.restaurantAddress}</p>
            <a
              href={generateMapLink('apple', {
                q: restaurant.ai_summarize.restaurantName,
                ll: isChina
                  ? latlng.join(',')
                  : coordtransform
                      .gcj02towgs84(
                        ...(latlng.toReversed() as [number, number]),
                      )
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
            {isChina && (
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
          </div>
          <div className="mt-2 flex space-x-4">
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
            {restaurant.ai_summarize.dishes || defaultDishes}
          </p>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Service
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {restaurant.ai_summarize.service || 'No service information.'}
          </p>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Precautions
          </h2>
          <ul className="mt-2 list-disc pl-5 text-gray-600 dark:text-gray-300">
            {(restaurant.ai_summarize.precautions || defaultPrecautions).map(
              (precaution, index) => (
                <li key={index}>{precaution}</li>
              ),
            )}
          </ul>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const restaurant = await getRestaurantById(id)

  if (!restaurant || !restaurant.ai_summarize) {
    notFound()
  }

  const title = `${restaurant.ai_summarize.restaurantName} - Restaurant Review`

  return {
    title,
    description: `Read reviews and information about ${restaurant.ai_summarize.restaurantName}, including dishes, service quality, and more.`,
    openGraph: {
      title,
    },
  }
}
