# V4 — checklist de mise en production

## Avant le déploiement
- [ ] Confirmer le domaine et le projet Cloudflare Pages propriétaire.
- [ ] Remplacer `REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID` dans `wrangler.toml`.
- [ ] Créer D1 et appliquer `migrations/0001_cms.sql`.
- [ ] Configurer le binding Pages `DB`.
- [ ] Créer les applications Cloudflare Access pour `/admin*` et `/api/cms/*`.
- [ ] Renseigner `CF_ACCESS_ISSUER`, `CF_ACCESS_AUD`, `DOCTOR_EMAIL`, `CMS_EDITOR_EMAILS`.
- [ ] Vérifier l'adresse e-mail médecin avec un test d'accès.
- [ ] Configurer les secrets Resend existants pour le formulaire RDV.
- [ ] Vérifier les informations professionnelles, coordonnées, horaires et diplômes avec le cabinet.

## Après déploiement Preview
- [ ] Tester toutes les pages vitrine et les liens de navigation.
- [ ] Tester accès administrateur / éditeur / utilisateur non autorisé.
- [ ] Créer un article de test, le soumettre, le publier comme médecin puis le retirer après test selon la procédure décidée.
- [ ] Tester une vidéo YouTube non répertoriée ou publique autorisée.
- [ ] Vérifier le rendu HTML serveur, le canonical et les données structurées.
- [ ] Vérifier que les brouillons sont absents des APIs publiques et du sitemap.
- [ ] Tester le formulaire RDV sans envoyer de données de santé réelles.
- [ ] Supprimer ou archiver les contenus de test avant Production.

## Après mise en production
- [ ] Vérifier `https://dermatologue-tanger.com/sitemap.xml`.
- [ ] Vérifier `https://dermatologue-tanger.com/sitemap-cms.xml`.
- [ ] Soumettre les deux sitemaps dans Google Search Console.
- [ ] Inspecter les pages publiées dans Google Search Console.
- [ ] Contrôler Core Web Vitals et les erreurs Pages Functions / D1.
- [ ] Sauvegarder la base D1 selon la politique du cabinet.
