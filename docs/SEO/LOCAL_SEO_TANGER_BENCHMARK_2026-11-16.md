# Local SEO — Tanger benchmark and action plan (16 November 2026)

## Executive finding

The GTmetrix report for `https://dermtanger.pages.dev/` shows Grade A, Performance 98%, Structure 97%, LCP 915 ms, TBT 0 ms and CLS 0. These are strong lab results, not evidence of Google rankings.

The Seobility screenshot reports one failed check: the first page contains `noindex, nofollow`. This is intentional on the `*.pages.dev` preview host. `functions/_middleware.js` applies `X-Robots-Tag: noindex, nofollow` and a matching robots meta tag to preview deployments, while the production custom domain is excluded from that policy. Therefore:
- Keep preview deployments noindex to prevent duplicate/unfinished pages from entering Google's index.
- Run the final crawl against `https://dermatologue-tanger.com/`, not `https://dermtanger.pages.dev/`.
- Verify the production response has no `X-Robots-Tag: noindex` and HTML contains `index, follow`.
- Do not remove the preview protection just to make the preview scan pass.

## Competitor benchmark supplied by the site owner

Source: `20261116_competitorslist.csv`. Visibility and keyword counts are third-party tracking metrics from the supplied export; they are not Google positions, traffic, or proof of business quality.

| Domain | Visibility | Ranking keywords | Referring domains |
|---|---:|---:|---:|
| dermatologueboutaj.ma | 1.89 | 46 | 0 |
| drdermatologuetanger.ma | 1.67 | 46 | 15 |
| dermatologue-tanger.ma | 1.80 | 23 | 1 |
| dermatolaser-tanger.com | 1.26 | 40 | 7 |
| drkammous.com | 0.50 | 20 | 3 |
| dermatologue-leilagharibi.ma | 0.02 | 2 | 3 |
| dermatologuetanger.ma | 0.05 | 13 | 1 |
| dermtanger.pages.dev | 0.00 | 0 | 0 |

The `pages.dev` row should not be interpreted as the performance of the canonical production domain: it is a preview host and is deliberately noindex.

## Competitive observations from public pages

- Competing sites use clear Tanger-specific service positioning, prominent appointment calls to action, service groupings and substantial condition/service content.
- Some competitor pages publish testimonials, review counts and equipment claims. Do not copy those claims or fabricate reviews, credentials, results, devices or patient outcomes.
- The strongest defensible differentiators for this clinic are the physician's identity, exact cabinet location, verified hours, French/Arabic consultations, pediatric and adult dermatology, dermoscopy, dermatologic surgery and the services confirmed by the physician.

## Primary local SEO positioning

Primary query: **dermatologue à Tanger**.

Supporting intent clusters:
- `dermatologue Tanger centre-ville`, `cabinet dermatologie Tanger`, `rendez-vous dermatologue Tanger`
- `dermatologue acné Tanger`, `eczéma Tanger`, `psoriasis Tanger`, `chute de cheveux Tanger`
- `dermoscopie Tanger`, `grains de beauté Tanger`, `chirurgie dermatologique Tanger`
- `dermatologie enfant Tanger`, `dermatologue pédiatrique Tanger`
- `laser dermatologique Tanger`, `médecine esthétique Tanger`
- Arabic equivalents such as `طبيب جلدية طنجة`, `طبيب الأمراض الجلدية طنجة`, `طبيب جلدية وسط طنجة`

Use these naturally in relevant page titles, headings, explanatory copy, image alt text and internal links. Do not create doorway pages for every keyword or repeat “Tanger” unnaturally.

## Local relevance added in V4.4

The homepage's “Horaires et accès” section now explains that the practice is in central Tangier, on avenue Prince Moulay Abdellah, opposite Cinéma Goya. The landmark is corroborated by multiple public directory listings. The clinic's canonical address remains the exact form approved in the 14 November 2026 content brief:
`39, avenue Prince Moulay Abdellah, 90000 Tanger`.

