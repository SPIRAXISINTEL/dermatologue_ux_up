(() => {
  const safe = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  const root = document.querySelector("[data-cms-list]");
  if (!root) return;

  const type = root.dataset.cmsList;
  const endpoint = type === "videos" ? "/api/public/videos" : "/api/public/articles";
  const videoPath = (item) => `/videos/${encodeURIComponent(String(item.slug))}/`;
  const thumbnailUrl = (item) => `https://i.ytimg.com/vi/${encodeURIComponent(String(item.youtube_id))}/hqdefault.jpg`;

  const renderEmpty = (message) => {
    root.innerHTML = `
      <div class="video-hub-empty" role="status">
        <span class="video-hub-empty-mark" aria-hidden="true">YC</span>
        <div>
          <p class="eyebrow">Vidéothèque</p>
          <h2>${safe(message || "Aucune vidéo publiée pour le moment")}</h2>
          <p>Les vidéos validées s’afficheront ici dès leur publication.</p>
          <a href="/conseils/">Lire les conseils dermatologiques →</a>
        </div>
      </div>`;
  };

  const renderVideoHub = (items) => {
    const videos = items.filter((item) => item && item.slug && item.title && item.youtube_id);
    if (!videos.length) {
      renderEmpty("Aucune vidéo publiée pour le moment");
      return;
    }

    const grouped = new Map();
    for (const video of videos) {
      const category = String(video.category || "Autres vidéos").trim() || "Autres vidéos";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(video);
    }
    const categories = [...grouped.entries()].map(([name, categoryVideos]) => ({ name, videos: categoryVideos }));
    const number = (index) => String(index + 1).padStart(2, "0");
    const countLabel = (count) => `${count} vidéo${count > 1 ? "s" : ""} publiée${count > 1 ? "s" : ""}`;
    const featureMarkup = (video, category) => `
      <a class="video-hub-feature" href="${videoPath(video)}" aria-label="Voir la vidéo : ${safe(video.title)}">
        <img class="video-hub-feature-image" src="${thumbnailUrl(video)}" alt="" width="640" height="480" fetchpriority="high">
        <span class="video-hub-tags"><span class="video-hub-tag">${safe(category)}</span><span class="video-hub-tag">Vidéo publiée</span></span>
        <span class="video-hub-bottom">
          <span class="video-hub-mark" aria-hidden="true">YC</span>
          <span class="video-hub-feature-title">${safe(video.title)}<small>Dr Yassir Chaibi · Dermatologue à Tanger</small></span>
          <span class="video-hub-play" aria-hidden="true"></span>
        </span>
      </a>`;
    const cardsMarkup = (categoryVideos) => categoryVideos.slice(0, 6).map((video) => `
      <a class="video-hub-card" href="${videoPath(video)}" aria-label="Voir la vidéo : ${safe(video.title)}">
        <span class="video-hub-thumbnail"><img src="${thumbnailUrl(video)}" alt="" width="480" height="360" loading="lazy"></span>
        <span class="video-hub-card-body">
          <span class="video-hub-card-category">${safe(video.category || "Dermatologie")}</span>
          <strong class="video-hub-card-title">${safe(video.title)}</strong>
          ${video.description ? `<span class="video-hub-card-description">${safe(video.description)}</span>` : ""}
          <span class="video-hub-card-link">Regarder la vidéo →</span>
        </span>
      </a>`).join("");

    root.innerHTML = `
      <div class="video-hub-layout">
        <div class="video-hub-feature-slot"></div>
        <div class="video-hub-categories" role="group" aria-label="Choisir un thème vidéo">
          ${categories.map((category, index) => `
            <button class="video-hub-category${index === 0 ? " active" : ""}" type="button" data-category-index="${index}" aria-expanded="${index === 0 ? "true" : "false"}" aria-label="${safe(category.name)} : ${countLabel(category.videos.length)}">
              <span class="video-hub-category-vertical" aria-hidden="true">${safe(category.name)}</span>
              <span class="video-hub-number" aria-hidden="true">${number(index)}</span>
              <span class="video-hub-category-content">
                <span class="video-hub-number" aria-hidden="true">${number(index)}</span>
                <span class="video-hub-category-copy">
                  <strong>${safe(category.name)}</strong>
                  <small>${countLabel(category.videos.length)}</small>
                  <span class="video-hub-category-cta">Afficher les vidéos <span aria-hidden="true">↘</span></span>
                </span>
              </span>
            </button>`).join("")}
        </div>
      </div>
      <section class="video-hub-latest" aria-labelledby="video-hub-latest-title">
        <header class="video-hub-latest-header"><h2 id="video-hub-latest-title">Dernières vidéos</h2></header>
        <div class="video-hub-cards" aria-live="polite"></div>
      </section>`;

    const featureSlot = root.querySelector(".video-hub-feature-slot");
    const cardsSlot = root.querySelector(".video-hub-cards");
    const buttons = [...root.querySelectorAll("[data-category-index]")];
    const selectCategory = (index) => {
      const category = categories[index];
      if (!category) return;
      buttons.forEach((button, buttonIndex) => {
        const active = buttonIndex === index;
        button.classList.toggle("active", active);
        button.setAttribute("aria-expanded", String(active));
      });
      featureSlot.innerHTML = featureMarkup(category.videos[0], category.name);
      cardsSlot.innerHTML = cardsMarkup(category.videos);
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => selectCategory(Number(button.dataset.categoryIndex)));
    });
    selectCategory(0);
  };

  fetch(endpoint)
    .then((response) => {
      if (!response.ok) throw new Error("Unavailable");
      return response.json();
    })
    .then(({ items = [] } = {}) => {
      if (type === "videos") {
        renderVideoHub(items);
        return;
      }
      if (!items.length) {
        root.innerHTML = '<p class="muted">Les nouveaux articles validés seront publiés ici.</p>';
        return;
      }
      root.innerHTML = items.map((item) =>
        `<a class="post" href="/articles/${encodeURIComponent(item.slug)}/"><div class="thumb">${safe(item.category)}</div><div class="body"><span class="cat">${safe(item.category)}</span><h3>${safe(item.title)}</h3><p>${safe(item.excerpt)}</p><span class="read">Lire l’article →</span></div></a>`
      ).join("");
    })
    .catch(() => {
      if (type === "videos") {
        renderEmpty("La vidéothèque est momentanément indisponible");
      } else {
        root.innerHTML = '<p class="muted">Ce contenu sera bientôt disponible.</p>';
      }
    });
})();
