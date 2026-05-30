import coordtransform from 'coordtransform';
import { ExternalLink, Star } from 'lucide-react';
import { headers } from 'next/headers';
import { Suspense, ViewTransition } from 'react';

import type { Messages } from '#/lib/i18n';
import { generateMapLink } from '#/lib/map-links';

import type { RestaurantWithPosts } from '../actions';
import { restaurantTitleTransitionName } from '../transition-names';
import ExpandableText from './expandable-text';

type Restaurant = WithNonNullableKey<
  NonNullable<RestaurantWithPosts['restaurant']>,
  'ai_summarize'
>;

export default function RestaurantDetail({
  messages,
  restaurant,
  posts,
}: {
  restaurant: Restaurant;
  posts: RestaurantWithPosts['posts'];
  messages: Messages;
}) {
  const summary = restaurant.ai_summarize;
  const price = cleanText(summary.price);
  const waitingTime = cleanText(summary.waitingTime);
  const dishes = cleanText(summary.dishes);
  const service = cleanText(summary.service);
  const precautions = summary.precautions.map(cleanText).filter(Boolean);
  const t = messages.followUp.detail;
  const expandableLabels = {
    showLess: t.showLess,
    showMore: t.showMore,
  };

  return (
    <div className="grid gap-6">
      <section className="border-b pb-5">
        <div className="flex flex-wrap items-start gap-3">
          <ViewTransition
            name={restaurantTitleTransitionName(restaurant.id)}
            share="text-morph"
            default="none"
          >
            <h1 className="min-w-0 flex-1 text-2xl font-semibold tracking-normal text-foreground">
              {summary.restaurantName}
            </h1>
          </ViewTransition>
          <div className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-background/60 px-2.5 py-1 text-sm backdrop-blur-xl dark:border-white/10">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="text-foreground">{summary.rating || 'N/A'}</span>
          </div>
          {posts && (
            <a
              href={`https://www.bilibili.com/video/${posts.metadata.bvid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-sm text-muted-foreground underline-offset-4 hover:underline md:w-fit"
            >
              {posts.metadata.title}
              <ExternalLink className="ml-1 inline size-3" />
            </a>
          )}
        </div>
        <div className="mt-3 items-center gap-2 space-y-2 text-sm text-muted-foreground md:flex md:space-y-0">
          <p className="min-w-0 flex-1">{summary.restaurantAddress}</p>
          <Suspense fallback={<span>{t.loadingMapLinks}</span>}>
            <JumpToThirdPartyMap restaurant={restaurant} />
          </Suspense>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <MetaSummary label={t.price} value={price} messages={messages} />
          <MetaSummary label={t.wait} value={waitingTime} messages={messages} />
        </div>
      </section>

      {price && isLongText(price) && (
        <DetailSection title={t.price}>
          <ExpandableText
            text={price}
            labels={expandableLabels}
            previewLines={3}
          />
        </DetailSection>
      )}

      {waitingTime && isLongText(waitingTime) && (
        <DetailSection title={t.waitTime}>
          <ExpandableText
            text={waitingTime}
            labels={expandableLabels}
            previewLines={3}
          />
        </DetailSection>
      )}

      <DetailSection title={t.dishes}>
        <ExpandableText text={dishes || 'N/A'} labels={expandableLabels} />
      </DetailSection>

      <DetailSection title={t.service}>
        <ExpandableText text={service || 'N/A'} labels={expandableLabels} />
      </DetailSection>

      <DetailSection title={t.precautions}>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
          {precautions.map((precaution) => (
            <li key={precaution}>
              <ExpandableText
                text={precaution}
                labels={expandableLabels}
                previewLines={3}
              />
            </li>
          ))}
        </ul>
      </DetailSection>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function MetaSummary({
  label,
  value,
  messages,
}: {
  label: string;
  value: string;
  messages: Messages;
}) {
  return (
    <div className="rounded-md border border-white/25 bg-background/55 px-3 py-2 text-sm backdrop-blur-xl dark:border-white/10">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-foreground" title={value || 'N/A'}>
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
