import { json, requireCms, cleanText, slugify, validSlug, audit } from "../../../_lib/cms.js";
export async function onRequestGet({ request, env, params }) {
  const auth = await requireCms(request, env); if (auth.response) return auth.response;
  const item = await env.DB.prepare("SELECT * FROM cms_articles WHERE id = ?").bind(params.id).first();
  return item ? json(item) : json({ error: "Article introuvable." }, 404);
}
export async function onRequestPatch({ request, env, params }) {
  const auth = await requireCms(request, env); if (auth.response) return auth.response;
  const item = await env.DB.prepare("SELECT * FROM cms_articles WHERE id = ?").bind(params.id).first();
  if (!item) return json({ error: "Article introuvable." }, 404);
  if (item.status === "published" || item.status === "archived") return json({ error: "Un article publié/archivé doit être remis en brouillon par le médecin avant modification." }, 409);
  let d; try { d = await request.json(); } catch { return json({ error: "JSON invalide." }, 400); }
  const title = cleanText(d.title ?? item.title, 180), excerpt = cleanText(d.excerpt ?? item.excerpt, 500), body = cleanText(d.body_markdown ?? item.body_markdown, 30000), slug = slugify(d.slug ?? item.slug);
  if (!title || !excerpt || body.length < 80 || !validSlug(slug)) return json({ error: "Champs requis invalides." }, 400);
  const cover = cleanText(d.cover_image ?? item.cover_image, 500);
  if (cover && !(cover.startsWith("/assets/") || /^https:\/\//i.test(cover))) return json({ error: "Image de couverture : URL HTTPS ou chemin /assets/ uniquement." }, 400);
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(`UPDATE cms_articles SET slug=?,title=?,excerpt=?,body_markdown=?,category=?,status='draft',reviewed_by=NULL,reviewed_at=NULL,updated_by=?,updated_at=?,seo_title=?,seo_description=?,cover_image=? WHERE id=?`)
      .bind(slug,title,excerpt,body,cleanText(d.category ?? item.category,80),auth.identity.email,now,cleanText(d.seo_title ?? item.seo_title,180)||null,cleanText(d.seo_description ?? item.seo_description,300)||null,cover||null,params.id).run();
    await audit(env.DB, auth.identity.email, "update", "article", params.id, { slug });
    return json({ ok: true, slug });
  } catch { return json({ error: "Slug déjà utilisé ou erreur d'enregistrement." }, 409); }
}
export async function onRequestDelete({ request, env, params }) {
  const auth = await requireCms(request, env, { doctorOnly: true }); if (auth.response) return auth.response;
  const item = await env.DB.prepare("SELECT id FROM cms_articles WHERE id=?").bind(params.id).first();
  if (!item) return json({ error: "Article introuvable." }, 404);
  await env.DB.prepare("DELETE FROM cms_articles WHERE id=?").bind(params.id).run();
  await audit(env.DB, auth.identity.email, "delete", "article", params.id);
  return json({ ok: true });
}
