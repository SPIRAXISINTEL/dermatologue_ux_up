import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public and admin HTML contain no inline style attributes or style blocks", () => {
  const files = [];
  const walk = (dir) => { for (const entry of readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })) { const rel = join(dir, entry.name).replaceAll("\\", "/"); if (entry.isDirectory()) walk(rel); else if (entry.name.endsWith(".html")) files.push(rel); } };
  walk(".");
  for (const file of files) { const html = read(file); assert.doesNotMatch(html, /<[^>]+\sstyle=["']/i, `${file} has inline style attribute`); assert.doesNotMatch(html, /<style\b/i, `${file} has inline style block`); }
});

test("CSP blocks inline styles and exposes baseline isolation headers", () => {
  const headers = read("_headers");
  assert.match(headers, /style-src 'self' https:\/\/fonts\.googleapis\.com/);
  assert.doesNotMatch(headers, /style-src[^\n]*unsafe-inline/i);
  assert.match(headers, /Cross-Origin-Opener-Policy: same-origin-allow-popups/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
});

test("Arabic pages declare RTL, canonical URLs and reciprocal language links", () => {
  for (const file of ["ar/index.html", "ar/dermatologie-medicale-tanger/index.html", "ar/medecine-esthetique-tanger/index.html", "ar/chirurgie-dermatologique-tanger/index.html", "ar/contact/index.html"]) {
    const html = read(file);
    assert.match(html, /<html\b[^>]*lang="ar-MA"/i);
    assert.match(html, /<html\b[^>]*dir="rtl"/i);
    assert.match(html, /rel="canonical"/i);
    assert.match(html, /hreflang="fr-MA"/i);
    assert.match(html, /hreflang="ar-MA"/i);
  }
});

test("Cloudflare Pages project configuration matches the deployed project", () => {
  assert.match(read("wrangler.toml"), /^name = "dermtanger"/m);
  assert.match(read("package.json"), /--project-name=dermtanger/);
});

test("approved clinic phone and mobile contact bar are consistent", () => {
  for (const file of ["index.html", "contact/index.html", "ar/contact/index.html", "chirurgie-dermatologique-tanger/index.html"]) {
    const html = read(file);
    assert.doesNotMatch(html, /06 64 32 04 07|212664320407/, `${file} contains obsolete WhatsApp number`);
  }
  assert.match(read("assets/js/main.js"), /mobile-action-bar/);
  assert.match(read("_redirects"), /\/dermatologie\/ \/dermatologie-medicale-tanger\/ 301/);
});

test("new PDF service and contact pages have MedicalWebPage metadata and canonical tags", () => {
  for (const file of ["chirurgie-dermatologique-tanger/index.html", "contact/index.html", "ar/chirurgie-dermatologique-tanger/index.html", "ar/contact/index.html"]) {
    const html = read(file);
    assert.match(html, /<title>/);
    assert.match(html, /name="description"/);
    assert.match(html, /rel="canonical"/);
    assert.match(html, /<h1\b/);
    assert.match(html, /application\/ld\+json/);
  }
});

test("public pages and CMS detail pages share the refreshed interface", () => {
  const files = [];
  const walk = (dir) => { for (const entry of readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })) { const rel = join(dir, entry.name).replaceAll("\\", "/"); if (entry.isDirectory()) { if (rel !== "admin") walk(rel); } else if (entry.name.endsWith(".html")) files.push(rel); } };
  walk(".");
  for (const file of files) assert.match(read(file), /\/assets\/css\/site-wide-redesign\.css/, `${file} must load the shared redesign`);
  assert.match(read("functions/_lib/cms.js"), /\/assets\/css\/site-wide-redesign\.css/, "CMS detail pages must load the shared redesign");
});

test("the internal contact page keeps the live appointment form", () => {
  const html = read("contact/index.html");
  assert.match(html, /<form[^>]+action="\/api\/rdv"/);
  assert.match(html, /id="rdv-form"/);
  assert.match(html, /name="website"/);
});

test("video hub uses the supplied layout with real CMS videos and preserved SEO", () => {
  const html = read("videos/index.html");
  assert.match(html, /href="https:\/\/dermatologue-tanger\.com\/videos\/"[^>]*rel="canonical"/);
  assert.match(html, /"@type":"CollectionPage"/);
  assert.match(html, /class="video-hub"[^>]*data-cms-list="videos"/);
  assert.match(html, /\/assets\/css\/video-hub\.css/);
  assert.match(html, /darija marocaine/i);
  assert.doesNotMatch(html, /assets\/(?:video-principale|soin-anti-age|acne-solutions|precautions)\.(?:mp4|jpg)/i);
  const cms = read("assets/js/public-cms.js");
  assert.match(cms, /\/api\/public\/videos/);
  assert.match(cms, /video-hub-categories/);
  assert.match(cms, /aria-expanded/);
  assert.match(cms, /i\.ytimg\.com\/vi/);
});
