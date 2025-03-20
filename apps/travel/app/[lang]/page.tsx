import { getRestaurants } from '#/lib/db/queries'
import { Search } from '#/components/search'

export default async function Home() {
  const restaurants = await getRestaurants()

  return (
    <>
      <h1 className="text-9xl font-bold uppercase">coming soon</h1>
      <Search />

      <div className="grid grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.bvid}
            className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
          >
            <h2 className="text-xl font-bold dark:text-white">
              {restaurant.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {restaurant.description}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
