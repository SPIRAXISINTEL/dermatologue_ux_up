# Redirect and canonical plan

- Production canonical base: `https://dermatologue-tanger.com`.
- Keep existing public paths stable.
- Use relative internal links.
- Keep staging on `cmsfixed1.pages.dev` for QA; do not redirect it.
- Preview requests receive `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` through `functions/_middleware.js`.
- Preview `/robots.txt` allows crawling so crawlers can read the `X-Robots-Tag: noindex` response header.
- Production HTTPS apex responses receive `Strict-Transport-Security: max-age=31536000`.
- Configure `http://dermatologue-tanger.com/*` -> `https://dermatologue-tanger.com/$1` and `https://www.dermatologue-tanger.com/*` -> `https://dermatologue-tanger.com/$1` in Cloudflare Redirect Rules. Preserve path and query string; use 301/308 permanent redirects.
- Do not add `includeSubDomains` or `preload` until every affected subdomain and HTTPS endpoint is verified.
- Verify unknown paths return HTTP 404, not a 200 soft 404.
