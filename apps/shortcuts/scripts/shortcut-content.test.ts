import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Locale } from '../lib/i18n';
import {
  getLegacyRideCouponContent,
  getShortcutDescription,
  legacyRideCouponId,
  rideCouponAuthorUrl,
} from '../lib/shortcut-content';

const locales: Locale[] = ['en', 'zh-CN', 'ja', 'sv', 'ar'];
const description = Object.fromEntries(
  locales.map((lang) => [lang, `original ${lang}`]),
) as Record<Locale, string>;
for (const lang of locales) {
  test(`legacy correction is complete and does not mutate stored data: ${lang}`, () => {
    const shortcut = Object.freeze({
      uuid: legacyRideCouponId,
      description: Object.freeze({ ...description }),
      icloud:
        'https://www.icloud.com/shortcuts/836e7de39cd44fe18e5e88225e2d6bef',
    });
    const content = getLegacyRideCouponContent(shortcut.uuid, lang);
    assert.ok(content);
    assert.equal(getShortcutDescription(shortcut, lang), content.description);
    assert.notEqual(content.description, description[lang]);
    assert.equal(content.paragraphs.length, 3);
    assert.ok(content.paragraphs.every((paragraph) => paragraph.length > 20));
    assert.match(content.paragraphs[1], /2026-11-09/);
    assert.match(content.paragraphs[1], /2/);
    assert.ok(content.authorLink.length > 10);
    assert.equal(shortcut.description[lang], description[lang]);
    assert.equal(
      shortcut.icloud,
      'https://www.icloud.com/shortcuts/836e7de39cd44fe18e5e88225e2d6bef',
    );
  });
  test(`unrelated shortcuts retain their original description: ${lang}`, () => {
    const shortcut = { uuid: 'unrelated-id', description };
    assert.equal(getShortcutDescription(shortcut, lang), description[lang]);
    assert.equal(getLegacyRideCouponContent(shortcut.uuid, lang), undefined);
    assert.equal(
      getShortcutDescription(
        { ...shortcut, description: { ...description, [lang]: '' } },
        lang,
      ),
      '',
    );
  });
}
test('author link points to the verified instructions rather than a coupon endpoint', () => {
  assert.equal(rideCouponAuthorUrl, 'https://www.kejicut.com/854.html');
});
