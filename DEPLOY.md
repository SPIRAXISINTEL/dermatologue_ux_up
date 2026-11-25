# Déploiement V4.1 — dermatologue-tanger.com

Cette version ajoute un CMS personnalisé. **Le ZIP seul ne peut pas activer le CMS** : Cloudflare D1 et Cloudflare Access doivent être configurés. Déployer via Git connecté à Cloudflare Pages ou Wrangler CLI afin que le répertoire `functions/` soit compilé et publié. Un simple upload de fichiers statiques peut ne pas déployer les Pages Functions.

## 1. Préparer le projet Cloudflare Pages

1. Connecter le dépôt Git contenant ce projet à **Workers & Pages → Pages** (recommandé) ou déployer avec Wrangler.
2. Framework preset : `None`.
3. Build command : vide / aucune commande.
4. Build output directory : `.` (racine du projet).
5. Vérifier que les fonctions `functions/` sont bien détectées au déploiement.
6. Attacher `dermatologue-tanger.com` au projet Pages. Ne pas changer les DNS du domaine de production avant d'avoir vérifié la préproduction.

## 2. Créer la base Cloudflare D1

Avec Wrangler installé et authentifié :

```bash
npx wrangler d1 create dermatologue-tanger-cms
```

Copier l'ID retourné dans `wrangler.toml`, à la place de `REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID`.

Appliquer la migration :

```bash
npx wrangler d1 migrations apply dermatologue-tanger-cms --remote
```

Dans Cloudflare Pages → Settings → Functions → D1 database bindings, vérifier le binding :

- Variable name : `DB`
- D1 database : `dermatologue-tanger-cms`

Si le binding est défini dans le dashboard, il doit porter exactement le nom `DB` utilisé par le code.

## 3. Protéger l'administration avec Cloudflare Access

Créer une application Access Self-hosted couvrant au minimum :

- `dermatologue-tanger.com/admin*`
- `dermatologue-tanger.com/api/cms/*`

Autoriser uniquement les adresses e-mail nominativement approuvées du cabinet. Ne pas ouvrir `/api/cms/*` à `Everyone`.

Récupérer :

- **Application AUD tag** : dans les détails de l'application Access.
- **Team domain / issuer** : `https://<votre-équipe>.cloudflareaccess.com`.

Ajouter les variables d'environnement Pages (Production et Preview selon le besoin) :

| Variable | Valeur |
|---|---|
| `CF_ACCESS_ISSUER` | `https://<votre-équipe>.cloudflareaccess.com` |
| `CF_ACCESS_AUD` | AUD tag exact de l'application Access |
| `DOCTOR_EMAIL` | adresse e-mail Access personnelle du médecin référent |
| `CMS_EDITOR_EMAILS` | liste séparée par virgules des éditeurs autorisés (facultatif) |
| `SITE_URL` | `https://dermatologue-tanger.com` |

Le backend vérifie la signature RS256 du JWT Cloudflare Access, son issuer, son audience, son expiration et l'e-mail. Il n'accorde aucun droit à partir d'un simple en-tête e-mail non signé. **Ne pas remplacer cette validation par une simple lecture de `Cf-Access-Authenticated-User-Email`.**

## 4. Variables du formulaire de rendez-vous existant

Pages → Settings → Variables and Secrets :

| Variable | Type | Valeur |
|---|---|---|
| `RESEND_API_KEY` | Secret | Clé API Resend |
| `RDV_TO` | Variable | E-mail du cabinet destinataire |
| `RDV_FROM` | Variable | Expéditeur vérifié chez Resend |

Le formulaire `/api/rdv` existant dépend de ces valeurs. Tester l'envoi en environnement Preview avant Production.

## 5. Utiliser le CMS

**Règle linguistique :** les pages statiques existent en français, avec des pages correspondantes en arabe sous `/ar/`. Les articles du CMS sont rédigés en français. Les vidéos peuvent être parlées en darija marocaine ; leurs titres, descriptions et métadonnées SEO restent en français. Un éditeur peut rédiger et soumettre ; seul le compte `DOCTOR_EMAIL` peut publier.

