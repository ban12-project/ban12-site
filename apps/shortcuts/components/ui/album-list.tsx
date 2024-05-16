import { Messages } from '#/get-dictionary'

import { fetchAlbums } from '#/lib/actions'
import Link from '#/components/link'

import Album from './album'

type AlbumListProps = {
  messages: Messages
  albums?: Awaited<ReturnType<typeof fetchAlbums>>
}

export default async function AlbumList({ messages, albums }: AlbumListProps) {
  albums ||= await fetchAlbums()

  return (
    <ul className="[&>li+li_.custom-border]:border-t [@media_only_screen_and_(min-resolution:192dpi){&>li+li_.custom-border}]:border-t-[.5px]">
      {albums.map((item) => (
        <li key={item.id} className="lg:pb-10">
          <div className="pb-1.5 px-safe-max-4 lg:mx-[var(--container-inset,0)] lg:px-0">
            <div className="custom-border flex items-center border-zinc-300 pt-5 dark:border-zinc-700 lg:border-none">
              <h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold lg:flex lg:pb-5 lg:text-3xl lg:tracking-wide">
                {item.title}
                <span className="hidden flex-1 text-gray-500/90 lg:block">
                  {item.description}
                </span>
              </h2>
              <Link
                href={`/album/${item.id}`}
                className="ml-auto whitespace-nowrap text-blue-500 active:text-blue-500/80 lg:hidden"
              >
                {messages['see-all']}
              </Link>
            </div>
            <p className="flex-1 text-gray-500/90 lg:hidden">
              {item.description}
            </p>
          </div>
          <Album shortcuts={item.shortcuts} />
        </li>
      ))}
    </ul>
  )
}
