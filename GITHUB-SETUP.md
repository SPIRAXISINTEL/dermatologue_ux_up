# GitHub + Cloudflare Pages deployment (V4.6.3)

This repository is prepared for Cloudflare Pages Git integration. Cloudflare Pages performs the deployment; GitHub Actions only runs quality checks.

## 1. Upload this project to GitHub

1. Create or open the GitHub repository that will contain the website.
2. Upload the **contents** of this ZIP to the repository root (not the ZIP file itself and not an extra enclosing folder).
3. Ensure `index.html`, `wrangler.toml`, `functions/`, `migrations/`, `assets/` and `package.json` are at the repository root.
4. Commit and push to the production branch selected in Cloudflare Pages (commonly `main`).

The `.github/workflows/quality.yml` workflow runs `npm test` and `npm run check` on pushes to `main` and pull requests. It does not deploy the site.

## 2. Connect the existing Cloudflare Pages project

In Cloudflare Dashboard, open **Workers & Pages → dermtanger → Settings → Builds & deployments** and connect this GitHub repository.

Use these settings:

| Setting | Value |
|---|---|
| Production branch | Your actual production branch (for example `main`) |
| Framework preset | None |
| Root directory | `/` (repository root) |
| Build command | Leave empty |
| Build output directory | `.` |

Keep the existing Pages project named `dermtanger`. Do not create a replacement project. Cloudflare Pages Git integration detects and deploys the `functions/` directory; do not use a static-only ZIP upload for this project.

## 3. D1 binding

In **Settings → Functions → D1 database bindings**, configure:

| Field | Value |
|---|---|
| Variable name | `DB` |
| D1 database | `dermatologue-tanger-cms` |
| Database ID | `f66b8595-d025-44e5-bc89-a32f69909509` |

This is the existing database configured in `wrangler.toml`. Preserve its ID and back it up before any schema migration. Do not create a second database.

## 4. Variables and secrets

In **Settings → Variables and Secrets**, configure these for Production. Configure Preview separately if you intend to test CMS and appointment functionality on preview deployments.

### Variables (not secrets)

| Name | Value |
|---|---|
| `SITE_URL` | `https://dermatologue-tanger.com` |
| `CF_ACCESS_ISSUER` | `https://YOUR-TEAM.cloudflareaccess.com` |
| `CF_ACCESS_AUD` | The exact AUD tag from the Cloudflare Access application |
| `DOCTOR_EMAIL` | The doctor's exact email used to authenticate through Cloudflare Access |
| `CMS_EDITOR_EMAILS` | Comma-separated authorized editor emails; optional if no editors are configured |
| `RDV_TO` | Clinic inbox that receives appointment requests |
| `RDV_FROM` | Sender address verified with Resend |

### Secret

| Name | Value |
|---|---|
| `RESEND_API_KEY` | Private Resend API key |

Replace all placeholders with real values. Never commit `.dev.vars`, `.env` files, API tokens, passwords, or private keys. `.dev.vars.example` contains placeholders for local development only.

## 5. Cloudflare Access

Configure the Access application and its allow policies for the CMS routes as described in `DEPLOY.md`. Restrict access to the doctor's and explicitly authorized editors' email addresses. Obtain the Team domain and exact application AUD tag from Cloudflare Access and use them for `CF_ACCESS_ISSUER` and `CF_ACCESS_AUD`.

## 6. Database migrations

The ZIP includes migrations `0001_cms.sql` and `0002_video_darija.sql`. Inspect the current remote D1 migration state and take a backup before applying any migration. The current Cloudflare dashboard screenshot showed this database with **0 tables**, which explains the live `/sitemap-cms.xml` response of HTTP 503: the binding exists, but the CMS schema is not installed. First confirm the migration list and take a D1 export backup. Then apply pending migrations in order with `npx wrangler@3.114.17 d1 migrations apply dermatologue-tanger-cms --remote`. This creates the CMS tables and adds the Darija video-language field. Do not rerun migrations already marked as applied.

## 7. Verify before production

After the first deployment, test:

- `/` and `/ar/`
- `/sitemap.xml` and `/sitemap-cms.xml`
- `/admin/` requires Cloudflare Access authentication
- Unauthorized requests to `/api/cms/*` are rejected
- CMS draft creation, editor review, and doctor-only publishing
- `/api/public/articles` and `/api/public/videos`
- `/api/rdv` and actual appointment email delivery
- Production custom domain canonical URLs and indexability
- Preview deployment remains `noindex`

See `DEPLOY.md`, `CLOUDFLARE-DEPLOY-SEO.md`, and `docs/RELEASE-CHECKLIST.md` for the detailed operational instructions.

## Important

A successful GitHub Actions check does not prove that Cloudflare environment variables, Access policies, D1 bindings, DNS, or email delivery are configured. Verify those separately in Cloudflare before treating the site as production-ready.


## WWW custom domain

A redirect rule alone is not sufficient if the `www` host is not active on Pages. In Cloudflare Pages → `dermtanger` → Custom domains, add `www.dermatologue-tanger.com` and wait until active. Use the DNS CNAME target Pages supplies (the production Pages host is `derma-a37.pages.dev`), keep it proxied, and retain the zone redirect to `https://dermatologue-tanger.com/${1}` with a 301 and query-string preservation. A live Seobility check on 2026-11-22 still could not fetch HTTPS `www`, so verify again after activation.


## V4.6.3 release sequence

This UI-only release adds no database migration. Before any migration, inspect the remote D1 migration state and make a private backup; apply only migrations confirmed as pending. The Windows helper is an explicit remote database operation, not a local preview step.

Push the project to the GitHub branch connected to Cloudflare Pages and allow the existing Pages project `dermtanger` to deploy. Then verify `/`, `/ar/`, `/sitemap.xml`, `/sitemap-cms.xml`, and the appointment form. GitHub Actions runs quality checks only; it does not publish the site.
