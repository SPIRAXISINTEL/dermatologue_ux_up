# SEO remediation report — staging preparation

## Implemented in this source archive
1. Added host-aware Pages middleware: all `*.pages.dev` preview responses receive `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`; preview `robots.txt` permits crawling so search engines can observe the `X-Robots-Tag: noindex` response header.
2. Added production-only HSTS response header on HTTPS requests to the apex production host (`max-age=31536000`, no preload and no includeSubDomains).
3. Expanded Pages Function routing so middleware applies to page responses; static assets remain excluded.
4. Added a custom `404.html` with `noindex` and useful navigation. Cloudflare Pages should serve this file with HTTP 404 for unknown paths; this must be verified after deployment.
5. Replaced the advice index's crawler-visible loading message with a stable content fallback and more specific heading text.
6. Added Open Graph and Twitter card metadata to the articles and videos hubs.
7. Added an H2 to the articles hub and a stable CMS content fallback.
8. Kept production canonical URLs and relative internal links. Staging is not redirected.
9. Added/retained WebP picture sources for supported photographs and eager/high-priority loading for the principal doctor image; below-fold photographs remain lazy-loaded.

## Not completed / external owner action required
- WWW-to-apex and HTTP-to-HTTPS redirects must be configured and verified in Cloudflare Redirect Rules / DNS because `_redirects` does not reliably implement hostname normalization for Pages custom domains.
- HSTS is emitted only on HTTPS apex requests after deployment; verify the response header before increasing policy scope.
- Google Business Profile cannot be inspected or edited from the supplied repository archive. Owner must confirm profile ownership and details.
- Sitechecker Rank Tracker profile and keywords cannot be configured from this repository. The connected Sitechecker project returned no tracking profiles or keyword set; create the Tanger/Morocco profile in Sitechecker UI/API with its actual location identifier.
- Lighthouse / PageSpeed field metrics were not present in the Sitechecker response. Run Lighthouse against the deployed staging URL after deployment.
- Medical credentials, services, opening hours, address, and contact details require owner/doctor confirmation before production publication.

## Staging/production behavior
- Preview host: noindex response header; preview robots permits crawling so crawlers can observe the noindex header.
- Production host: production canonicals remain self-referencing; HSTS applies only on HTTPS apex.
- Production URL is not redirected or launched by this change.
