/**
 * Dynamic sitemap for CMS-published articles and videos.
 *
 * Cloudflare Pages route: /sitemap-cms.xml
 * Requires the production D1 binding named DB.
 */
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

function xmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function sitemapResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=300, s-maxage=300" : "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

export async function onRequestGet({ env }) {
  const configuredBase = env.SITE_URL || "https://dermatologue-tanger.com";
  let base;
  try {
    const parsed = new URL(configuredBase);
    if (parsed.protocol !== "https:" || parsed.hostname !== "dermatologue-tanger.com") {
      throw new Error("SITE_URL must be the official HTTPS production origin");
    }
    base = parsed.origin;
  } catch {
    return sitemapResponse(`${XML_HEADER}<error>Invalid SITE_URL configuration</error>`, 500);
  }

  // Do not silently publish an empty sitemap if Pages is missing its D1 binding.
  if (!env.DB) {
    return sitemapResponse(`${XML_HEADER}<error>CMS database binding DB is not configured</error>`, 503);
  }

  try {
    const [articles, videos] = await Promise.all([
      env.DB.prepare("SELECT slug, updated_at FROM cms_articles WHERE status = 'published'").all(),
      env.DB.prepare("SELECT slug, updated_at FROM cms_videos WHERE status = 'published'").all()
    ]);

    const rows = [
      ...(articles.results || []).map(row => ({ type: "articles", ...row })),
      ...(videos.results || []).map(row => ({ type: "videos", ...row }))
    ];

    const seen = new Set();
    const entries = rows.flatMap(row => {
      const slug = String(row.slug || "");
      // CMS slugs are lowercase URL-safe identifiers; reject unexpected values.
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return [];
      const loc = `${base}/${row.type}/${slug}/`;
      if (seen.has(loc)) return [];
      seen.add(loc);
      const lastmod = validDate(row.updated_at);
      return [`<url><loc>${xmlEscape(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`];
    });

    const xml = `${XML_HEADER}<urlset xmlns="${SITEMAP_NS}">${entries.join("")}</urlset>`;
    return sitemapResponse(xml);
  } catch {
    // Surface a real failure to monitoring/crawlers rather than returning an
    // apparently valid but incomplete sitemap.
    return sitemapResponse(`${XML_HEADER}<error>Unable to generate CMS sitemap</error>`, 503);
  }
}
