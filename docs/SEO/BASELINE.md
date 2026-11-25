# SEO baseline — Dr Yassir Chaibi

## Source snapshot
- Source archive: `site-dr-chaibi-v4.1.1-cms-fix(1).zip`
- Sitechecker project: `4720789`
- Crawl snapshot reviewed: 2026-11-12
- Sitechecker score: 63/100; 12 pages crawled; 12 indexable; 4 critical issue types; 25 warning-affected pages; 25 opportunity-affected pages.
- Important: the Sitechecker crawl is a snapshot of the deployed staging URL, not a fresh crawl of this modified archive.

## Local repository baseline
- Static HTML/CSS/JavaScript + Cloudflare Pages Functions + D1 CMS.
- Existing production canonicals already point to `https://dermatologue-tanger.com/`.
- Existing static sitemap contains the 12 known public routes.
- Existing dynamic CMS sitemap reads published articles and videos from D1.
- Existing homepage and key pages include structured data; the advice index includes BreadcrumbList.
- The CMS public list script already handles empty and failed API responses, but the initial HTML displayed a loading message to crawlers and users before JS ran.

## Baseline test results before modifications
- `npm test`: 6/6 passed.
- `npm run check`: JavaScript syntax check passed for 21 files.
- No package build script or framework build pipeline is defined; this is a static/Pages Functions project.
