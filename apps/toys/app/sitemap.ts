import type { MetadataRoute } from 'next';

import { i18n } from '#/lib/i18n';

const siteUrl = process.env.NEXT_PUBLIC_HOST_URL ?? 'https://toys.ban12.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = Object.keys(i18n.locales);

  const routes = ['', '/hash', '/7-zip', '/exif', '/text-compare', '/qr-code'];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alternate) => [
            alternate,
            `${siteUrl}/${alternate}${route}`,
          ]),
        ),
      },
    })),
  );
}
