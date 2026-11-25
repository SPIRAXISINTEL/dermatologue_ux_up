# Interface — version 4.6.3

La vidéothèque reprend maintenant la maquette fournie : une vidéo à la une, des rubriques accordéon et les vidéos récentes. Son contenu vient des vidéos réellement publiées dans le CMS; les médias de démonstration de la maquette ne sont pas utilisés. Le nouveau thème est partagé par l’accueil et les pages publiques internes : services, conseils, vidéos, contact/rendez-vous, pages arabes, ainsi que les détails d’articles et de vidéos générés par le CMS. Les URL, le contenu, les métadonnées SEO et le balisage structuré existants sont conservés.

La refonte reste en HTML/CSS statiques, sans migration React. Les cartes dirigent vers les pages et articles existants, l’espace vidéo garde ses contenus CMS, et la page Contact contient maintenant le même formulaire réel que l’accueil, relié à `/api/rdv`. Aucun faux créneau ou lecteur vidéo de démonstration n’est publié.

## Déploiement

Cette archive n’a pas été publiée sur GitHub ou Cloudflare. Déployer via le dépôt Git connecté au projet Cloudflare Pages afin que les Pages Functions soient incluses; un simple upload statique ne suffit pas. Avant la mise en production, vérifier dans Cloudflare les variables de l’API de rendez-vous, l’accès CMS et le binding D1.
