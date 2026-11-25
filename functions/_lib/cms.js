const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function decodeBase64Url(part) {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
}
function decodePart(part) {
  try { return JSON.parse(decodeBase64Url(part)); } catch { return null; }
}

async function accessIdentity(request, env) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token || !env.CF_ACCESS_AUD || !env.CF_ACCESS_ISSUER) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
  const header = decodePart(encodedHeader);
  const payload = decodePart(encodedPayload);
  if (!header || !payload || header.alg !== "RS256" || !header.kid) return null;
  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== env.CF_ACCESS_AUD && !(Array.isArray(payload.aud) && payload.aud.includes(env.CF_ACCESS_AUD))) return null;
  if (!Number.isFinite(payload.exp) || payload.exp <= now || (payload.nbf && payload.nbf > now) || payload.iss !== String(env.CF_ACCESS_ISSUER).replace(/\/$/, "")) return null;
  let jwks;
  try {
    const response = await fetch(`${String(env.CF_ACCESS_ISSUER).replace(/\/$/, "")}/cdn-cgi/access/certs`, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!response.ok) return null;
    jwks = await response.json();
  } catch { return null; }
  const jwk = (jwks.keys || []).find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) return null;
  try {
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signature = Uint8Array.from(decodeBase64Url(encodedSignature), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`));
    if (!valid) return null;
  } catch { return null; }
  const email = String(payload.email || "").trim().toLowerCase();
  return email ? { email, name: payload.name || email } : null;
}

export async function requireCms(request, env, { doctorOnly = false } = {}) {
  if (!env.DB || !env.CF_ACCESS_AUD || !env.CF_ACCESS_ISSUER) return { response: json({ error: "CMS non configuré. Vérifiez D1 et Cloudflare Access." }, 503) };
  const identity = await accessIdentity(request, env);
  if (!identity) return { response: json({ error: "Authentification Cloudflare Access requise." }, 401) };
  const doctor = String(env.DOCTOR_EMAIL || "").trim().toLowerCase();
  const editors = String(env.CMS_EDITOR_EMAILS || "").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  const isDoctor = Boolean(doctor && identity.email === doctor);
  const isEditor = editors.includes(identity.email);
  if (!isDoctor && !isEditor) return { response: json({ error: "Accès CMS non autorisé." }, 403) };
  if (doctorOnly && !isDoctor) return { response: json({ error: "Seul le médecin référent peut valider et publier." }, 403) };
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return { response: json({ error: "Origine non autorisée." }, 403) };
  return { identity: { ...identity, role: isDoctor ? "doctor" : "editor" } };
}

export function cleanText(value, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}
export function slugify(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}
export function validSlug(value) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 90; }
export function audit(db, actor, action, type, id, details = {}) {
  return db.prepare("INSERT INTO cms_audit_log(actor_email, action, entity_type, entity_id, occurred_at, details_json) VALUES(?,?,?,?,?,?)")
    .bind(actor, action, type, id, new Date().toISOString(), JSON.stringify(details)).run();
}
export function htmlEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
export function markdownToHtml(markdown) {
  // Deliberately small safe renderer: raw HTML is escaped; links are restricted to HTTP(S).
  const escaped = htmlEscape(markdown);
  return escaped.split(/\n{2,}/).map((block) => {
    const lines = block.split("\n");
    if (/^### /.test(lines[0])) return `<h3>${inline(lines.shift().slice(4))}</h3>${lines.length ? `<p>${lines.map(inline).join("<br>")}</p>` : ""}`;
    if (/^## /.test(lines[0])) return `<h2>${inline(lines.shift().slice(3))}</h2>${lines.length ? `<p>${lines.map(inline).join("<br>")}</p>` : ""}`;
    if (/^# /.test(lines[0])) return `<h2>${inline(lines.shift().slice(2))}</h2>${lines.length ? `<p>${lines.map(inline).join("<br>")}</p>` : ""}`;
    if (lines.every((line) => /^[-*] /.test(line))) return `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${lines.map(inline).join("<br>")}</p>`;
  }).join("\n");
}
function inline(value) {
  return value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="nofollow noopener">$1</a>');
}
export function pageResponse(html, status = 200) {
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "cache-control": "public, max-age=300, s-maxage=900" } });
}
export function articlePage(item, env) {
  const base = env.SITE_URL || "https://dermatologue-tanger.com";
  const url = `${base}/articles/${item.slug}/`;
  const title = item.seo_title || `${item.title} | Dr Yassir Chaibi – Dermatologue à Tanger`;
  const description = item.seo_description || item.excerpt;
  const body = markdownToHtml(item.body_markdown);
  const cover = item.cover_image ? (item.cover_image.startsWith("/") ? `${base}${item.cover_image}` : item.cover_image) : null;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "MedicalWebPage", "@id": `${url}#webpage`, name: item.title, description, url, image: cover || undefined, inLanguage: "fr", mainEntity: { "@id": `${url}#article` } },
    { "@type": "Article", "@id": `${url}#article`, headline: item.title, description, articleBody: item.body_markdown, image: cover || undefined, datePublished: item.published_at, dateModified: item.updated_at, author: { "@type": "Physician", name: "Dr Yassir Chaibi", url: `${base}/docteur/` }, publisher: { "@type": "Organization", name: "Dr Yassir Chaibi – Dermatologue à Tanger", url: base }, mainEntityOfPage: { "@id": `${url}#webpage` }, inLanguage: "fr" }
  ] };
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(title)}</title><meta name="description" content="${htmlEscape(description)}"><link rel="canonical" href="${htmlEscape(url)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="article"><meta property="og:title" content="${htmlEscape(title)}"><meta property="og:description" content="${htmlEscape(description)}"><meta property="og:url" content="${htmlEscape(url)}">${cover ? `<meta property="og:image" content="${htmlEscape(cover)}">` : ""}<link rel="stylesheet" href="/assets/css/main.css"><link rel="stylesheet" href="/assets/css/home-redesign.css"><link rel="stylesheet" href="/assets/css/site-wide-redesign.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,"\\u003c")}</script></head><body><header class="site-head"><div class="wrap"><a class="brand" href="/"><span class="brand-mark">YC</span><span>Dr Yassir Chaibi<small>Dermatologue · Tanger</small></span></a><nav class="nav-main" id="nav-main" aria-label="Navigation principale"><a href="/dermatologie-medicale-tanger/">Dermatologie</a><a href="/medecine-esthetique-tanger/">Médecine esthétique</a><a href="/conseils/">Conseils</a><a href="/videos/">Vidéos</a><a href="/#rendez-vous">Rendez-vous</a></nav><div class="head-cta"><a class="btn btn-dark btn-sm" href="/contact/#rendez-vous">Rendez-vous</a></div></div></header><main class="container section"><p><a href="/conseils/">← Tous les conseils</a></p><article class="article-content"><p class="eyebrow">${htmlEscape(item.category)} · Article médical</p><h1>${htmlEscape(item.title)}</h1>${cover ? `<img class="article-cover" src="${htmlEscape(cover)}" alt="${htmlEscape(item.title)}" loading="eager">` : ""}<p class="lead">${htmlEscape(item.excerpt)}</p><p class="muted">Par ${htmlEscape(item.author_name)} · Mis à jour le ${new Date(item.updated_at).toLocaleDateString("fr-FR")}</p>${body}<aside class="card"><h2>Besoin d'un avis médical ?</h2><p>Une consultation permet d'évaluer votre situation et de discuter des options adaptées.</p><a class="btn btn-blue" href="/#rendez-vous">Demander un rendez-vous</a></aside></article></main><footer class="site"><div class="wrap"><p>Dr Yassir Chaibi · Dermatologue à Tanger</p><a href="/">Accueil</a> · <a href="/contact/">Contact et rendez-vous</a></div></footer><script defer src="/assets/js/main.js"></script></body></html>`;
}
export function videoPage(item, env) {
  const base = env.SITE_URL || "https://dermatologue-tanger.com";
  const url = `${base}/videos/${item.slug}/`;
  const title = item.seo_title || `${item.title} | Dr Yassir Chaibi`;
  const description = item.seo_description || item.description;
  const thumb = `https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`;
  const schema = { "@context": "https://schema.org", "@type": "VideoObject", name: item.title, description, inLanguage: "ar-MA", thumbnailUrl: [thumb], uploadDate: item.published_at, embedUrl: `https://www.youtube-nocookie.com/embed/${item.youtube_id}`, contentUrl: item.youtube_url, publisher: { "@type": "Organization", name: "Dr Yassir Chaibi – Dermatologue à Tanger" } };
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(title)}</title><meta name="description" content="${htmlEscape(description)}"><link rel="canonical" href="${htmlEscape(url)}"><meta name="robots" content="index,follow"><meta property="og:type" content="video.other"><meta property="og:title" content="${htmlEscape(title)}"><meta property="og:description" content="${htmlEscape(description)}"><meta property="og:image" content="${thumb}"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,"\\u003c")}</script><link rel="stylesheet" href="/assets/css/main.css"><link rel="stylesheet" href="/assets/css/home-redesign.css"><link rel="stylesheet" href="/assets/css/site-wide-redesign.css"></head><body><header class="site-head"><div class="wrap"><a class="brand" href="/"><span class="brand-mark">YC</span><span>Dr Yassir Chaibi<small>Dermatologue · Tanger</small></span></a><nav class="nav-main" id="nav-main" aria-label="Navigation principale"><a href="/dermatologie-medicale-tanger/">Dermatologie</a><a href="/conseils/">Conseils</a><a href="/videos/">Vidéos</a><a href="/#rendez-vous">Rendez-vous</a></nav><div class="head-cta"><a class="btn btn-dark btn-sm" href="/contact/#rendez-vous">Rendez-vous</a></div></div></header><main class="container section"><p><a href="/videos/">← Toutes les vidéos</a></p><p class="eyebrow">Vidéo pédagogique · Darija marocaine</p><h1>${htmlEscape(item.title)}</h1><p class="lead">${htmlEscape(description)}</p><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${htmlEscape(item.youtube_id)}" title="${htmlEscape(item.title)} — vidéo en darija marocaine" lang="ar-MA" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p>Cette vidéo pédagogique en darija marocaine ne remplace pas une consultation médicale personnalisée.</p><a class="btn btn-blue" href="/#rendez-vous">Demander un rendez-vous</a></main><footer class="site"><p>Dr Yassir Chaibi · Dermatologue à Tanger</p></footer></body></html>`;
}
