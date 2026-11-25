## V4.6.3 — Nouvelle vidéothèque reliée au CMS (2026-11-25)

- Adaptation de la maquette fournie pour la page Vidéos : vidéo mise en avant, rubriques accordéon et liste récente responsive.
- Les catégories, images de couverture et liens sont alimentés par les vidéos réellement publiées dans le CMS; aucun média de démonstration n’est ajouté.
- Conservation des textes explicatifs, de l’URL canonique et des données structurées existantes.

## V4.6.2 — Interface harmonisée sur les pages publiques (2026-11-25)

- Application du nouveau thème sur les pages de service, vidéos, conseils, contact, arabe et contenus CMS.
- Ajout du formulaire de rendez-vous Cloudflare sur la page Contact; le endpoint `/api/rdv` et sa validation restent inchangés.
- Ajout d’un test de régression pour l’interface partagée des pages publiques.

## V4.6.1 — Nouvelle interface d’accueil intégrée (2026-11-25)

- Refonte visuelle de l’accueil avec le nouveau design, sans migration React.
- Conservation des URL, contenus dédiés, hreflang, canonicals, données structurées et sitemap.
- Remplacement des interactions de démonstration par les routes du site et le formulaire Cloudflare `/api/rdv`.
- Les pages en arabe, le CMS Cloudflare Pages Functions et les migrations D1 restent inchangés.

# Changelog

## V4.5.4 — Final Seobility cleanup (2026-11-22)
- Fixed the overlong homepage anchor reported by Seobility: appointment information is no longer wrapped in one large link; only the concise appointment CTA is linked.
- Refined `/articles/` meta description, H1/body keyword alignment and explanatory text; local main-content extraction now exceeds 500 words.
- Added factual `GeoCoordinates` to the clinic's `MedicalClinic` JSON-LD using the coordinates already present in the Google Maps directions link; retained verified opening-hours markup.
- Added regression tests for the latest Seobility report.
- Hardened the Windows D1 migration helper with exact database-ID validation, remote SQL export verification, ordered pending migrations and schema checks.
- Kept `/sitemap-cms.xml` fail-closed until the existing D1 binding and CMS migrations are operational; no synthetic empty sitemap is returned.

## V4.5.3 — Seobility follow-up remediation

- Replaced generic repeated article-card links with distinct, descriptive topic anchors.
- Gave Arabic-to-French language links page-specific labels.
- Shortened the homepage brand link text without removing the visible clinic subtitle.
- Differentiated the `/articles/` publication library from the `/conseils/` patient-information hub in title, description, H1, breadcrumb and section headings.
- Added page-specific patient guidance to the four pages below Seobility’s 500-word heuristic.
- Kept the CMS sitemap fail-closed: the endpoint returns an error until the existing D1 CMS schema is available; do not replace this with a fake empty success response.

## 4.5.0 — Official-domain SEO release (2026-11-16)
- Confirmed production SEO directives, canonicals, hreflang, robots.txt and sitemap target `https://dermatologue-tanger.com`.
- Kept `*.pages.dev` preview environments `noindex, nofollow` at both HTML and HTTP-header levels.
- Clarified Cloudflare production-domain launch and crawler verification steps.
- Removed an invalid `/contact/` redirect entry; the canonical contact page remains directly accessible.

## 4.4.0 — 2026-11-16
- Added a verified local landmark context to the homepage access section (centre-ville / opposite Cinéma Goya), retaining the clinic-approved NAP.
- Added a Tanger competitor benchmark and actionable local SEO launch plan based on the owner's competitor CSV, public directory observations and the 14 November clinic content brief.
- Clarified that the `pages.dev` noindex policy is intentional; final indexability must be tested on the production custom domain.


