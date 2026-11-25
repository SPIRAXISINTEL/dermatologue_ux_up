/**
 * Cloudflare Pages host-aware SEO and transport middleware.
 *
 * Preview deployments are deliberately noindex. Their HTML meta robots and
 * X-Robots-Tag response header are kept identical. Preview canonical/hreflang
 * declarations are removed so a noindex URL does not simultaneously claim a
 * production canonical. The production host retains self-referencing canonicals.
 */
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const isPreview = host.endsWith(".pages.dev");
  const isHttps = url.protocol === "https:";

  if (isPreview && url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nAllow: /\n", {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
        "cache-control": "no-store",
        ...(isHttps ? { "strict-transport-security": "max-age=31536000" } : {})
      }
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);

  if (isHttps) {
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }

  if (!isPreview) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Cache-Control", "no-store");

  const contentType = headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    let html = await response.text();

    // Replace any existing robots meta directive with the exact header policy.
    const robotsMeta = /<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>/i;
    if (robotsMeta.test(html)) {
      html = html.replace(robotsMeta, '<meta name="robots" content="noindex, nofollow">');
    } else {
      html = html.replace(/<head\b[^>]*>/i, (head) => `${head}\n<meta name="robots" content="noindex, nofollow">`);
    }

    // Do not leave a canonical-to-production directive on a noindex preview URL.
    html = html.replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>\s*/gi, "");
    html = html.replace(/<link\b(?=[^>]*\brel\s*=\s*["']alternate["'])(?=[^>]*\bhreflang\s*=)[^>]*>\s*/gi, "");

    headers.delete("content-length");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
