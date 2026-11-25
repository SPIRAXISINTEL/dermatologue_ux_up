import { json, requireCms, audit } from "../../../../_lib/cms.js";
export async function onRequestPost({ request, env, params }) {
  const auth = await requireCms(request, env, { doctorOnly: true }); if (auth.response) return auth.response;
  const item = await env.DB.prepare("SELECT id,status,slug FROM cms_articles WHERE id=?").bind(params.id).first();
  if (!item) return json({ error: "Article introuvable." }, 404);
  if (item.status !== "in_review") return json({ error: "L'article doit être soumis à validation avant publication." }, 409);
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE cms_articles SET status='published',reviewed_by=?,reviewed_at=?,published_at=?,updated_by=?,updated_at=? WHERE id=?").bind(auth.identity.email,now,now,auth.identity.email,now,params.id).run();
  await audit(env.DB,auth.identity.email,"publish","article",params.id);
  return json({ ok:true,status:"published",url:`${env.SITE_URL || "https://dermatologue-tanger.com"}/articles/${item.slug}/` });
}
