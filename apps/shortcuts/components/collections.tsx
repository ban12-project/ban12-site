import Image from 'next/image'
import { Link } from '@repo/i18n/client'
import SuperEllipseSVG from '@repo/ui/components/super-ellipse-svg'

import { getCollections } from '#/lib/db/queries'
import { Locale } from '#/lib/i18n'

type CollectionsProps = {
  lang: Locale
}

const WIDTH = 400
const HEIGHT = 500

export default async function Collections({ lang }: CollectionsProps) {
  const collections = await getCollections()

  return (
    <>
      <SuperEllipseSVG
        width={WIDTH}
        height={HEIGHT}
        n={20}
        id="collections"
        steps={512}
      />
      <section className="hidden-scrollbar px-safe-max-4 flex snap-x snap-mandatory gap-x-3 overflow-x-auto overscroll-x-contain lg:gap-x-5 lg:px-0 lg:pb-10">
        {collections.map((item, index) => (
          <div
            className="box-content w-full shrink-0 snap-center pb-10 pt-2.5 md:w-[400px] lg:snap-start lg:last:ltr:pe-[calc(var(--container-inset,0)*2)] lg:first:rtl:ps-[calc(var(--container-inset,0)*2)]"
            key={item.id}
          >
            <Link
              className="relative block overflow-hidden rounded-2xl transition-all [box-shadow:2px_4px_12px_#00000014] [clip-path:url(#collections)] [transform:translateX(var(--container-inset,0))] md:hover:[box-shadow:2px_4px_16px_#00000029] md:hover:[transform:translateX(var(--container-inset,0))_scale3d(1.01,1.01,1.01)]"
              href={`/collection/${item.id}`}
            >
              <div
                className="absolute p-7 text-[var(--text-color,#fff)] lg:p-[30px]"
                style={
                  { '--text-color': item.textColor } as React.CSSProperties
                }
              >
                <h2 className="text-2xl font-bold" aria-hidden>
                  {item.title[lang]}
                </h2>
              </div>
              <Image
                className="aspect-4/5 w-full object-cover transition-all"
                src={item.image}
                alt={item.title[lang]}
                width={WIDTH}
                height={HEIGHT}
                priority={index === 0}
              />
            </Link>
          </div>
        ))}
      </section>
    </>
  )
}
