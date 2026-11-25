import { json, requireCms, audit } from "../../../../_lib/cms.js";
export async function onRequestPost({ request, env, params }) {
  const auth = await requireCms(request, env, { doctorOnly: true }); if (auth.response) return auth.response;
  const item = await env.DB.prepare("SELECT id,status FROM cms_articles WHERE id=?").bind(params.id).first();
  if (!item) return json({ error: "Article introuvable." }, 404);
  if (item.status !== "published") return json({ error: "Seul un contenu publié peut être retiré." }, 409);
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE cms_articles SET status='draft',published_at=NULL,reviewed_by=NULL,reviewed_at=NULL,updated_by=?,updated_at=? WHERE id=?").bind(auth.identity.email,now,params.id).run();
  await audit(env.DB,auth.identity.email,"unpublish_for_revision","article",params.id);
  return json({ ok:true,status:"draft" });
}
