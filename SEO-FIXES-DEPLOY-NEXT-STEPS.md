# SEO fixes — deployment notes

This release is based on the actual Seobility crawl report for project 1039577, crawl 16323193 (22 November 2026), not on the overall score alone.

## Fixed in this package
- Reduced unnecessary heading-tag count on the homepage and medical dermatology page while preserving accessible heading roles.
- Removed duplicate `WebSite` JSON-LD from the French homepage.
- Replaced duplicate Arabic homepage clinic/physician markup with a `WebPage` entity referencing the canonical clinic entity.
- Added `CollectionPage` structured data to the article and video hubs.
- Added explicit subject wording in the body for the reported title/H1-to-body mismatch pages.
- Added automated checks for the above SEO requirements.
- Corrected the D1 database ID in `wrangler.toml` and GitHub setup documentation to the ID shown in the Cloudflare dashboard.

## One production action still required: D1 migrations
The Seobility crawl received HTTP 503 from `/sitemap-cms.xml`. The Cloudflare D1 dashboard screenshot showed zero tables. This is not fixable by static HTML changes: the CMS schema has to be installed in the existing D1 database.

Run `APPLY-D1-MIGRATIONS-WINDOWS.bat` from the repository root after authenticating Wrangler. It checks the remote migration state and asks for explicit confirmation before applying pending migrations. Confirm the database name and ID before proceeding. Back up any existing data first.

After migrations, verify:
- `https://dermatologue-tanger.com/sitemap-cms.xml` returns HTTP 200 and valid XML.
- The production Pages environment has the `DB` binding pointing to `dermatologue-tanger-cms`.
- `/admin/`, `/api/cms/*`, and appointment email delivery still work.

## Validation run on this package
- JavaScript syntax check: passed (26 files)
- SEO HTML check: passed (20 HTML files)
- Automated tests: passed (23/23)

The 10 pages flagged by Seobility for fewer than 500 words have not been bulk-filled with generic or unreviewed medical text. Add substantial clinical content only after the doctor reviews and approves it. A fresh Seobility crawl is needed to confirm the new score and identify any remaining issues.


## V4.5.4 final pass

1. Run `npm test` and `npm run check` locally.
2. Run `APPLY-D1-MIGRATIONS-WINDOWS.bat` on Windows from this repository root. Confirm the SQL backup succeeds before pending migrations are applied.
3. Verify the existing D1 database ID remains `f66b8595-d025-44e5-bc89-a32f69909509`.
4. Push the release to GitHub; Cloudflare Pages should deploy to the existing project `dermtanger`.
5. Test `/sitemap-cms.xml` (200 + application/xml), `/api/public/articles`, `/api/public/videos`, CMS Access login and the appointment flow.
6. Run a fresh Seobility crawl. The supplied 94% crawl #6 is a baseline, not a result for this unreleased package.
