# V4.5.2 SEO remediation — deployment and remaining account actions

## Included source changes
- Replaced homepage article cards that wrapped title, excerpt and metadata in one long anchor with concise title/read links.
- Corrected bilingual language-switch destinations for matched French/Arabic pages and made link labels contextual.
- Changed WhatsApp links from the `wa.me` short redirect to the direct official `api.whatsapp.com/send` format.
- Removed the incomplete `/contact/ 301` redirect; `/contact/` is a real canonical page and must remain a 200 page.
- Replaced repeated article disclaimer paragraphs with topic-specific patient-information notes.
- Removed the duplicated cabinet motto from the doctor biography page (it remains on the homepage).
- Added useful patient-preparation and resource-navigation copy to the short pages flagged by Seobility. These additions avoid inventing credentials, outcomes or additional medical services.
- Added literal title/H1 phrase coverage where Seobility identified a mismatch.
- Extended the D1 migration helper to verify the three expected CMS tables after applying migrations.

## D1 CMS: required before `/sitemap-cms.xml` can return 200
The current Seobility report records `/sitemap-cms.xml` as HTTP 503. The Pages Function returns 503 when D1 is unavailable or when the CMS tables/query cannot be used. That behaviour is intentional: it must not pretend that a failed CMS query is a valid empty sitemap.

1. Confirm the Pages Production D1 binding is `DB` and points to database `dermatologue-tanger-cms` (ID `f66b8595-d025-44e5-bc89-a32f69909509`).
2. Run `APPLY-D1-MIGRATIONS-WINDOWS.bat` from the repository root. Review the target database and make a backup first if it contains data.
3. Confirm the migration output lists `cms_articles`, `cms_videos` and `cms_audit_log`.
4. Open `/sitemap-cms.xml`; it must return 200 and valid XML.
5. Test `/api/public/articles`, `/api/public/videos` and the CMS admin using the Cloudflare Access policy.

Do not change the D1 ID, create a second database, or suppress the 503 by returning an empty sitemap.

## WWW redirect — Cloudflare account/DNS action
Seobility's redirect check reports that the apex domain and HTTP-to-HTTPS redirect work, but `https://www.dermatologue-tanger.com/` is not reachable. This cannot be solved by a Pages `_redirects` line while `www` does not resolve. In Cloudflare DNS:

1. Add `CNAME` `www` → `dermatologue-tanger.com`, with Proxy status **Proxied** (orange cloud). Ensure there is no conflicting `www` record.
2. In Rules → Redirect Rules, create a rule matching `http.host eq "www.dermatologue-tanger.com"`.
3. Use a dynamic target that preserves the full path and query: `concat("https://dermatologue-tanger.com", http.request.uri.path)` and enable query-string preservation. Set status 301.
4. Verify both `https://www.dermatologue-tanger.com/a-path` and `http://www.dermatologue-tanger.com/a-path` end at the matching non-www HTTPS URL.

The Seobility audit also flags the `wa.me` → `api.whatsapp.com` redirect. The release switches to the official API send URL; confirm that the prefilled message still opens correctly on mobile and desktop.

## Deploy
- Extract the ZIP contents into the repository root.
- Commit to a branch and deploy through the existing `dermtanger` Pages project.
- Keep build command empty, build output `.` and retain `functions/`, `wrangler.toml`, migrations, and the existing D1 ID.
- Run `npm test` and `npm run check` locally or in GitHub Actions.
- After the D1 and WWW account actions, start a fresh Seobility crawl.

## What cannot be resolved by source files alone
The D1 migration must run against the actual Cloudflare account/database, and the `www` DNS/redirect rule must be configured in Cloudflare. This package cannot claim those account-side actions have happened.


## Automated validation
The release's checks include: unique canonical and H1 validation, heading hierarchy, JSON-LD parsing, local language-switch target existence, long internal article-anchor detection, WhatsApp short-link detection, and redirect-rule syntax. Run:
```bash
npm test
npm run check
```
