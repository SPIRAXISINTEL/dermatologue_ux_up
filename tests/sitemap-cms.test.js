import test from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "../functions/sitemap-cms.xml.js";

function fakeDb(rows = []) {
  return {
    prepare(sql) {
      return {
        async all() {
          return { results: sql.includes("cms_articles") ? rows.articles || [] : rows.videos || [] };
        }
      };
    }
  };
}

test("CMS sitemap returns published article and video URLs with valid dates", async () => {
  const response = await onRequestGet({
    env: {
      SITE_URL: "https://dermatologue-tanger.com",
      DB: fakeDb({
        articles: [{ slug: "acne-adulte", updated_at: "2026-11-20 12:00:00" }],
        videos: [{ slug: "conseils-peau", updated_at: "2026-11-21T09:30:00Z" }]
      })
    }
  });
  const xml = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/xml/);
  assert.match(xml, /https:\/\/dermatologue-tanger\.com\/articles\/acne-adulte\//);
  assert.match(xml, /https:\/\/dermatologue-tanger\.com\/videos\/conseils-peau\//);
  assert.match(xml, /<lastmod>2026-11-21<\/lastmod>/);
});

test("CMS sitemap skips invalid slugs and safely omits invalid dates", async () => {
  const response = await onRequestGet({
    env: {
      DB: fakeDb({ articles: [{ slug: "../bad", updated_at: null }, { slug: "valid-slug", updated_at: "not-a-date" }] })
    }
  });
  const xml = await response.text();
  assert.equal(response.status, 200);
  assert.doesNotMatch(xml, /\.\.\/bad/);
  assert.match(xml, /\/articles\/valid-slug\//);
  assert.doesNotMatch(xml, /<lastmod>/);
});

test("CMS sitemap fails visibly when the D1 binding is missing", async () => {
  const response = await onRequestGet({ env: {} });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /database binding DB is not configured/);
});
