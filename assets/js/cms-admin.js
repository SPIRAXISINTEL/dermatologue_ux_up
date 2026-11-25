(() => {
  const $ = (s) => document.querySelector(s);
  const notice = (message, type = "") => { const el=$("#notice"); el.textContent=message; el.className=`notice ${type}`; };
  const api = async (url, options={}) => {
    const r = await fetch(url, { ...options, headers: { "content-type": "application/json", ...(options.headers || {}) }, credentials: "same-origin", cache: "no-store" });
    const data = await r.json().catch(() => ({ error: `Réponse serveur invalide (${r.status}). Vérifiez que les Pages Functions sont déployées.` }));
    if (!r.ok) throw new Error(data.error || `Erreur HTTP ${r.status} sur ${url}`);
    if (!data || typeof data !== "object") throw new Error(`Réponse API inattendue sur ${url}.`);
    return data;
  };
  const slugify = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  let actor=null, articles=[], videos=[], editingArticleId=null, editingVideoId=null;
  document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel").forEach(x=>x.classList.toggle("hidden",x.id!==b.dataset.tab));}));
  $("#a-title").addEventListener("input",e=>{if(!$("#a-slug").dataset.edited)$("#a-slug").value=slugify(e.target.value);});
  $("#v-title").addEventListener("input",e=>{if(!$("#v-slug").dataset.edited)$("#v-slug").value=slugify(e.target.value);});
  ["#a-slug","#v-slug"].forEach(s=>$(s).addEventListener("input",e=>e.target.dataset.edited="1"));
  const formData=(form)=>Object.fromEntries(new FormData(form).entries());
  $("#article-form").addEventListener("submit",async e=>{e.preventDefault();try{const d=formData(e.currentTarget);const r=editingArticleId?await api(`/api/cms/articles/${editingArticleId}`,{method:"PATCH",body:JSON.stringify(d)}):await api("/api/cms/articles",{method:"POST",body:JSON.stringify(d)});e.currentTarget.reset();$("#a-slug").dataset.edited="";editingArticleId=null;notice(`Brouillon enregistré ou mis à jour. Identifiant : ${r.id||"article"}.`,"success");await load();}catch(err){notice(err.message,"error");}});
  $("#video-form").addEventListener("submit",async e=>{e.preventDefault();try{const d=formData(e.currentTarget);const r=editingVideoId?await api(`/api/cms/videos/${editingVideoId}`,{method:"PATCH",body:JSON.stringify(d)}):await api("/api/cms/videos",{method:"POST",body:JSON.stringify(d)});e.currentTarget.reset();$("#v-slug").dataset.edited="";editingVideoId=null;notice(`Vidéo enregistrée ou mise à jour. Identifiant : ${r.id||"vidéo"}.`,"success");await load();}catch(err){notice(err.message,"error");}});
  $("#article-preview").onclick=()=>{const box=$("#article-preview-box");box.classList.toggle("hidden");box.textContent=`${$("#a-title").value}\n\n${$("#a-excerpt").value}\n\n${$("#a-body").value}`;};$("#article-reset").onclick=()=>{$("#article-form").reset();$("#a-slug").dataset.edited="";editingArticleId=null;$("#article-form").querySelector("button[type=submit]").textContent="Enregistrer le brouillon";};$("#video-reset").onclick=()=>{$("#video-form").reset();$("#v-slug").dataset.edited="";editingVideoId=null;$("#video-form").querySelector("button[type=submit]").textContent="Enregistrer la vidéo";};$("#refresh").onclick=load;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const row=(item,type)=>{const published=item.status==="published";const canPublish=actor?.role==="doctor"&&item.status==="in_review";const canSubmit=["draft","in_review"].includes(item.status);const url=type==="article"?`/articles/${item.slug}/`:`/videos/${item.slug}/`;return `<div class="list-item"><div><strong>${esc(item.title)}</strong><p>${esc(item.slug)} · ${esc(item.updated_at?.slice(0,10)||"")}</p><span class="status ${esc(item.status)}">${esc(item.status)}</span>${published?`<p><a href="${url}" target="_blank" rel="noopener">Voir la publication ↗</a></p>`:""}</div><div class="actions">${["draft","in_review"].includes(item.status)?`<button class="btn btn-secondary" data-action="edit" data-type="${type}" data-id="${item.id}">Modifier</button>`:""}${canSubmit?`<button class="btn btn-secondary" data-action="review" data-type="${type}" data-id="${item.id}">Soumettre</button>`:""}${canPublish?`<button class="btn btn-dark" data-action="publish" data-type="${type}" data-id="${item.id}">Valider & publier</button>`:""}${published&&actor?.role==="doctor"?`<button class="btn btn-secondary" data-action="unpublish" data-type="${type}" data-id="${item.id}">Retirer pour modification</button>`:""}</div></div>`;};
  async function load(){
    try {
      const [a, v] = await Promise.all([api("/api/cms/articles"), api("/api/cms/videos")]);
      actor = a.actor || v.actor || null;
      if (!actor || !actor.email || !actor.role) {
        throw new Error("La session Cloudflare Access est détectée, mais l'API CMS ne renvoie pas l'identité (actor.email/role). Vérifiez le déploiement des Pages Functions, les routes /api/cms/* et les variables CF_ACCESS_ISSUER / CF_ACCESS_AUD, puis redéployez.");
      }
      articles = Array.isArray(a.items) ? a.items : [];
      videos = Array.isArray(v.items) ? v.items : [];
      $("#identity").textContent = `Connecté : ${actor.email} · rôle ${actor.role}`;
      $("#articles-list").innerHTML = articles.length ? articles.map(x => row(x,"article")).join("") : '<p class="muted">Aucun article pour le moment.</p>';
      $("#videos-list").innerHTML = videos.length ? videos.map(x => row(x,"video")).join("") : '<p class="muted">Aucune vidéo pour le moment.</p>';
      document.querySelectorAll("[data-action]").forEach(b => b.addEventListener("click", action));
    } catch (err) {
      notice(err.message || "Impossible de charger le CMS.", "error");
      $("#identity").textContent = "Accès non vérifié";
    }
  }
  async function action(e){const b=e.currentTarget;const {action,type,id}=b.dataset;try{if(action==="edit"){const item=await api(`/api/cms/${type}s/${id}`);if(type==="article"){editingArticleId=id;$("#a-title").value=item.title;$("#a-slug").value=item.slug;$("#a-slug").dataset.edited="1";$("#a-excerpt").value=item.excerpt;$("#a-category").value=item.category;$("#a-body").value=item.body_markdown;$("#a-seo-title").value=item.seo_title||"";$("#a-seo-desc").value=item.seo_description||"";$("#a-cover").value=item.cover_image||"";$("#article-form").querySelector("button[type=submit]").textContent="Mettre à jour le brouillon";document.querySelector("[data-tab=article]").click();}else{editingVideoId=id;$("#v-title").value=item.title;$("#v-slug").value=item.slug;$("#v-slug").dataset.edited="1";$("#v-desc").value=item.description;$("#v-url").value=item.youtube_url;$("#v-category").value=item.category;$("#v-seo-title").value=item.seo_title||"";$("#v-seo-desc").value=item.seo_description||"";$("#video-form").querySelector("button[type=submit]").textContent="Mettre à jour la vidéo";document.querySelector("[data-tab=video]").click();}notice("Contenu chargé dans le formulaire. Toute modification repasse en brouillon et doit être soumise à nouveau.","success");return;}if(action==="review"){await api(`/api/cms/${type}s/${id}/review`,{method:"POST",body:"{}"});notice("Contenu soumis à validation médicale.","success");}else if(action==="unpublish"){await api(`/api/cms/${type}s/${id}/unpublish`,{method:"POST",body:"{}"});notice("Contenu retiré du public et remis en brouillon. Il peut maintenant être modifié puis soumis à nouveau.","success");}else{const r=await api(`/api/cms/${type}s/${id}/publish`,{method:"POST",body:"{}"});notice(`Publication validée : ${r.url}`,"success");}await load();}catch(err){notice(err.message,"error");}}
  load();
})();
