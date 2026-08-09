import { Link } from '@repo/i18n/client';
import type { Metadata } from 'next';
import HomeAnimate from '#/components/home-animate';
import HomeHero from '#/components/home-hero';
import HomeIntro from '#/components/home-intro';
import { getDictionary, type Locale } from '#/lib/i18n';

export const instant = true;

export async function generateMetadata(
  props: PageProps<'/[lang]'>,
): Promise<Metadata> {
  const params = await props.params;
  const messages = await getDictionary(params.lang as Locale);

  return {
    title: messages.home.title,
    description: messages.home.description,
    keywords: [
      'WebAssembly tools',
      'online utilities',
      'privacy-first tools',
      'SHA256 calculator',
      '7-Zip online',
      'text comparison',
    ],
  };
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  const messages = await getDictionary(lang as Locale);

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted static metadata.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: messages.home.title,
            description: messages.home.description,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript and WebAssembly',
            url: 'https://toys.ban12.com',
          }),
        }}
      />
      <HomeHero messages={messages.home} />
      <HomeIntro messages={messages.home} />
      <HomeAnimate />
    </main>
  );
}
