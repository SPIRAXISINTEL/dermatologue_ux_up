# Architecture technique — V4 CMS custom

## 1. Vue d'ensemble

```text
Visiteur
  ├── Site vitrine statique (Pages Assets)
  ├── /conseils/ + articles historiques
  ├── /articles/<slug>/ ── Pages Function ── D1 (published only)
  └── /videos/<slug>/   ── Pages Function ── D1 (published only)

Équipe éditoriale
  └── Cloudflare Access (MFA / identité)
       └── /admin/ (interface JS)
            └── /api/cms/* (JWT RS256 vérifié côté serveur)
                 └── Cloudflare D1
                      ├── cms_articles
                      ├── cms_videos
                      └── cms_audit_log

Dr Chaibi (DOCTOR_EMAIL)
  └── seul rôle pouvant publier / supprimer

Googlebot
  ├── sitemap.xml (pages statiques)
  └── sitemap-cms.xml (pages CMS publiées uniquement)
```

## 2. Composants et responsabilités

| Composant | Responsabilité |
|---|---|
| `admin/index.html` | Interface d'administration sans framework |
| `assets/js/cms-admin.js` | Formulaires, bibliothèque, édition des brouillons, soumission et publication |
| `functions/_lib/cms.js` | Validation du JWT Access, RBAC, normalisation, audit et rendu HTML |
| `functions/api/cms/*` | API privée de gestion des articles et vidéos |
| `functions/api/public/*` | API de lecture des seules publications validées |
| `functions/articles/[slug].js` | HTML SSR indexable pour chaque article publié |
| `functions/videos/[slug].js` | HTML SSR indexable pour chaque vidéo publiée |
| `functions/sitemap-cms.xml.js` | Sitemap XML dynamique des contenus publiés |
| `migrations/0001_cms.sql` | Tables, contraintes et index D1 |

## 3. Contrat des API

| Méthode | Route | Autorisation | Fonction |
|---|---|---|---|
| GET | `/api/cms/articles` | Editor / Doctor | Liste privée |
| POST | `/api/cms/articles` | Editor / Doctor | Créer un brouillon |
| GET | `/api/cms/articles/:id` | Editor / Doctor | Lire un brouillon |
| PATCH | `/api/cms/articles/:id` | Editor / Doctor | Modifier, repasser en brouillon |
| POST | `/api/cms/articles/:id/review` | Editor / Doctor | Soumettre à validation |
| POST | `/api/cms/articles/:id/publish` | Doctor uniquement | Publier après validation |
| POST | `/api/cms/articles/:id/unpublish` | Doctor uniquement | Retirer du public pour révision |
| GET / POST | `/api/cms/videos` | Editor / Doctor | Lister / créer un brouillon vidéo |
| PATCH | `/api/cms/videos/:id` | Editor / Doctor | Modifier un brouillon vidéo |
| POST | `/api/cms/videos/:id/review` | Editor / Doctor | Soumettre la vidéo |
| POST | `/api/cms/videos/:id/publish` | Doctor uniquement | Publier la vidéo |
| POST | `/api/cms/videos/:id/unpublish` | Doctor uniquement | Retirer du public pour révision |
| GET | `/api/public/articles` | Public | Métadonnées des articles publiés |
| GET | `/api/public/videos` | Public | Métadonnées des vidéos publiées |

## 4. Contrôles de sécurité

- L'API privée exige un JWT Cloudflare Access présent dans `Cf-Access-Jwt-Assertion`.
- Le JWT est vérifié cryptographiquement avec les clés publiques JWKS de l'émetteur Access ; audience, issuer, expiration et signature sont contrôlés.
- Les rôles sont attribués côté serveur par comparaison exacte des e-mails autorisés.
- Les opérations de publication et de suppression exigent le rôle médecin.
- Les requêtes mutantes vérifient l'origine lorsqu'un en-tête `Origin` est fourni.
- Les entrées sont limitées en longueur ; les slugs sont normalisés ; les HTML bruts sont échappés lors du rendu.
- Les liens Markdown sont limités à HTTP(S), les images de couverture à HTTPS ou `/assets/`.
- Le public ne peut pas lire les contenus `draft`, `in_review` ou `archived`.
- Les événements d'édition, soumission, publication et suppression sont consignés dans `cms_audit_log`.

## 5. Modèle de données

### cms_articles
Identifiant UUID, slug unique, titre, résumé, corps Markdown, catégorie, auteur, statut, e-mails créateur/éditeur/relecteur, dates de création/mise à jour/relecture/publication, SEO title/description et image de couverture.

### cms_videos
Identifiant UUID, slug unique, titre, description, URL YouTube, identifiant YouTube extrait et validé, catégorie, auteur, statut, identités et dates de validation, métadonnées SEO.

### cms_audit_log
Journal append-only applicatif des opérations CMS : acteur, action, type d'entité, ID, date et détails non médicaux.

## 6. Choix de rendu et SEO

Les pages individuelles CMS sont rendues en HTML côté serveur, plutôt que dépendre uniquement du JavaScript côté navigateur. Chaque page publiée comprend un title, une meta description, une canonical, Open Graph et des données structurées adaptées. Le sitemap dynamique n'inclut jamais les brouillons.

Les vidéos sont hébergées sur YouTube et embarquées depuis `youtube-nocookie.com`. Le CMS n'héberge pas de fichiers vidéo et n'expose pas de stockage média patient.

## 7. Limites assumées de cette version

- Les contenus publiés ne sont pas modifiables directement. Le médecin peut les retirer du public, les remettre en brouillon, les modifier puis les soumettre à nouveau. La page reste temporairement indisponible pendant cette nouvelle validation ; un mécanisme de révisions versionnées sans interruption est une évolution ultérieure.
- L'upload de médias dans R2 n'est pas inclus ; les images de couverture utilisent un chemin `/assets/` existant ou une URL HTTPS approuvée.
- L'authentification dépend de la configuration Cloudflare Access et des variables d'environnement du compte du cabinet.
- La migration D1 et le déploiement Pages restent à exécuter dans le compte Cloudflare propriétaire du domaine.


## V4.1 — politique linguistique

Les pages statiques principales sont en français et les pages correspondantes disponibles existent sous `/ar/` en arabe marocain. Les articles du CMS restent en français ; aucune page d’article en darija n’est générée. Les vidéos peuvent être parlées en darija marocaine, tandis que leurs pages, titres, descriptions et métadonnées SEO restent en français. Le champ `spoken_language` vaut `ar-MA`.

Rédaction : rôle `editor` (équipe éditoriale). Publication : rôle `doctor` uniquement, après soumission `in_review`.
