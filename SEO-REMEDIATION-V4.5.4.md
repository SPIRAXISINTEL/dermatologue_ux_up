# V4.5.4 — Seobility final cleanup

## Baseline used

The supplied Seobility Full Export dated 22 November 2026 (crawl #6) reports 94% overall, 88% Tech & Meta, 98% Structure and 97% Content. It crawled 21 URLs, with 19 indexable pages. The WWW redirect is marked OK in the project checklist. The report's detailed findings identify:

- `/sitemap-cms.xml` returns HTTP 503 (technical issue).
- `/articles/` meta description is 1,012 pixels, slightly above Seobility's 1,000-pixel guideline.
- `/articles/` has 495 words in the previous production crawl.
- `/articles/` H1 phrase "Bibliothèque des publications dermatologiques" was not repeated in the body text.
- The homepage target receives one overlong internal anchor originating from the appointment card on `/conseils/`.
- The schema report lists only recommended optional properties, not JSON-LD parsing errors or missing required properties.

## Changes included

- `/articles/`: concise unique meta description; page title and H1 aligned to the publication-library intent; the H1 phrase is included naturally in the introductory body; page-specific explanatory text takes main content above 500 words.
- `/conseils/`: appointment CTA card is a semantic `<article>` with a short, descriptive CTA link, not one large anchor containing all card copy.
- Homepage `MedicalClinic` JSON-LD: added `GeoCoordinates` from the coordinates already used by the site's Google Maps directions link; `openingHoursSpecification` is retained and aligned with the published clinic hours.
- Added regression tests for the exact Seobility findings.
- Hardened the Windows D1 migration helper: checks the expected existing database ID, exports remote D1 before migration, verifies a non-empty backup, applies only pending migrations, then checks all three CMS tables and the video language column.

## Intentionally not fabricated

Seobility's Schema Validation report has zero JSON-LD parse errors, zero required-property errors, and zero invalid-value errors. The remaining suggested fields include `aggregateRating`, `review`, `menu` and `servesCuisine`; these are not added because the clinic has not supplied verified public review aggregates and those restaurant-oriented properties are not applicable. Do not invent patient ratings, reviews, or services to satisfy generic recommendations.

## Deployment-dependent item

`/sitemap-cms.xml` returns 503 while the Pages Function cannot query the required D1 tables or binding. This package intentionally keeps the route fail-closed rather than returning a false empty sitemap. The existing D1 database must first receive pending migrations using `APPLY-D1-MIGRATIONS-WINDOWS.bat`. The existing database ID remains `f66b8595-d025-44e5-bc89-a32f69909509`.

After migration, verify:

1. D1 contains `cms_articles`, `cms_videos` and `cms_audit_log`.
2. `cms_videos` has `spoken_language`.
3. `https://dermatologue-tanger.com/sitemap-cms.xml` returns HTTP 200, `application/xml`, and valid `<urlset>` XML.
4. The CMS can read/publish only after Access roles and email/Resend settings are tested.
5. Run a new Seobility crawl and compare its fresh results. The 94% value is the supplied baseline, not a measured result for this release.

## Validation performed locally

Run:

```powershell
npm test
npm run check
```

Production deployment and D1 migration are not executed by these local checks.
