# Dr Yassir Chaibi — Dermatologue à Tanger

Site vitrine et plateforme éditoriale personnalisée (CMS propriétaire) — version 4.6.3 pour **https://dermatologue-tanger.com/**. Le projet conserve le site statique SEO existant et ajoute une administration dédiée pour les articles médicaux et les vidéos YouTube.

## Architecture V4.1

```text
/
├── index.html, docteur/, dermatologie/, medecine-esthetique/  # Site vitrine existant
├── conseils/                                                  # Hub et 5 articles existants
├── articles/                                                   # Hub + pages SEO rendues côté serveur depuis D1
├── videos/                                                     # Hub + pages vidéo rendues côté serveur depuis D1
├── admin/index.html                                            # CMS privé, protégé par Cloudflare Access
├── assets/css/main.css                                         # Design system conservé + styles CMS
├── assets/js/                                                  # JS vitrine, CMS admin et listes publiques
├── functions/
│   ├── _lib/cms.js                                             # Auth Access JWT, validation, rendu HTML/Markdown
│   ├── api/rdv.js                                              # Formulaire rendez-vous existant (Resend)
│   ├── api/cms/                                                # CRUD privé, workflow de validation/publishing
│   ├── api/public/                                             # API lecture seule des contenus publiés
│   ├── articles/[slug].js                                      # SSR SEO des articles publiés
│   ├── videos/[slug].js                                        # SSR SEO des vidéos publiées
│   └── sitemap-cms.xml.js                                      # Sitemap dynamique des contenus publiés
├── migrations/0001_cms.sql                                     # Schéma D1 et journal d'audit
├── _routes.json                                                # Routage Cloudflare Pages Functions
├── wrangler.toml                                                # Binding D1 (ID à renseigner)
├── _headers, _redirects, robots.txt, sitemap.xml
└── docs/                                                        # Installation, workflow et checklist
```

### Stack

- Cloudflare Pages + Pages Functions (runtime Workers).
- Cloudflare D1 (SQLite managé) pour articles, vidéos, statuts et journal d'audit.
- Cloudflare Access + validation cryptographique RS256 du JWT Access pour protéger l'administration et l'API privée.
- YouTube en hébergement vidéo, intégré via `youtube-nocookie.com`.
- HTML/CSS/JavaScript natifs, aucun framework ni dépendance de build.

### Workflow de validation médicale

`draft` → `in_review` → `published`.

- **Éditeur autorisé** : crée un article ou une vidéo, modifie le brouillon et soumet à validation.
- **Dr Chaibi (compte médecin)** : seul rôle autorisé à publier ou supprimer.
- Le contenu en brouillon ou en attente n'est jamais exposé aux API publiques, pages publiques ou sitemap.
- Les publications sont horodatées et les actions principales sont inscrites dans `cms_audit_log`.
- Les modifications de contenus publiés sont bloquées dans cette première version afin d'éviter qu'une mise à jour non validée remplace le contenu public. Pour une correction, créer une nouvelle version/draft et planifier le remplacement avec le médecin.

### Politique linguistique V4.1

- Tout le site public, toutes les pages de services, tous les articles, les titres SEO, descriptions et interfaces CMS sont en français.
- Seules les vidéos sont parlées en darija marocaine. Les titres/descriptions éditoriaux des pages vidéo restent en français pour le référencement du site.
- Aucun article, route de navigation ou version alternative du site en darija n’est créé.
- Rédaction : un éditeur autorisé peut préparer les articles et vidéos ; seul le Dr Chaibi peut publier après revue.

### SEO éditorial

- Pages CMS publiées rendues côté serveur : HTML lisible par les moteurs, title, description, canonical, Open Graph et JSON-LD `MedicalWebPage` / `Article` ou `VideoObject`.
- `/articles/` et `/videos/` sont des hubs de découverte.
- `/api/public/articles` et `/api/public/videos` ne retournent que les contenus publiés.
- `sitemap-cms.xml` est dynamique et liste les URLs publiées ; déclaré dans `robots.txt` en plus du sitemap statique.
- Site et articles en français (`fr`). Les pages vidéo restent en français (`lang="fr"`) et déclarent la langue parlée de la vidéo en darija marocaine (`inLanguage: ar-MA`).
- Les contenus médicaux doivent être rédigés ou revus par un professionnel compétent. Ne pas publier de données de santé identifiantes, d'images de patients non autorisées, de promesses de résultat ou de témoignages non vérifiés.

## Démarrage rapide

Appliquer les migrations D1 dans l’ordre, y compris `0002_video_darija.sql`, pour enregistrer la langue parlée des vidéos.

Pour une installation depuis GitHub, suivre **[GITHUB-SETUP.md](GITHUB-SETUP.md)**. Voir aussi **[DEPLOY.md](DEPLOY.md)** pour la procédure Cloudflare complète. Aucun mot de passe, jeton ou identifiant de base de données n'est inclus dans ce ZIP. Il faut créer la base D1, configurer Cloudflare Access et ajouter les variables/secrets du projet avant la mise en production.

## Données du cabinet

Le site reprend les informations présentes dans la version précédente. Avant publication, le cabinet doit confirmer l'exactitude des coordonnées, horaires, qualifications, diplômes et services. Les informations médicales et institutionnelles ne doivent pas être considérées comme vérifiées par le seul fait qu'elles figurent dans le code.


## Multilingual SEO (v4.2.0)

The public site now includes French and Arabic (RTL) landing pages for the clinic, medical dermatology, and aesthetic medicine. Arabic pages use `lang="ar-MA"`, `dir="rtl"`, reciprocal `hreflang` links, and production canonicals. CMS articles remain French-language content until Arabic editorial workflows are implemented.


## V4.5.3 SEO follow-up

This release responds to Seobility crawl #5: contextual article anchors, distinct language-switch labels, shorter homepage brand link text, separate keyword intent for `/conseils/` and `/articles/`, and additional page-specific information on the four pages below 500 words.

The dynamic `/sitemap-cms.xml` route depends on the existing D1 binding `DB` and the `cms_articles` / `cms_videos` tables. Run `APPLY-D1-MIGRATIONS-WINDOWS.bat` from the repository root after verifying the target account and backing up the database. Then confirm the endpoint returns HTTP 200 with valid XML. XML being non-HTML is expected for a sitemap and is not itself an error.


## V4.5.4 final Seobility cleanup

This release is based on the supplied Seobility Full Export dated 22 November 2026 (crawl #6, 94% overall). It corrects the long appointment-card anchor, `/articles/` snippet/H1/content findings, and adds factual clinic geo markup. The updated D1 helper verifies the existing database ID, exports the remote database before changes, applies pending migrations, and verifies the CMS schema.

**Important:** the dynamic `/sitemap-cms.xml` cannot return HTTP 200 until the existing remote D1 database contains the CMS migrations and the Pages Production binding `DB` points to that database. Do not replace the database.
