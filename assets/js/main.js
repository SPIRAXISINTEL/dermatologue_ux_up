/* Dr Yassir Chaibi — interactions : menu mobile, statut d'ouverture,
   formulaire de demande de rendez-vous. Aucun suivi, aucun cookie. */
(function () {
  "use strict";

  /* ---------- Menu mobile ---------- */
  var btn = document.getElementById("menu-btn");
  var nav = document.getElementById("nav-main");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Statut Ouvert / Fermé (horaires publiés) ----------
     Lun–Ven 9h–12h et 13h–17h · Sam 10h–13h30 · Dim fermé.
     Fuseau Africa/Casablanca. */
  var badge = document.getElementById("open-badge");
  if (badge) {
    try {
      var now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
      var day = now.getDay(); // 0 = dimanche
      var mins = now.getHours() * 60 + now.getMinutes();
      var open = false, label = "";
      var slots = {
        1: [[540, 720], [780, 1020]], 2: [[540, 720], [780, 1020]],
        3: [[540, 720], [780, 1020]], 4: [[540, 720], [780, 1020]],
        5: [[540, 720], [780, 1020]], 6: [[600, 810]]
      }[day] || [];
      for (var i = 0; i < slots.length; i++) {
        if (mins >= slots[i][0] && mins < slots[i][1]) { open = true; break; }
      }
      if (open) {
        label = "Ouvert actuellement";
      } else {
        badge.classList.add("closed");
        label = day === 0 ? "Fermé aujourd'hui (dimanche)"
          : (mins < 540 ? "Ouvre aujourd'hui à 9h00" : "Fermé — réouverture demain à 9h00");
        if (day === 6 && mins >= 810) label = "Fermé — réouverture lundi à 9h00";
      }
      badge.querySelector(".open-label").textContent = label;
    } catch (e) { badge.style.display = "none"; }
  }

  /* ---------- Année du pied de page ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Barre d'action fixe mobile : appel, WhatsApp, itinéraire ---------- */
  if (!document.querySelector(".mobile-action-bar")) {
    var isArabic = document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith("ar");
    var bar = document.createElement("nav");
    bar.className = "mobile-action-bar";
    bar.setAttribute("aria-label", isArabic ? "إجراءات التواصل مع العيادة" : "Actions rapides du cabinet");
    bar.innerHTML = isArabic
      ? '<a href="tel:+212539320407"><span aria-hidden="true">☎</span><span>اتصال</span></a><a href="https://api.whatsapp.com/send?phone=212639320407&text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.%0A%D8%A7%D9%84%D8%A7%D8%B3%D9%85%20%D8%A7%D9%84%D9%83%D8%A7%D9%85%D9%84%3A%0A%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A3%D9%88%D9%84%D9%89%20%D8%A3%D9%85%20%D9%85%D8%AA%D8%A7%D8%A8%D8%B9%D8%A9%3A%0A%D8%B3%D8%A8%D8%A8%20%D8%A7%D9%84%D9%85%D9%88%D8%B9%D8%AF%20%D8%A8%D8%B4%D9%83%D9%84%20%D8%B9%D8%A7%D9%85%3A%0A%D8%A7%D9%84%D8%A3%D9%88%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A9%3A"><span aria-hidden="true">✉</span><span>واتساب</span></a><a href="https://maps.app.goo.gl/NuFWofurxiVVA5K78" target="_blank" rel="noopener"><span aria-hidden="true">⌖</span><span>الاتجاهات</span></a>'
      : '<a href="tel:+212539320407"><span aria-hidden="true">☎</span><span>Appeler</span></a><a href="https://api.whatsapp.com/send?phone=212639320407&text=Bonjour%2C%20je%20souhaite%20un%20rendez-vous.%0ANom%20et%20pr%C3%A9nom%20%3A%0APremi%C3%A8re%20consultation%20ou%20suivi%20%3A%0AMotif%20g%C3%A9n%C3%A9ral%20%28peau%2C%20enfant%2C%20grain%20de%20beaut%C3%A9%2C%20chirurgie%2C%20laser%2C%20esth%C3%A9tique%29%20%3A%0ADisponibilit%C3%A9s%20%3A"><span aria-hidden="true">✉</span><span>WhatsApp</span></a><a href="https://maps.app.goo.gl/NuFWofurxiVVA5K78" target="_blank" rel="noopener"><span aria-hidden="true">⌖</span><span>Itinéraire</span></a>';
    document.body.appendChild(bar);
  }

  /* ---------- Formulaire de demande de rendez-vous ---------- */
  var form = document.getElementById("rdv-form");
  if (!form) return;
  var ok = document.getElementById("form-ok");
  var err = document.getElementById("form-err");
  var submit = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    ok.classList.remove("show"); err.classList.remove("show");
    // Honeypot anti-spam : champ invisible, doit rester vide.
    if (form.querySelector('[name="website"]').value) return;
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (el) {
      var field = el.closest(".field");
      var bad = !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value));
      if (el.name === "tel") bad = !/^[+0-9][0-9 .\-()]{7,}$/.test(el.value.trim());
      field.classList.toggle("invalid", bad);
      if (bad) valid = false;
    });
    if (!valid) { err.textContent = "Merci de vérifier les champs indiqués en rouge."; err.classList.add("show"); return; }
    submit.disabled = true;
    var original = submit.textContent;
    submit.textContent = "Envoi en cours…";
    try {
      var r = await fetch(form.action, { method: "POST", body: new FormData(form) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      form.reset();
      ok.classList.add("show");
      ok.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (ex) {
      err.textContent = "L’envoi a échoué. Merci de réessayer, ou d’appeler le cabinet au 05 39 32 04 07.";
      err.classList.add("show");
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
  // Efface l'erreur d'un champ dès qu'il est corrigé.
  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      var field = el.closest(".field");
      if (field) field.classList.remove("invalid");
    });
  });
})();