## NAP and directory consistency

Use one owner-approved source of truth everywhere:
- Name: Dr Yassir Chaibi — Dermatologue
- Address: 39, avenue Prince Moulay Abdellah, 90000 Tanger
- Telephone: 05 39 32 04 07
- WhatsApp: 06 39 32 04 07 (appointment and agreed follow-up only)
- Hours: Monday–Friday 09:00–12:00 and 13:00–17:00; Saturday 10:00–13:30; Sunday closed
- Languages: French and Arabic, as confirmed in the clinic brief
- Map: https://maps.app.goo.gl/NuFWofurxiVVA5K78

Public directory data currently contains inconsistent opening hours and address formatting. Update or claim the relevant listings (Google Business Profile, Sahha, DabaDoc, Med.ma, SIHA Maroc, Telecontact, SOS Doc, OneDoc) and request corrections. Do not create duplicate profiles. Confirm the correct WhatsApp number and language fields with the owner before publishing them to directories.

## 30-day execution plan

### Priority 0 — production indexability
1. Attach `dermatologue-tanger.com` as the production custom domain in Cloudflare Pages.
2. Crawl the production domain. Confirm HTTP 200, self-canonical, `index, follow`, no `X-Robots-Tag: noindex`, working HTTPS and redirects.
3. Submit `/sitemap.xml` and `/sitemap-cms.xml` in Google Search Console.
4. Inspect the homepage, contact page, core service pages and Arabic equivalents in URL Inspection.

### Priority 1 — Google Business Profile
1. Claim/verify the real practice profile.
2. Match name, address, phone, hours, website and map pin exactly.
3. Choose the most accurate primary category available; add only genuine secondary categories.
4. Add real exterior/signage, reception, consultation-room and physician-approved photos.
5. Add service descriptions that match the actual website and the doctor's approved scope.
6. Ask all patients for honest reviews without incentives, gating or fabricated content; respond without disclosing patient information.

### Priority 2 — citations and authority
1. Correct inconsistent directory records listed above.
2. Ensure all listings point to the canonical HTTPS domain and the right contact page.
3. Seek relevant local medical/health directory citations and legitimate professional references.
4. Avoid paid link schemes, bulk low-quality directories and exact-match anchor manipulation.

### Priority 3 — content and internal links
1. Complete the dedicated child dermatology page and the grains-of-beauty/dermoscopy page if the physician approves the content.
2. Keep one clear search intent per page; link condition articles to the relevant service page and physician profile.
3. Add named medical reviewer and review date only after the physician has approved the content.
4. Keep French and Arabic pages equivalent in purpose, with correct `hreflang` and reciprocal links.

### Priority 4 — measurement
Track weekly in Google Search Console by query, page, country and device. Configure a rank tracker for Morocco/Tanger and monitor:
- dermatologue Tanger
- dermatologue à Tanger
- dermatologie Tanger
- dermatologue enfant Tanger
- dermoscopie Tanger
- chirurgie dermatologique Tanger
- médecine esthétique Tanger
- طبيب جلدية طنجة

Measure calls, WhatsApp clicks, directions clicks and appointment-form submissions separately. Compare qualified appointment enquiries, not only impressions or rank.

## Release gates

- [ ] Production domain is crawlable and indexable.
- [ ] Preview `pages.dev` remains noindex.
- [ ] Sitemap contains only canonical production URLs.
- [ ] Google Business Profile NAP/hours match the clinic-approved values.
- [ ] All third-party listing discrepancies have been corrected or logged.
- [ ] Physician has approved all medical content and service claims.
- [ ] GSC and local rank tracking are configured.
- [ ] Real user Core Web Vitals are monitored after sufficient traffic.

No SEO implementation can guarantee a first-place ranking. Local results also depend on proximity, relevance, prominence, competition and the quality/consistency of the clinic's real-world profile.
