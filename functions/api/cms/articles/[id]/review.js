import { json, requireCms, audit } from "../../../../_lib/cms.js";
export async function onRequestPost({ request, env, params }) {
  const auth = await requireCms(request, env); if (auth.response) return auth.response;
  const item = await env.DB.prepare("SELECT id,status FROM cms_articles WHERE id=?").bind(params.id).first();
  if (!item) return json({ error: "Article introuvable." }, 404);
  if (!["draft","in_review"].includes(item.status)) return json({ error: "Statut incompatible." }, 409);
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE cms_articles SET status='in_review',updated_by=?,updated_at=? WHERE id=?").bind(auth.identity.email,now,params.id).run();
  await audit(env.DB,auth.identity.email,"submit_for_review","article",params.id);
  return json({ ok:true,status:"in_review" });
}
