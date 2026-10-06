import { cn } from '@repo/ui/lib/utils';
import coordtransform from 'coordtransform';
import { ExternalLink, Star } from 'lucide-react';
import { headers } from 'next/headers';
import { Suspense, ViewTransition } from 'react';
import type { Messages } from '#/lib/i18n';
import { generateMapLink } from '#/lib/map-links';

import type { RestaurantWithPosts } from '../actions';
import { restaurantTitleTransitionName } from '../transition-names';

type Restaurant = WithNonNullableKey<
  NonNullable<RestaurantWithPosts['restaurant']>,
  'ai_summarize'
>;

export default function RestaurantDetail({
  messages,
  restaurant,
  posts,
  surface = 'page',
}: {
  restaurant: Restaurant;
  posts: RestaurantWithPosts['posts'];
  messages: Messages;
  surface?: 'page' | 'drawer';
}) {
  const isDrawer = surface === 'drawer';
  const summary = restaurant.ai_summarize;
  const price = cleanText(summary.price);
  const waitingTime = cleanText(summary.waitingTime);
  const dishes = cleanText(summary.dishes);
  const service = cleanText(summary.service);
  const precautions = (summary.precautions ?? [])
    .map(cleanText)
    .filter(Boolean);
  const precautionKeyCounts = new Map<string, number>();
  const precautionItems = precautions.map((precaution) => {
    const count = (precautionKeyCounts.get(precaution) ?? 0) + 1;
    precautionKeyCounts.set(precaution, count);
    return {
      key: `${precaution}-${count}`,
      text: precaution,
    };
  });
  const t = messages.followUp.detail;

  return (
    <div className={cn('grid', isDrawer ? 'gap-4' : 'gap-6')}>
      <section className={cn('border-b', isDrawer ? 'pb-4' : 'pb-5')}>
        <div
          className={cn(
            'flex flex-wrap items-center gap-3',
            isDrawer && 'gap-2 pr-9',
          )}
        >
          <ViewTransition
            name={restaurantTitleTransitionName(restaurant.id)}
            share="text-morph"
            default="none"
          >
            <h1
              className={cn(
                'min-w-0 flex-1 font-semibold tracking-normal text-foreground',
                isDrawer ? 'text-xl leading-7' : 'text-2xl',
              )}
            >
              {summary.restaurantName}
            </h1>
          </ViewTransition>
          <div
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-background/60 px-2.5 py-1 text-sm backdrop-blur-xl dark:border-white/10',
              isDrawer && 'mt-0.5',
            )}
          >
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="text-foreground">{summary.rating || 'N/A'}</span>
          </div>
          {posts && (
            <a
              href={`https://www.bilibili.com/video/${posts.metadata.bvid}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'block w-full text-sm text-muted-foreground underline-offset-4 hover:underline md:w-fit',
                isDrawer && 'line-clamp-2 md:w-full',
              )}
            >
              {posts.metadata.title}
              <ExternalLink className="ml-1 inline size-3" />
            </a>
          )}
        </div>
        <div
          className={cn(
            'mt-3 gap-2 text-sm text-muted-foreground',
            isDrawer
              ? 'flex flex-col'
              : 'items-center space-y-2 md:flex md:space-y-0',
          )}
        >
          <p className="min-w-0 flex-1">{summary.restaurantAddress}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Suspense fallback={<span>{t.loadingMapLinks}</span>}>
              <JumpToThirdPartyMap restaurant={restaurant} />
            </Suspense>
          </div>
        </div>
        <div
          className={cn(
            'mt-4 grid grid-cols-1 gap-2',
            isDrawer ? 'sm:grid-cols-2' : 'md:grid-cols-2',
          )}
        >
          <MetaSummary
            label={t.price}
            value={price}
            messages={messages}
            surface={surface}
          />
          <MetaSummary
            label={t.wait}
            value={waitingTime}
            messages={messages}
            surface={surface}
          />
        </div>
      </section>

      {price && isLongText(price) && (
        <DetailSection title={t.price} surface={surface}>
          <DetailText text={price} />
        </DetailSection>
      )}

      {waitingTime && isLongText(waitingTime) && (
        <DetailSection title={t.waitTime} surface={surface}>
          <DetailText text={waitingTime} />
        </DetailSection>
      )}

      <DetailSection title={t.dishes} surface={surface}>
        <DetailText text={dishes || 'N/A'} />
      </DetailSection>

      <DetailSection title={t.service} surface={surface}>
        <DetailText text={service || 'N/A'} />
      </DetailSection>

      {precautions.length > 0 && (
        <DetailSection title={t.precautions} surface={surface}>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {precautionItems.map((precaution) => (
              <li key={precaution.key}>
                <DetailText text={precaution.text} />
              </li>
            ))}
          </ul>
        </DetailSection>
      )}
    </div>
  );
}

function DetailText({ text }: { text: string }) {
  return <p className="text-sm leading-6 text-muted-foreground">{text}</p>;
}

function DetailSection({
  title,
  children,
  surface = 'page',
}: {
  title: string;
  children: React.ReactNode;
  surface?: 'page' | 'drawer';
}) {
  return (
    <section className={cn(surface === 'drawer' ? 'space-y-1.5' : 'space-y-2')}>
      <h2
        className={cn(
          'font-semibold text-foreground',
          surface === 'drawer' ? 'text-sm' : 'text-base',
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function MetaSummary({
  label,
  value,
  messages,
  surface = 'page',
}: {
  label: string;
  value: string;
  messages: Messages;
  surface?: 'page' | 'drawer';
}) {
  return (
    <div
      className={cn(
        'rounded-md border border-white/25 bg-background/55 text-sm backdrop-blur-xl dark:border-white/10',
        surface === 'drawer' ? 'px-2.5 py-2' : 'px-3 py-2',
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1 text-foreground',
          surface === 'drawer' ? 'line-clamp-2 leading-5' : 'truncate',
        )}
        title={value || 'N/A'}
      >
        {shortMetaLabel(value, messages) || 'N/A'}
      </div>
    </div>
  );
}

function cleanText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function isLongText(value: string) {
  return value.length > 48;
}

function shortMetaLabel(value: string, messages: Messages) {
  const t = messages.followUp.detail;
  if (!value) return '';
  if (value.length <= 34) return value;

  const priceMatch = value.match(
    /(?:around|approx(?:imately)?|about)?\s*(?:[\d.]+[-–~到至]?)?[\d.]+\s*(?:rmb|yuan|元|¥|cny)/i,
  );
  if (priceMatch) return cleanText(priceMatch[0]);
  if (/free|complimentary|免费/i.test(value)) return t.free;
  if (/affordable|good value|实惠|划算/i.test(value)) return t.goodValue;
  if (/expensive|high-end|高端|贵/i.test(value)) return t.premium;
  if (
    /short|fast|quick|prompt|minimal|no significant|无需|短|快/i.test(value)
  ) {
    return t.shortWait;
  }
  if (/long|queue|half an hour|crowded|排队|久/i.test(value)) {
    return t.longWait;
  }

  return `${value.slice(0, 30).trim()}...`;
}

async function JumpToThirdPartyMap({ restaurant }: { restaurant: Restaurant }) {
  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country');
  const inChina = country === 'CN';
  const latlng = restaurant.location?.toReversed() as [number, number] | null;

  if (!latlng) return null;

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
  );
}
