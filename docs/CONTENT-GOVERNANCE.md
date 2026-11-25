# Gouvernance éditoriale médicale

## Rôles
- `doctor` : identité dont l'e-mail correspond exactement à `DOCTOR_EMAIL`. Peut consulter, créer, soumettre, publier et supprimer les contenus. La publication n'est possible qu'après le statut `in_review`.
- `editor` : identité listée dans `CMS_EDITOR_EMAILS`. Peut créer, modifier les brouillons et soumettre à validation. Ne peut ni publier ni supprimer.

## Cycle de vie
- `draft` : visible uniquement dans l'administration.
- `in_review` : soumis au médecin, toujours invisible au public.
- `published` : visible dans les pages publiques et les sitemaps.
- `archived` : réservé à l'évolution de gouvernance ; non exposé publiquement.

## Checklist clinique avant publication
1. Le texte est exact, équilibré, compréhensible et adapté au public visé.
2. Les indications, contre-indications, risques et limites sont présentés lorsque pertinents.
3. Les traitements sont décrits sans garantie de résultat ni conseil individuel non contextualisé.
4. Les sources médicales fiables sont indiquées dans le contenu lorsque cela apporte une valeur au lecteur.
5. Les photos, vidéos et cas cliniques disposent des autorisations nécessaires et ne révèlent aucune donnée patient.
6. Le contenu précise qu'il ne remplace pas une consultation médicale.
7. Le titre, le résumé, le slug, le maillage interne et les métadonnées sont cohérents avec le contenu réel.

## Bonnes pratiques SEO
- Une intention de recherche principale par page ; éviter les pages quasi-duplicatives créées uniquement pour répéter « dermatologue Tanger ».
- Ajouter un lien de rendez-vous contextualisé, sans pression ni promesse.
- Préférer des réponses précises, originales, médicalement revues et utiles.
- Mettre à jour les dates uniquement lors d'une vraie révision éditoriale.
- Les vidéos doivent avoir un titre descriptif, une description, un résumé substantiel en français et une miniature pertinente.


## Règles V4.1 de langue et d’approbation

- Tous les contenus du site et tous les articles sont en français.
- La darija marocaine est réservée exclusivement à la parole des vidéos.
- Les titres, résumés, descriptions, slugs et champs SEO des vidéos sont rédigés en français.
- L’éditeur prépare et soumet ; seul le médecin valide et publie.
- Toute modification après publication repasse par le workflow de validation.

- Le formulaire vidéo fixe la langue parlée à `ar-MA`; l’éditeur saisit le titre, la description et les métadonnées SEO en français.


## Multilingual publishing

The clinic pages are available in French and Arabic. Arabic service pages must be reviewed by the doctor before production indexing. The current CMS article workflow is French-language; do not label CMS articles as Arabic until a translated editorial workflow and review process exist. Darija videos require the same medical review before publication.