## 4.3.0 — 2026-11-16
- Applied the 14 November 2026 bilingual content brief to the homepage and core service/contact routes.
- Added French and Arabic pages for dermatological surgery and appointment/contact information.
- Aligned canonical routes for medical dermatology and aesthetic medicine; retained permanent redirects from the former routes.
- Standardized clinic address, telephone and WhatsApp details from the approved brief.
- Added the persistent mobile Call / WhatsApp / Directions action bar.
- Updated sitemap, llms.txt, medical page metadata and regression tests.
- Confirmed local tests and SEO checks pass; production deployment and live indexing remain unverified.

# Changelog

## 4.1.2 — Local SEO pre-launch remediation
- Added host-aware Pages middleware for staging noindex and production HTTPS HSTS.
- Added a custom 404 page and widened Pages middleware routing.
- Corrected heading hierarchy and duplicate heading on the advice hub.
- Replaced crawler-visible CMS loading placeholders with stable fallback copy.
- Completed Open Graph/Twitter metadata for articles and videos hubs.
- Added SEO HTML/JSON-LD checks and middleware tests.
- Added SEO baseline, local strategy, keyword map, remediation and pre-launch reports.


## 4.1.0 — Français partout, vidéos en darija

- Site public, navigation, articles et métadonnées éditoriales exclusivement en français.
- Les vidéos du CMS sont déclarées en darija marocaine (`spoken_language = ar-MA`).
- Pages vidéo HTML en français avec `VideoObject.inLanguage = ar-MA`.
- Éditeur peut rédiger et soumettre ; seul le médecin référent peut valider et publier.
- Migration D1 `0002_video_darija.sql`.
- Documentation de déploiement et contrôles étendus.

## V4.1.1 — Robustesse de session CMS
- Corrige le crash de l'interface lorsque la réponse API ne contient pas `actor.email`.
- Ajoute une erreur explicite indiquant les contrôles Cloudflare Pages Functions, routes CMS et variables Access à vérifier.
- Désactive le cache navigateur pour les appels API CMS.

## 4.2.0 — Bilingual SEO and security remediation
- Added Arabic landing pages for the clinic, medical dermatology, and aesthetic medicine with reciprocal hreflang.
- Added Arabic/ French language navigation and multilingual sitemap entries.
- Expanded dermatology information on zona, skin infections, herpes and skin manifestations associated with STIs using non-diagnostic language.
- Removed inline style attributes and moved admin CSS to an external stylesheet; tightened Content Security Policy.
- Fixed nested H1 markup, added an accessible schedule caption, image titles, WebP picture sources, and Twitter image alt metadata.
- Aligned Wrangler project and deploy script with Cloudflare Pages project `dermtanger`.
- Kept Pages preview deployments noindex; production indexing and redirects remain dependent on Cloudflare custom-domain configuration.

## 4.2.1 — 2026-11-12

- Aligned preview HTML `robots` meta and `X-Robots-Tag` directives (`noindex, nofollow`).
- Removed production canonical and hreflang declarations from preview HTML only; production canonicals and index directives remain unchanged.
- Added HSTS to all HTTPS responses and static security headers.
- Diversified repeated internal appointment CTA anchor text on affected pages.
- Added a Cloudflare deployment and local SEO launch checklist based on the supplied audit PDFs.

## V4.5.0 — Local SEO and bilingual content refinement (22 November 2026)
- Reworked homepage structured data into a connected MedicalClinic, Person and WebSite graph using the existing clinic details and verified source values only.
- Normalized French locale declarations to `fr-MA`.
- Expanded the crawlable French article and video hub introductions.
- Expanded Arabic homepage and service-page patient information with original, non-promissory content.
- Refreshed static sitemap `lastmod` values to the content revision date.
- Added Windows local-preview and Wrangler Direct Upload scripts plus deployment guidance that explicitly protects Pages Functions and D1 CMS functionality.


## V4.5.2 — Seobility audit remediation
- Shortened homepage article-card anchors and made language-switch links page-specific.
- Replaced WhatsApp short links with direct API send links.
- Removed the incomplete contact redirect; `/contact/` remains canonical.
- Reduced repeated article text and expanded short patient-resource pages with medically cautious practical guidance.
- Added D1 table verification to the migration helper and documented the external WWW DNS/redirect action.
