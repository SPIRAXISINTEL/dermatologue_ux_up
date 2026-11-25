# Plan SEO local — Dr Yassir Chaibi, dermatologue à Tanger

## Changements intégrés au site
- Titres SEO et méta-descriptions distincts sur les pages publiques principales en français et en arabe.
- H1 de l’accueil, de la dermatologie et de la médecine esthétique orientés vers l’intention locale, sans répétition artificielle.
- Métadonnées Open Graph/Twitter harmonisées avec les titres et descriptions de chaque page.
- Préchargement de l’image WebP principale de l’accueil pour aider le Largest Contentful Paint.
- Données structurées `Service` sur les pages Dermatologie et Médecine esthétique, reliées à l’entité `Physician` de l’accueil.
- Entité `WebSite` ajoutée à l’accueil.
- Sitemap XML bilingue mis à jour le 14 novembre 2026, avec les routes canoniques du cahier.

## Actions indispensables hors code
1. **Google Business Profile** : revendiquer/valider la fiche officielle du cabinet. Utiliser le nom réel affiché sur la signalétique, la catégorie principale la plus précise disponible (« Dermatologue »), l’adresse exacte, le téléphone local, les horaires réels, le site web canonique et le lien de rendez-vous. Ne pas créer de fiche doublon.
2. **NAP cohérent** : conserver exactement le même nom, adresse et téléphone sur le site, Google Business Profile et les annuaires médicaux légitimes. Corriger les anciennes adresses/numéros plutôt que multiplier les variantes.
3. **Google Search Console** : ajouter `https://dermatologue-tanger.com/` comme propriété Domaine (DNS) et soumettre `https://dermatologue-tanger.com/sitemap.xml`. Inspecter l’accueil et les pages principales après mise en production.
4. **Bing Webmaster Tools** : ajouter le domaine et importer le sitemap.
5. **Avis patients** : demander des avis authentiques, sans contrepartie, sans filtrage des avis négatifs et sans publier de données médicales. Répondre sans confirmer qu’une personne est patient.
6. **Photos** : ajouter régulièrement des photos réelles du cabinet et de sa signalétique à la fiche Google Business Profile. Obtenir les consentements nécessaires pour toute personne identifiable.
7. **Contenu** : publier uniquement des articles relus et validés par le médecin. Ajouter un nom d’auteur médical réel, une date de révision et des sources cliniques fiables. Ne pas inventer diplômes, titres, traitements disponibles ou résultats.
8. **Mesure** : suivre les clics organiques, impressions, requêtes locales, appels et demandes de rendez-vous. Ajouter des événements analytics avec consentement approprié et sans transmettre de données de santé.

## Priorités éditoriales recommandées
- Page dédiée « Acné à Tanger » uniquement si elle apporte une information clinique distincte et validée.
- Page dédiée « Chute de cheveux à Tanger » avec diagnostic différentiel expliqué sans auto-diagnostic.
- Page dédiée « Dépistage des grains de beauté / dermoscopie à Tanger ».
- Page dédiée « Eczéma et psoriasis à Tanger ».
- Chaque page doit répondre à une intention précise, contenir des informations utiles originales, indiquer quand consulter et proposer un accès clair au cabinet. Éviter les pages quasi-identiques créées uniquement pour des variantes de mots-clés ou des quartiers.

## Vérifications avant publication
- Confirmer que le domaine pointe vers le déploiement Cloudflare Pages attendu et que HTTPS fonctionne.
- Confirmer l’exactitude du nom professionnel, des horaires, des coordonnées GPS, des langues, des diplômes et des actes réellement proposés.
- Tester les données structurées dans le Rich Results Test et Schema Markup Validator.
- Tester les pages avec PageSpeed Insights mobile et vérifier Core Web Vitals sur données réelles après collecte.
- Vérifier l’indexation et les éventuelles pages exclues dans Search Console.

## Important
Le SEO ne garantit ni une position précise ni un délai de classement. Les résultats dépendent aussi de la concurrence locale, de la fiche établissement, des avis authentiques, de la qualité éditoriale, de la notoriété et de l’expérience réelle du site. Les balises `meta keywords` ne sont volontairement pas ajoutées : Google ne les utilise pas pour le classement.
