import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Locale } from '../lib/i18n';
import {
  getLegacyRideCouponContent,
  legacyRideCouponId,
} from '../lib/shortcut-content';

Object.assign(globalThis, { React });
const locales: Locale[] = ['en', 'zh-CN', 'ja', 'sv', 'ar'];
const localized = Object.fromEntries(
  locales.map((lang) => [lang, 'OLD UNVERIFIED GUARANTEE']),
);
const names = Object.fromEntries(locales.map((lang) => [lang, 'NAME']));
const shortcut = {
  uuid: legacyRideCouponId,
  description: localized,
  name: names,
  icloud: 'https://www.icloud.com/shortcuts/836e7de39cd44fe18e5e88225e2d6bef',
};
mock.module('../lib/db/queries.ts', {
  namedExports: {
    getShortcutByUuid: async () => shortcut,
    getShortcuts: async () => [shortcut],
  },
});
mock.module('../lib/i18n.ts', {
  namedExports: {
    getDictionary: async () => ({}),
    i18n: { locales: Object.fromEntries(locales.map((lang) => [lang, {}])) },
  },
});
mock.module('../components/shortcut-card.tsx', { defaultExport: () => null });
const { default: ShortcutAdd } = await import('../components/shortcut-add');
const { default: ShortcutList } = await import('../components/shortcut-list');
const { generateMetadata } = await import(
  '../app/[lang]/(public)/(with-search)/get/[id]/page'
);
process.env.NEXT_PUBLIC_HOST_URL = 'https://shortcuts.ban12.com';
for (const lang of locales) {
  test(`renders corrected detail, list and metadata for ${lang}`, async () => {
    const content = getLegacyRideCouponContent(legacyRideCouponId, lang)!;
    const element = await ShortcutAdd({
      params: { id: legacyRideCouponId, lang },
      messages: { 'set-up-shortcut': 'INSTALL' } as never,
      fromNormalRoute: true,
    });
    const html = renderToStaticMarkup(element);
    assert.ok(!html.includes('OLD UNVERIFIED GUARANTEE'));
    // Both mobile and desktop layouts retain the install link and dated notice.
    assert.equal(html.split(`href="${shortcut.icloud}"`).length - 1, 2);
    assert.equal(html.split('2026-11-09').length - 1, 2);
    assert.equal(
      html.split('href="https://www.kejicut.com/854.html"').length - 1,
      2,
    );
    if (lang === 'ar') assert.equal(html.split('dir="rtl"').length - 1, 2);
    const list = renderToStaticMarkup(
      React.createElement(ShortcutList, {
        shortcuts: [shortcut] as never,
        lang,
      }),
    );
    assert.ok(!list.includes('OLD UNVERIFIED GUARANTEE'));
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: legacyRideCouponId, lang }),
    });
    assert.equal(metadata.description, content.description);
    assert.equal(metadata.alternates?.canonical, `/get/${legacyRideCouponId}`);
  });
}
