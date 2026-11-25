import { json, requireCms, cleanText, slugify, validSlug, audit } from "../../_lib/cms.js";
function youtubeId(value) {
  try { const u = new URL(value); if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0]; if (["youtube.com","www.youtube.com","m.youtube.com"].includes(u.hostname)) { if (u.pathname === "/watch") return u.searchParams.get("v") || ""; const m = u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/); return m?.[1] || ""; } } catch {} return "";
}
export async function onRequestGet({ request, env }) {
  const auth = await requireCms(request, env); if (auth.response) return auth.response;
  const { results = [] } = await env.DB.prepare("SELECT * FROM cms_videos ORDER BY updated_at DESC LIMIT 250").all();
  return json({ items: results, actor: auth.identity });
}
export async function onRequestPost({ request, env }) {
  const auth = await requireCms(request, env); if (auth.response) return auth.response;
  let d; try { d = await request.json(); } catch { return json({ error: "JSON invalide." }, 400); }
  const title = cleanText(d.title,180), description = cleanText(d.description,1000), youtubeUrl = cleanText(d.youtube_url,500), youtube = youtubeId(youtubeUrl), slug = slugify(d.slug || title);
  if (!title || description.length < 30 || !youtube || !/^[A-Za-z0-9_-]{11}$/.test(youtube) || !validSlug(slug)) return json({ error: "Titre, description française (30 caractères minimum), URL YouTube valide et slug requis." },400);
  const id=crypto.randomUUID(), now=new Date().toISOString();
  try {
    await env.DB.prepare(`INSERT INTO cms_videos(id,slug,title,description,youtube_url,youtube_id,category,author_name,status,created_by,updated_by,created_at,updated_at,seo_title,seo_description,spoken_language) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id,slug,title,description,youtubeUrl,youtube,cleanText(d.category||"Dermatologie",80),"Dr Yassir Chaibi","draft",auth.identity.email,auth.identity.email,now,now,cleanText(d.seo_title,180)||null,cleanText(d.seo_description,300)||null,"ar-MA").run();
    await audit(env.DB,auth.identity.email,"create","video",id,{slug});
    return json({id,slug,status:"draft"},201);
  } catch { return json({error:"Slug déjà utilisé ou erreur d'enregistrement."},409); }
}
