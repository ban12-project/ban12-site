// Integration smoke test (requires access to Google Fonts):
// cd apps/web && node --import tsx --test scripts/opengraph-image.test.ts
// This imports only the OG route: no app build, database, or migrations.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import React from 'react';

// tsx uses the classic JSX transform with this app's preserve JSX setting.
Object.assign(globalThis, { React });
process.env.SITE_NAME = 'Ban12';

const cases = [
  ['Arabic regression', 'توليد رمز الاستجابة السريعة'],
  ['English', 'Generate QR code'],
  ['Chinese', '生成二维码'],
  ['Mixed Arabic and English', 'Hello مرحبا'],
  ['No title', ''],
] as const;

for (const [label, title] of cases) {
  test(`OG renders PNG: ${label}`, async () => {
    const { GET } = await import('../app/api/og/route');
    const url = new URL('http://localhost/api/og');
    if (title) url.searchParams.set('title', title);
    const response = await GET(new NextRequest(url));
    const png = Buffer.from(await response.arrayBuffer());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    assert.ok(png.length > 1000);
  });
}

test('OG preserves the compact icon variant', async () => {
  const { GET } = await import('../app/api/og/route');
  const response = await GET(
    new NextRequest('http://localhost/api/og?w=48&h=48&size-fit=cover'),
  );
  const png = Buffer.from(await response.arrayBuffer());
  assert.equal(response.status, 200);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 48);
  assert.equal(png.readUInt32BE(20), 48);
});
