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
      <section
        className="container mx-auto px-safe-max-4 py-20 md:px-0"
        aria-labelledby="tool-directory-title"
      >
        <div className="flex items-end justify-between gap-6">
          <h2 id="tool-directory-title" className="text-3xl font-semibold">
            Explore the tools
          </h2>
          <Link href="/7-zip" className="underline underline-offset-4">
            Browse all tools
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [
              '7-Zip',
              '/7-zip',
              'Pack and unpack common archive formats locally.',
            ],
            ['SHA256', '/hash', 'Calculate file hashes in your browser.'],
            [
              'ExifTool',
              '/exif',
              'Inspect image metadata without uploading files.',
            ],
            [
              'Text Compare',
              '/text-compare',
              'Find differences between two pieces of text.',
            ],
            [
              'QR Code',
              '/qr-code',
              'Generate downloadable QR codes from text or URLs.',
            ],
          ].map(([title, href, description]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-zinc-200 p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <h3 className="text-xl font-medium">{title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="sr-only" aria-label="WebAssembly utility tools">
        <h2>Fast, private browser tools</h2>
        <p>
          Use file utilities, archive tools, hash calculators, QR code
          generation, metadata inspection, and text comparison directly in your
          browser.
        </p>
      </section>
    </main>
  );
}
