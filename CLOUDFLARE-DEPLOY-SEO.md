# Cloudflare Pages deployment and local SEO checklist — v4.3.0


## Production-domain release note — 16 November 2026

The source is configured for the official production origin `https://dermatologue-tanger.com`:
- public HTML pages use self-referencing canonicals on that domain and `index, follow`;
- the production sitemap and robots.txt use that domain;
- the Pages middleware applies `noindex, nofollow` only to `*.pages.dev` preview hosts;
- the `dermtanger.pages.dev` preview is intentionally excluded from search indexing.

Do not remove the preview noindex policy to make Seobility crawl the preview. Once DNS and the Cloudflare custom-domain activation are complete, run the crawler against the official hostname.

## Deployment target

- Cloudflare Pages project: `dermtanger`
- Build command: leave empty (static HTML + Pages Functions)
- Build output directory: `.`
- Root directory: `/`
- Custom production hostname: `dermatologue-tanger.com`
- Preview hostname: `dermtanger.pages.dev`
- Production canonical origin: `https://dermatologue-tanger.com`

## Important preview / production indexing policy

The `*.pages.dev` host is a preview environment and must remain `noindex`.
The middleware now:
- emits `X-Robots-Tag: noindex, nofollow` on preview responses;
- rewrites preview HTML robots meta to the same exact directive;
- removes preview canonical and hreflang tags, preventing the old contradictory combination (noindex preview + canonical to production);
- leaves production HTML untouched, retaining its self-referencing canonical and `index, follow`;
- adds HSTS on HTTPS responses.

Do not use the `pages.dev` preview hostname as the SEO benchmark or submit it to Google Search Console. Run Sitechecker/Seobility against `https://dermatologue-tanger.com/` after the custom domain is active. A preview crawler will correctly report zero indexable pages.

## Cloudflare Pages settings

Build:
- Framework preset: None
- Build command: (empty)
- Build output directory: `.`
- Root directory: `/`

Environment and bindings:
- D1 binding name: `DB`
- D1 database: `dermatologue-tanger-cms`
- D1 database ID: use the existing ID already provisioned in `wrangler.toml`; do not create a duplicate database.
- `SITE_URL`: `https://dermatologue-tanger.com`
- Configure `CF_ACCESS_AUD`, `DOCTOR_EMAIL`, and `CMS_EDITOR_EMAILS` as Cloudflare environment variables only if required by the existing CMS functions. Never put secrets in Git.

## Required Cloudflare dashboard work (not achievable by a ZIP alone)

1. Attach `dermatologue-tanger.com` as a custom domain to the `dermtanger` Pages project and wait for Cloudflare to issue/activate SSL.
2. Create a Redirect Rule for `www.dermatologue-tanger.com/*` to `https://dermatologue-tanger.com/$1` with status 301, preserving path and query string.
3. Enforce HTTP to HTTPS at Cloudflare (Always Use HTTPS or an equivalent redirect rule). Test both HTTP and HTTPS variants.
4. Protect `/admin/*` and `/api/cms/*` using Cloudflare Access. A `noindex` header is not authentication. Restrict access to the owner's authorized email identities.
5. Confirm D1 binding `DB` is attached in both Production and Preview environments if CMS functionality is expected in both.
6. Set the actual email provider DNS records (SPF, DKIM, DMARC) only after choosing the mail sender/provider. Do not publish a fabricated SPF/DKIM record.
7. Enable DNSSEC and add a CAA record only after confirming the certificate authority used by Cloudflare and reviewing existing DNS records.

## Search engine launch checklist

1. Verify the custom domain returns HTTP 200 for `/`, `/dermatologie-medicale-tanger/`, `/chirurgie-dermatologique-tanger/`, `/contact/`, `/docteur/`, `/medecine-esthetique-tanger/`, `/conseils/`, and `/ar/`.
2. Verify production pages return `index, follow` in HTML and do not return an `X-Robots-Tag: noindex`.
3. Verify each production canonical points to the same production URL (trailing slash policy consistent).
4. Verify the production `robots.txt` is crawl-permissive for public pages and lists `https://dermatologue-tanger.com/sitemap.xml`.
5. Verify `/sitemap.xml` and `/sitemap-cms.xml` return XML and only production URLs.
6. Verify unknown URLs return an actual HTTP 404, not a 200 soft-404.
7. Add the Domain property `dermatologue-tanger.com` in Google Search Console, verify by DNS, and submit `/sitemap.xml`.
8. Configure Google Business Profile with the verified real-world clinic name, category, address, phone, hours, appointment URL, and website. Do not create a duplicate listing.
9. Keep the clinic's name/address/phone consistent across the website and legitimate medical directories. Request genuine patient reviews without incentives or review gating; never reveal patient status in replies.
10. Add analytics only with an appropriate privacy/consent setup. Do not send symptoms, diagnoses, appointment notes, or other health information to analytics.

## Local SEO content architecture

Existing service pages should remain the primary landing pages. Add new condition-specific pages only when the physician can provide original, medically reviewed information that is meaningfully distinct:
- acne and acne scars;
- eczema and psoriasis;
- hair loss and scalp conditions;
- mole examination and dermoscopy;
- shingles (zona) and herpes;
- skin infections and fungal disease;
- dermatological manifestations of sexually transmitted infections;
- laser and aesthetic dermatology.

Each new page should include: a precise title and meta description, one clear H1, clinically accurate content reviewed by the physician, date of medical review, named real author/reviewer, useful internal links, a clear contact/appointment path, and relevant structured data only where accurate. Do not create thin doorway pages for every keyword or neighborhood.

## Audit evidence addressed in this release

The supplied November 12, 2026 reports identified:
- staging pages marked noindex in both HTML and HTTP headers, while production canonicals pointed to another host;
- mismatched / contradictory staging robots signals and canonicalized-noindex warnings;
- missing HSTS on the staging host;
- duplicate repeated internal CTA anchors on several pages;
- weak one-word internal anchor text;
- three advice pages with fewer than ten internal backlinks;
- sitemap not detected by one older analyzer run;
- unminified CSS/JS notices (not treated as a ranking blocker);
- security scanner recommendations for HSTS, CSP, frame protections, MIME sniffing, SPF/DMARC, and admin exposure.

The preview middleware and security headers address the contradictory preview signals and HSTS. The repeated CTA anchors were diversified on affected pages. Dashboard-only items (domain redirects, Access, DNS authentication, Search Console, Business Profile) remain owner actions.

## Medical and business verification

Before indexing, the physician/owner must confirm the professional name, exact clinic address, GPS coordinates, phone/WhatsApp, opening hours, available procedures, languages, credentials, and all medical statements. No outcomes, qualifications, or services should be inferred.
