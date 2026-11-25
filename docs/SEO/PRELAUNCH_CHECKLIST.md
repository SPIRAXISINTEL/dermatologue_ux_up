# Pre-launch checklist

## P0
- [x] Advice hub heading/content fallback improved in source.
- [x] Initial article-feed loading placeholder removed from advice hub.
- [x] Existing production canonicals retained in static pages.
- [x] Staging noindex middleware and crawl-permitting staging robots response added.
- [x] Custom 404 document added; deployment HTTP status still requires verification.
- [ ] WWW/non-WWW redirect configured in Cloudflare and verified on production.
- [ ] HTTP-to-HTTPS redirect verified on production.
- [ ] Production HSTS response verified after deployment.

## P1
- [ ] Validate every JSON-LD block with external validators after deployment.
- [x] WebP sources and image loading priorities reviewed in source.
- [ ] Crawl all page headings after deployment and confirm no duplicates/hierarchy defects.
- [ ] Doctor review and approval of all French medical content.

## P2
- [ ] Configure Google Morocco / Tanger tracking profile and add approved keyword set in Sitechecker.
- [ ] Verify Google Business Profile ownership, NAP, categories, hours, services and appointment URL.
- [ ] Run independent mobile and desktop Lighthouse and record actual metrics.

## P3
- [ ] Owner-authorized production deployment.
- [ ] Post-launch Sitechecker crawl and GSC inspection.
- [ ] Verify redirects, canonicals, robots, sitemap, 404, forms and analytics on production.
