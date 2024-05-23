import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getDictionary, Locale } from '#/i18n'

const View = dynamic(
  () => import('#/components/view').then((mod) => mod.View),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full flex-col items-center justify-center">
        <svg
          className="-ml-1 mr-3 h-5 w-5 animate-spin text-black"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    ),
  },
)
const Voxel = dynamic(
  () => import('#/components/voxel').then((mod) => mod.Voxel),
  { ssr: false },
)

type Props = { params: { lang: Locale } }

export default async function Home({ params }: Props) {
  const messages = await getDictionary(params.lang)

  return (
    <main className="relative h-screen w-screen">
      <View className="absolute h-full w-full">
        <Suspense fallback={null}>
          <Voxel />
        </Suspense>
      </View>
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 text-center">
        <nav className="uppercase [&>a]:ml-2">
          <a href="https://shortcuts.ban12.com">shortcuts</a>
          <a href="https://blog.ban12.com">blog</a>
        </nav>
      </div>
    </main>
  )
}
