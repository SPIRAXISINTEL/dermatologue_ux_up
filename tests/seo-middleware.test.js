import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

test("Pages preview HTML has matching noindex directives and no production canonical/hreflang", async () => {
  const html = `<!doctype html><html><head><meta name="robots" content="index, follow"><link rel="canonical" href="https://dermatologue-tanger.com/"><link rel="alternate" hreflang="fr-MA" href="https://dermatologue-tanger.com/"></head><body>preview</body></html>`;
  const result = await onRequest({
    request: new Request("https://dermtanger.pages.dev/"),
    next: async () => new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } })
  });
  const body = await result.text();
  assert.equal(result.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.match(body, /<meta name="robots" content="noindex, nofollow">/);
  assert.doesNotMatch(body, /rel="canonical"/i);
  assert.doesNotMatch(body, /hreflang=/i);
  assert.equal(result.headers.get("cache-control"), "no-store");
});

test("Pages preview robots.txt permits crawling so noindex can be observed", async () => {
  const result = await onRequest({
    request: new Request("https://dermtanger.pages.dev/robots.txt"),
    next: async () => new Response("should not run")
  });
  assert.equal(result.status, 200);
  assert.match(await result.text(), /Allow: \/\n/);
  assert.equal(result.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(result.headers.get("strict-transport-security"), "max-age=31536000");
});

test("all HTTPS hosts get HSTS; production HTML keeps its self-canonical unchanged", async () => {
  const productionHtml = '<html><head><link rel="canonical" href="https://dermatologue-tanger.com/"><meta name="robots" content="index, follow"></head></html>';
  const production = await onRequest({
    request: new Request("https://dermatologue-tanger.com/"),
    next: async () => new Response(productionHtml, { headers: { "content-type": "text/html" } })
  });
  const body = await production.text();
  assert.equal(production.headers.get("strict-transport-security"), "max-age=31536000");
  assert.match(body, /rel="canonical"/);
  assert.match(body, /index, follow/);
  assert.equal(production.headers.get("x-robots-tag"), null);
});

test("non-HTML preview responses remain noindex without body rewriting", async () => {
  const response = await onRequest({
    request: new Request("https://pr-123.pages.dev/assets/site.css"),
    next: async () => new Response("body", { headers: { "content-type": "text/css" } })
  });
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(await response.text(), "body");
});
