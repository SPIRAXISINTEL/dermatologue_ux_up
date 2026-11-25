// Cloudflare Pages Function — demande de rendez-vous.
// POST /api/rdv  (formulaire du site, application/x-www-form-urlencoded)
// Variables à définir dans Pages > Settings > Variables :
//   RESEND_API_KEY, RDV_TO (e-mail du cabinet), RDV_FROM (expéditeur vérifié chez Resend).
// Aucune donnée n'est stockée : la demande est transmise par e-mail uniquement.

const MAX = { nom: 120, tel: 30, email: 120, motif: 40, date: 10, creneau: 20, message: 2000 };

function esc(s) {
  return String(s || "").replace(/[<>&"']/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export async function onRequestPost({ request, env }) {
  const json = (status, body) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  let d;
  try {
    const fd = await request.formData();
    d = Object.fromEntries(fd.entries());
  } catch {
    return json(400, { ok: false, error: "Formulaire illisible." });
  }

  // Honeypot anti-spam : le champ invisible "website" doit rester vide.
  if (d.website) return json(200, { ok: true }); // faux succès, le spam est ignoré

  // Validation + limites de longueur.
  for (const [k, v] of Object.entries(d)) {
    if (typeof v === "string" && v.length > (MAX[k] || 500)) {
      return json(400, { ok: false, error: `Le champ ${k} est trop long.` });
    }
  }
  if (!d.nom || !d.tel || !d.email || !d.motif) {
    return json(400, { ok: false, error: "Nom, téléphone, e-mail et motif sont obligatoires." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) {
    return json(400, { ok: false, error: "Adresse e-mail invalide." });
  }
  if (!/^[+0-9][0-9 .\-()]{7,}$/.test(d.tel.trim())) {
    return json(400, { ok: false, error: "Numéro de téléphone invalide." });
  }
  if (!["Dermatologie", "Acné", "Pigmentation", "Cheveux", "Médecine esthétique", "Autre"].includes(d.motif)) {
    return json(400, { ok: false, error: "Motif invalide." });
  }
  if (d.date && !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
    return json(400, { ok: false, error: "Date invalide." });
  }
  if (!env.RESEND_API_KEY || !env.RDV_TO || !env.RDV_FROM) {
    return json(502, { ok: false, error: "Messagerie non configurée." });
  }

  const rows = ["nom", "tel", "email", "motif", "date", "creneau", "message"]
    .filter((k) => d[k])
    .map((k) => `<p><b>${esc(k)}</b> : ${esc(d[k])}</p>`)
    .join("");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.RDV_FROM,
      to: env.RDV_TO,
      reply_to: d.email,
      subject: `Demande de rendez-vous — ${d.nom} (${d.motif})`,
      html: `<h2>Nouvelle demande de rendez-vous — dermatologue-tanger.com</h2>${rows}<p><i>Cette demande ne vaut pas confirmation. Le cabinet doit recontacter le patient.</i></p>`,
    }),
  });
  if (!r.ok) return json(502, { ok: false, error: "L'envoi de l'e-mail a échoué." });
  return json(200, { ok: true });
}
