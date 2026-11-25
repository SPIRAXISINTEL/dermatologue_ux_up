import { json, requireCms, cleanText, slugify, validSlug, audit } from "../../_lib/cms.js";

export async function onRequestGet({ request, env }) {
  const auth = await requireCms(request, env); if (auth.response) return auth.response;
  const { results = [] } = await env.DB.prepare("SELECT * FROM cms_articles ORDER BY updated_at DESC LIMIT 250").all();
  return json({ items: results, actor: auth.identity });
}
export async function onRequestPost({ request, env }) {
  const auth = await requireCms(request, env); if (auth.response) return auth.response;
  let d; try { d = await request.json(); } catch { return json({ error: "JSON invalide." }, 400); }
  const title = cleanText(d.title, 180), excerpt = cleanText(d.excerpt, 500), body = cleanText(d.body_markdown, 30000);
  const slug = slugify(d.slug || title);
  if (!title || !excerpt || body.length < 80 || !validSlug(slug)) return json({ error: "Titre, résumé, contenu (80 caractères minimum) et slug valide requis." }, 400);
  const cover = cleanText(d.cover_image, 500);
  if (cover && !(cover.startsWith("/assets/") || /^https:\/\//i.test(cover))) return json({ error: "Image de couverture : URL HTTPS ou chemin /assets/ uniquement." }, 400);
  const id = crypto.randomUUID(), now = new Date().toISOString();
  try {
    await env.DB.prepare(`INSERT INTO cms_articles(id,slug,title,excerpt,body_markdown,category,author_name,status,created_by,updated_by,created_at,updated_at,seo_title,seo_description,cover_image) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, slug, title, excerpt, body, cleanText(d.category || "Dermatologie", 80), "Dr Yassir Chaibi", "draft", auth.identity.email, auth.identity.email, now, now, cleanText(d.seo_title, 180) || null, cleanText(d.seo_description, 300) || null, cover || null).run();
    await audit(env.DB, auth.identity.email, "create", "article", id, { slug });
    return json({ id, slug, status: "draft" }, 201);
  } catch (error) { return json({ error: "Slug déjà utilisé ou erreur d'enregistrement." }, 409); }
}
