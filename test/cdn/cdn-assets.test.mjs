// Smoke test for the CDN assets referenced by these sources (needs network access).
// Extracts every CDN URL (absolute https URLs and `cdn!` paths resolved with cdnUrl)
// and checks that each one returns HTTP 200 with the expected content type.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cdnUrl } from '../../app/boot.js';

const root = new URL('../../', import.meta.url);

const files = [
  'app/directives/articles/cbd-article.js',                  // article pages
  'app/components/nav/heade.vue',                            // nav header (language icon)
  'app/views/meetings/documents/statements/session-prep.js', // meetings statements session-prep
];

const contentTypes = { css: 'text/css', png: 'image/png' };

function extractCdnUrls(source) {
  const absolute = source.match(/https:\/\/[^\s'"`()]+\.(?:css|png)/g) || [];
  const aliased  = [...source.matchAll(/cdn!([^\s'"`()]+)/g)].map(([, path]) => `${cdnUrl}${path}`);

  return [...absolute, ...aliased];
}

for (const file of files) {

  const urls = extractCdnUrls(fs.readFileSync(new URL(file, root), 'utf8'));

  test(`${file} references at least one CDN asset`, () => {
    assert.ok(urls.length > 0, `no CDN URL found in ${file}`);
  });

  for (const url of urls) {
    test(`${file}: ${url} returns 200`, async () => {

      const res  = await fetch(url);
      const body = await res.arrayBuffer();
      const ext  = url.split('.').pop();

      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type') || '', new RegExp(`^${contentTypes[ext]}`));
      assert.ok(body.byteLength > 0, 'empty response body');
    });
  }
}
