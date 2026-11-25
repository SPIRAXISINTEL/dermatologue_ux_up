# SEO remediation release — V4.5.1

## Evidence-based fixes from Seobility crawl 3 (22 November 2026)

The latest crawl reported these concrete items:
- Two pages flagged for excessive heading markup: homepage and medical dermatology page. Repeated card/step labels are now accessible `role="heading"` labels rather than adding unnecessary document-outline headings.
- Four schema-validation pages: homepage, Arabic homepage, articles hub and videos hub. The French homepage now has one `WebSite` entity; the Arabic homepage references the canonical clinic entity instead of duplicating a separate physician entity; content hubs now declare `CollectionPage`.
- Two title/H1-to-body text mismatch cases on the articles hub and Arabic contact page, plus five H1/body phrase mismatches on editorial/service pages. The page introductions now explicitly contain their corresponding subject phrases.
- Internal link targets to `/contact` were reported as redirecting to `/contact/`; the source package is checked for bare `/contact` internal links and the canonical destination remains `/contact/`.
- `/sitemap-cms.xml` returned HTTP 503. The Cloudflare D1 dashboard screenshot showed the target database with zero tables. The binding exists, but the CMS schema migrations have not been applied. This is an account/database operation and cannot be completed by editing the ZIP alone.

## D1 action required to clear the live 503

1. Confirm the D1 database is `dermatologue-tanger-cms` with ID `f66b8595-d025-44e5-bc89-a32f69909509`.
2. In the repository root, run `APPLY-D1-MIGRATIONS-WINDOWS.bat` (or run the Wrangler migration commands described in `GITHUB-SETUP.md`).
3. Verify that migrations `0001_cms.sql` and `0002_video_darija.sql` are applied and the tables exist.
4. Open `https://dermatologue-tanger.com/sitemap-cms.xml`; it should return HTTP 200 XML. If it still returns 503, inspect the Pages Production D1 binding `DB` and the Function logs.

Do not replace the database or change the database ID. Back up any existing CMS data before applying pending migrations.

## Validation

Run from the repository root:

```bash
node scripts/check.mjs
node scripts/seo-check.mjs
node --test tests/*.test.js
```

The source package is not considered fully operational until the D1 migration action is completed and the dynamic sitemap is confirmed with HTTP 200. A new Seobility crawl is required to measure the updated audit score; this package does not promise a particular score or Google ranking.

## Deployment

Cloudflare Pages project: `dermtanger`
Build command: empty (static HTML + Pages Functions)
Build output directory: `.`
D1 binding: `DB` → `dermatologue-tanger-cms`
Production URL: `https://dermatologue-tanger.com`

Keep the existing Pages project, production domain, Access policies, Resend secrets and D1 database. Do not publish a static-only ZIP upload; use the existing Git-connected Pages deployment so `functions/` is deployed.
