# V4.5.3 — Seobility remediation and production steps

## Code fixes included

1. Article card links now use topic-specific anchor text rather than repeating “Lire cet article”.
2. Arabic footer links to French equivalents now identify the destination page.
3. The homepage logo link uses a shorter accessible label; the “Dermatologue · Tanger” subtitle remains visible but outside the link.
4. `/articles/` now targets a publication-library intent. `/conseils/` remains the patient guidance hub. They are not merged or redirected.
5. Four content pages received page-specific, non-diagnostic patient information: the video library, Arabic medical dermatology, acne-scarring article, and Arabic contact page.

## D1 sitemap 503 — required action

`/sitemap-cms.xml` is a real dynamic XML sitemap. It queries the existing D1 tables `cms_articles` and `cms_videos` and publishes only `status = 'published'` records. It deliberately returns HTTP 503 if the D1 binding or required tables are unavailable; do not change this to return a fake empty sitemap.

Before applying migrations, verify that `wrangler.toml` references the intended existing database:

- Database: `dermatologue-tanger-cms`
- Binding: `DB`
- ID: `f66b8595-d025-44e5-bc89-a32f69909509`

Then run the migration helper from the extracted repository root. It displays the current remote migration state, requests explicit confirmation, applies only pending migrations, and verifies `cms_articles`, `cms_videos`, and `cms_audit_log`. Back up the database first. Do not use D1 Time Travel Restore for this operation.

After migration, open `https://dermatologue-tanger.com/sitemap-cms.xml`. Expected response: HTTP 200, `Content-Type: application/xml`, and a valid `<urlset>` document. A sitemap is XML, so Seobility’s “non-analyzable data type” label is expected; the 503 is the actual issue to resolve.

## WWW host — recheck still required

The owner reports changing the existing `www` DNS record and deploying the redirect rule. However, Seobility's live Redirect Check at 2026-11-22 04:52 UTC still could not fetch `https://www.dermatologue-tanger.com/`; the apex HTTPS URL returned HTTP 200 and the HTTP apex redirected to HTTPS. Therefore the WWW host is not yet independently verified.

In Cloudflare Pages, open project `dermtanger` → **Custom domains** and ensure `www.dermatologue-tanger.com` is added and active. Cloudflare Pages requires the subdomain to be associated with the Pages project, not just a manually entered DNS CNAME. Follow the CNAME value shown by the Pages custom-domain flow (the apex currently points to `derma-a37.pages.dev`). Keep the DNS record proxied and retain the existing redirect rule. Then rerun Seobility Redirect Check; expected behavior is one 301 to the apex HTTPS URL with path and query preserved. See Cloudflare's [Pages custom domains guide](https://developers.cloudflare.com/pages/configuration/custom-domains/) and [WWW-to-apex redirect guidance](https://developers.cloudflare.com/pages/how-to/www-redirect/).

## Validation after deployment

- `npm test`
- `npm run check`
- Confirm the 4 expanded page URLs return 200
- Confirm `/articles/` and `/conseils/` have distinct title/H1/description
- Confirm `www` redirects to the apex host
- Confirm `/sitemap-cms.xml` returns valid XML with HTTP 200 after D1 migration
- Run a fresh Seobility crawl and compare results; no score increase is guaranteed.
