import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const htmlFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html") && !full.startsWith("admin/")) htmlFiles.push(full);
  }
}
walk(".");
const failures = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const description = html.match(/<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']+["'])[^>]*>/i);
  if (!title) failures.push(`${file}: missing title`);
  if (!description) failures.push(`${file}: missing meta description`);

  if (/<[^>]+\sstyle=["\']/i.test(html)) failures.push(`${file}: inline style attributes must be externalized`);

  if (file !== "404.html") {
    const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]);
    const canonicalTags = linkTags.filter(tag => /\brel=["']canonical["']/i.test(tag));
    const canonicalHref = canonicalTags[0]?.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (canonicalTags.length !== 1) failures.push(`${file}: expected exactly one canonical, found ${canonicalTags.length}`);
    else if (!canonicalHref?.startsWith("https://dermatologue-tanger.com/")) failures.push(`${file}: canonical is not production domain`);
    const h1s = [...html.matchAll(/<h1\b/gi)];
    if (h1s.length !== 1) failures.push(`${file}: expected exactly one H1, found ${h1s.length}`);
  }

  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m => ({ level: Number(m[1]), text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("fr") }));
  let previous = 0;
  const seen = new Set();
  for (const heading of headings) {
    if (previous && heading.level > previous + 1) failures.push(`${file}: heading level jump H${previous} to H${heading.level} (${heading.text})`);
    if (heading.text && seen.has(heading.text)) failures.push(`${file}: duplicate heading text "${heading.text}"`);
    if (heading.text) seen.add(heading.text);
    previous = heading.level;
  }

  for (const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(block[1]); }
    catch { failures.push(`${file}: invalid JSON-LD block`); }
  }
}

const headers = readFileSync("_headers", "utf8");
if (/style-src[^\n]*unsafe-inline/i.test(headers)) failures.push("_headers: CSP must not allow unsafe-inline styles");
if (!headers.includes("Cross-Origin-Opener-Policy:")) failures.push("_headers: missing Cross-Origin-Opener-Policy");
const adminHtml = readFileSync("admin/index.html", "utf8");
if (/<style\b/i.test(adminHtml) || /<[^>]+\sstyle=["\']/i.test(adminHtml)) failures.push("admin/index.html: inline CSS must be externalized");
if (!adminHtml.includes("/assets/css/admin.css")) failures.push("admin/index.html: admin.css is not linked");
const homeHtml = readFileSync("index.html", "utf8");
const websiteEntities = [...homeHtml.matchAll(/"@type"\s*:\s*"WebSite"/g)];
if (websiteEntities.length !== 1) failures.push(`index.html: expected one WebSite entity, found ${websiteEntities.length}`);
const arabicHome = readFileSync("ar/index.html", "utf8");
if (!arabicHome.includes('"@type":"WebPage"') || !arabicHome.includes('"about":{"@id":"https://dermatologue-tanger.com/#cabinet"}')) failures.push("ar/index.html: expected a WebPage entity linked to the canonical clinic entity");
for (const hub of ["articles/index.html", "videos/index.html"]) {
  const html = readFileSync(hub, "utf8");
  if (!html.includes('"@type":"CollectionPage"')) failures.push(`${hub}: missing CollectionPage structured data`);
}
for (const file of ["index.html", "dermatologie-medicale-tanger/index.html"]) {
  const html = readFileSync(file, "utf8");
  const headingCount = [...html.matchAll(/<h[1-6]\b/gi)].length;
  if (headingCount > 20) failures.push(`${file}: excessive heading tags (${headingCount}); use semantic section headings and accessible non-heading labels for card titles`);
}
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (/href=["']\/contact(?:[?#][^"']*)?["']/i.test(html)) failures.push(`${file}: internal contact link must use canonical /contact/ URL`);
}

const sitemap = readFileSync("sitemap.xml", "utf8");
for (const path of ["/ar/", "/ar/dermatologie-medicale-tanger/", "/ar/medecine-esthetique-tanger/", "/ar/chirurgie-dermatologique-tanger/", "/ar/contact/"]) if (!sitemap.includes(`https://dermatologue-tanger.com${path}`)) failures.push(`sitemap.xml: missing ${path}`);


// Deployment-level SEO consistency checks added for the V4.5.2 remediation.
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const langSwitch = html.match(/<a\b(?=[^>]*\bclass=["'][^"']*\blang-switch\b[^"']*["'])[^>]*>/i);
  if (langSwitch) {
    const href = langSwitch[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href?.startsWith("/")) failures.push(`${file}: language switch must use a root-relative internal URL`);
    else {
      const targetPath = href.split(/[?#]/, 1)[0];
      const targetFile = targetPath === "/" ? "index.html" : `${targetPath.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
      try { readFileSync(targetFile, "utf8"); }
      catch { failures.push(`${file}: language switch target does not exist (${href})`); }
    }
  }
  for (const link of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = link[1];
    const anchorText = link[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (href.startsWith("/conseils/") && anchorText.length > 110) failures.push(`${file}: overly long internal article anchor (${anchorText.slice(0, 60)}...)`);
  }
  if (/https:\/\/wa\.me\//i.test(html)) failures.push(`${file}: WhatsApp short-link redirect remains; use the direct official send URL`);
}
if (/https:\/\/wa\.me\//i.test(readFileSync("assets/js/main.js", "utf8"))) failures.push("assets/js/main.js: WhatsApp short-link redirect remains; use the direct official send URL");
const redirects = readFileSync("_redirects", "utf8").split(/\r?\n/);
for (const [i, line] of redirects.entries()) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  if (trimmed.split(/\s+/).length < 3) failures.push(`_redirects:${i + 1}: incomplete redirect rule`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`SEO HTML checks passed: ${htmlFiles.length} HTML files, production canonicals, one H1, heading order, unique headings and valid JSON-LD.`);
}