1. Ouvrir `https://dermatologue-tanger.com/admin/` avec une adresse autorisée par Cloudflare Access.
2. Créer un article en français (titre, slug, résumé, contenu Markdown, catégorie, SEO title et meta description facultatifs) ou une vidéo parlée en darija marocaine (titre et description de page en français, URL YouTube).
3. Enregistrer : le contenu reste `draft` et n'est pas indexable.
4. Cliquer sur **Soumettre** : statut `in_review`.
5. Le Dr Chaibi se connecte avec l'adresse configurée dans `DOCTOR_EMAIL`, vérifie le contenu, puis clique sur **Valider & publier**.
6. La page devient accessible à `/articles/<slug>/` ou `/videos/<slug>/`. Le sitemap CMS se met à jour automatiquement.

Le contenu article accepte Markdown simple : titres `#`, `##`, `###`, paragraphes, listes `-`, gras `**...**`, italique `*...*`, code inline et liens HTTP(S). Le HTML brut est échappé par le moteur de rendu.

## 6. Déployer avec Wrangler (alternative)

Après configuration du `database_id` dans `wrangler.toml`, installation/usage de Wrangler et création du projet Pages, le script `npm run deploy` exécute la commande de déploiement. Le script `npm run check` vérifie la syntaxe de tous les fichiers JavaScript ; `npm test` lance les tests unitaires.

Depuis la racine du projet :

```bash
npx wrangler pages deploy . --project-name=dermtanger
```

Vérifier que la configuration Pages inclut bien le binding D1 et les variables d'environnement. Le `database_id` de `wrangler.toml` doit être réel avant déploiement.

## 7. Vérifications après déploiement

- [ ] `/` et les pages vitrines existantes sont inchangées visuellement.
- [ ] `/admin/` demande une authentification Cloudflare Access.
- [ ] Un visiteur non autorisé reçoit `401` ou `403` sur `/api/cms/articles`.
- [ ] Un éditeur peut créer un brouillon et le soumettre.
- [ ] Un éditeur ne peut pas publier (`403`).
- [ ] Le médecin peut valider et publier un contenu `in_review`.
- [ ] Un brouillon n'apparaît pas dans `/api/public/articles`, `/api/public/videos` ni `sitemap-cms.xml`.
- [ ] Une publication d'article renvoie une page HTML complète avec canonical, meta description et JSON-LD.
- [ ] Une publication vidéo utilise `youtube-nocookie.com`, fournit `VideoObject` avec `inLanguage: ar-MA`, conserve la page en français et identifie la langue parlée comme `ar-MA`.
- [ ] `/articles/`, `/videos/`, `/sitemap-cms.xml` et `/sitemap.xml` répondent correctement.
- [ ] Le formulaire RDV envoie toujours un e-mail de test.
- [ ] Contrôler les Core Web Vitals, les erreurs Functions et les logs D1 après mise en production.

## 8. Sécurité et gouvernance

- Ne jamais committer de secret, token Access, clé Resend ou donnée patient.
- Restreindre les politiques Access au personnel autorisé et activer MFA côté fournisseur d'identité.
- Garder D1 accessible uniquement via le binding Pages ; ne pas exposer de route publique d'écriture.
- Sauvegarder D1 avant les migrations ou opérations de maintenance.
- Éviter toute donnée personnelle ou donnée de santé dans les articles, formulaires de commentaires ou vidéos.
- La publication médicale reste sous la responsabilité du médecin : l'outil impose le workflow, mais ne remplace pas la revue clinique.

## Diagnostic — erreur `Cannot read properties of undefined (reading 'email')`
Cette erreur indique que l'interface a reçu une réponse API CMS sans objet `actor` exploitable, ou qu'un ancien bundle est encore servi. La version V4.1.1 remplace le crash par un diagnostic explicite.
Après déploiement, vérifier dans le navigateur (Network) que `GET /api/cms/articles` et `GET /api/cms/videos` répondent `200` en JSON et contiennent `actor.email` et `actor.role`. Si réponse `404`, les Pages Functions n'ont pas été déployées (ne pas utiliser un simple upload statique). Si `503`, vérifier le binding D1 `DB` et les variables `CF_ACCESS_AUD` / `CF_ACCESS_ISSUER`. Si `401`, vérifier l'application Cloudflare Access et le JWT. Si `403`, vérifier `DOCTOR_EMAIL` / `CMS_EDITOR_EMAILS`. Effectuer ensuite un hard refresh du navigateur.
