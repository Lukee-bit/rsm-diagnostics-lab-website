<!-- Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/ -->

# Technical Attribution Implementation Report

Recorded: 2026-08-14  
Status: Local working-tree changes only. No publish or production deployment was performed as part of this task.

## 1. Executive overview

This project is a static multi-page HTML website for RSM Diagnostics Lab. A standards-compliant technical attribution record was added for Lucas J. Cooke, Partner Relations Coordinator, covering website design and development, website forms, and the majority of Document Center materials.

RSM Diagnostics Lab remains the `author`, publisher, organization, and owner in existing metadata, copyright lines, JSON-LD, and visible site identity. Lucas is recorded as a supplementary technical contributor only.

The only new visible public page is the direct-URL technical credits page. Main navigation, footer navigation, sitemaps, `llms.txt`, legal/privacy/HIPAA body copy, forms behavior, and Document Center UI were not used as credit surfaces.

## 2. Project architecture identified

| Area | Finding |
| --- | --- |
| Framework / stack | Static HTML5, one global `styles.css`, one global `script.js`. No `package.json`, bundler, CMS, or application server. |
| Root layout / templates | Each public page is a complete HTML document with duplicated header/footer markup. |
| Shared head | Per-page `<head>` (no shared layout engine). Existing `meta name="author"` is RSM Diagnostics Lab. |
| Assets | `assets/` (brand, fonts, images), `resources/` (Document Center PDFs, videos, forms). |
| Pages | `index.html`, `why-rsm.html`, `gastrointestinal-tests.html`, `nasal-throat-tests.html`, `document-center.html`, `request-kit.html`, `privacy-policy.html`, `terms-of-service.html`, `404.html`. |
| Forms | Three Google Forms embedded from `request-kit.html`; client-side tab/embed switching in `script.js`. No custom API routes, email templates, or server validators in-repo. |
| Document Center | `document-center.html` plus preview/filter/download logic in `script.js`. No CMS or internal `technicalCreator` content model. |
| JSON-LD | Per-page `<script type="application/ld+json">` graphs; organization/publisher is RSM Diagnostics Lab. |
| Docs | `deploy/cloudfront-seo.md`, `llms.txt`. No README, CHANGELOG, or RELEASE_NOTES. |
| Host config | `vercel.json`, `netlify.toml`, `firebase.json`, `customHttp.yml`, `staticwebapp.config.json`, `deploy/nginx.conf`, `_headers`, `_redirects`, `.htaccess`, `web.config`, `amplify-redirects.json`. |
| Generated / vendor / do-not-touch | PDFs and media in `resources/`, font files, lockfiles (none), minified vendor JS (none), secrets (none found for attribution). |

## 3. Files created

- `unlisted page` (public direct-URL page)
- `humans.txt` (public)
- `TECHNICAL_CREDITS.md` (project documentation)
- `TECHNICAL_ATTRIBUTION_IMPLEMENTATION_REPORT.md` (this report)

## 4. Files modified

- `index.html`
- `why-rsm.html`
- `gastrointestinal-tests.html`
- `nasal-throat-tests.html`
- `document-center.html`
- `request-kit.html`
- `privacy-policy.html`
- `terms-of-service.html`
- `404.html`
- `styles.css`
- `script.js`
- `deploy/cloudfront-seo.md`

Not modified for attribution: sitemaps, `robots.txt`, `llms.txt`, host JSON/YAML/XML configs, PDFs, legal/privacy/HIPAA **body** copy, form field copy, Document Center tile UI.

## 5. Exact attribution method used in each location

| Location | Method | Public? |
| --- | --- | --- |
| Custom HTML files | HTML comment immediately after `<!doctype html>` | Source-visible, not rendered |
| Custom HTML `<head>` | Keep `meta name="author" content="RSM Diagnostics Lab"`. Add `dcterms.contributor` and `link rel="author"` to `humans.txt` | Metadata in document source; not a visible on-page credit block |
| `styles.css`, `script.js` | Block/line comment with short-form credit | Source-visible |
| `deploy/cloudfront-seo.md` | Documentation comment; humans.txt Content-Type note | Project documentation |
| `unlisted page` | Visible canonical statement and contact mailto | Public, direct URL only |
| `humans.txt` | Plain-text humans.txt convention | Public |
| `TECHNICAL_CREDITS.md` | Full record | Project |

## 6. Exact metadata values added

Preserved:

```html
<meta name="author" content="RSM Diagnostics Lab" />
```

Added on public HTML pages:

```html
<meta name="dcterms.contributor" content="Lucas J. Cooke (technical design and development)" />
<link type="text/plain" rel="author" href="humans.txt" />
```

Rationale: Dublin Core **contributor** records technical contribution without replacing RSM as HTML `author` or schema publisher. `link rel="author"` to `humans.txt` follows the humans.txt convention.

## 7. Source files that received headers

Short-form text:

`Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/`

Applied once to:

- All custom HTML pages listed in section 4, plus `unlisted page`
- `styles.css`
- `script.js`
- `deploy/cloudfront-seo.md`

Not applied to tiny duplicated snippets, PDFs, fonts, host runtime configs, or third-party assets.

## 8. Forms and form systems reviewed

| System | In project? | Attribution added? |
| --- | --- | --- |
| Request a Kit UI / Google Form embeds | `request-kit.html` | Source header and page metadata only |
| Form picker, notices, attestations, iframe switching | `script.js` | Source header only |
| Google Forms (hosted) | External | No change |
| Server-side validation / API / email templates / payloads | None | N/A |

No credit was added to form fields, instructions, labels, errors, consent text, privacy language, confirmations, or submission payloads.

## 9. Document Center files and systems reviewed

| System | Finding |
| --- | --- |
| `document-center.html` | Custom listing, filters, preview, download. Source header and contributor metadata only. |
| `script.js` | Preview modal, category filters. Covered by JS header. |
| CMS / `technicalCreator` field | Not present. Not invented as a public data file. |
| PDF binaries in `resources/` | Not modified. |

## 10. Asset and document provenance

No PDF, image, font, or video files were modified. No Exif/XMP/PDF Author fields were written.

Internal per-file `technicalCreator` metadata is unavailable without a new public or build-time data model. Majority authorship is recorded in `TECHNICAL_CREDITS.md` and the credits page without assigning every filename.

## 11. Structured-data review and changes

Reviewed JSON-LD on existing pages. **No JSON-LD changes** on Home, test pages, Document Center, Request a Kit, Privacy, or Terms.

Rationale: adding `Person` as `author` or `creator` on `MedicalBusiness` / clinical `WebPage` graphs would misrepresent medical, laboratory, or publisher authorship.

`unlisted page` uses the same WebPage + BreadcrumbList pattern as other interior pages, with **publisher** still RSM Diagnostics Lab (`#organization`). No `Person` schema was added, to avoid schema used solely as a personal credit.

## 12. Operational and deployment records reviewed

JSON host configs were left unchanged (no valid comment syntax): `vercel.json`, `firebase.json`, `staticwebapp.config.json`, `amplify-redirects.json`, `site.webmanifest`.

Comment-capable host and ops files received the exact source credit inside existing header blocks or after the XML declaration: `netlify.toml`, `customHttp.yml`, `deploy/nginx.conf`, `_headers`, `_redirects`, `.htaccess`, `web.config`, `.well-known/security.txt`, plus XML sitemaps. Runtime keys, redirects, and header values were not changed.

`deploy/cloudfront-seo.md` contains the same source credit in its existing documentation header. That file is a reference, not a live CloudFront policy change.

External Vercel/Netlify/Firebase project descriptions, analytics properties, and tag managers are not represented as editable attribution fields in this project (see Requires Explicit Approval).

## 13. Technical credits page route

**unlisted direct URL**

This static site has no rewrite layer in-repo that would publish an unlisted path without changing host config. Clean an unlisted path is listed under Requires Explicit Approval.

The page is not in header nav, footer nav, sitemaps, or `llms.txt`. It is not `noindex` and is not disallowed in `robots.txt`.

## 14. Confirmation that `/humans.txt` exists

File: `humans.txt` at project root (served as `/humans.txt` on this static host).

## 15. Validation results

| Check | Result |
| --- | --- |
| npm lint / typecheck / unit / integration / production build | Not applicable. No `package.json`, linter, test runner, or production bundler. |
| `node --check script.js` | Passed |
| `xml.etree` parse of `sitemap.xml`, `sitemap-images.xml`, `sitemap_index.xml`, `web.config` | Passed |
| PyYAML parse of `customHttp.yml` | Passed (`customHeaders` intact, 8 patterns) |
| `tomllib` parse of `netlify.toml` | Passed (`build`, 8 redirects, 8 header blocks) |
| `json.loads` of JSON host configs and `site.webmanifest` | Passed (unchanged; no comments inserted) |
| JSON-LD `json.loads` on all HTML pages | Passed |
| Exact source credit near start of every eligible file | Passed |
| `nginx -t` / isolated `.htaccess` compile | Not run. `nginx` binary not installed; Apache is present but has no isolated htaccess test for this project. Comment-only edits. |

## 16. Confirmation: regulated and patient-facing content

No patient-facing, clinical, medical, legal, billing, privacy, consent, HIPAA, or compliance **body copy** was rewritten. Privacy Policy and Terms of Service visible legal text is unchanged aside from non-rendered source comment and supplementary head metadata shared with other pages.

## 17. Confirmation: no production action

No publish or production deployment was performed as part of this task.

## 18. Additional attribution opportunities identified by project review

| Location | Implemented? | Method | Why appropriate | Visibility | Considerations | Text / value |
| --- | --- | --- | --- | --- | --- | --- |
| `deploy/cloudfront-seo.md` humans.txt Content-Type note | Yes | Documentation | Matches existing robots/llms notes; does not change live CDN | Project | Applying the header in CloudFront still needs ops approval | `Content-Type: text/plain; charset=utf-8` for `/humans.txt` |
| `link rel="author"` to `humans.txt` | Yes | HTML metadata convention | humans.txt standard | Document source | Does not replace RSM `meta name="author"` | `href="humans.txt"` |
| `llms.txt` | No | Would list the credits URL for AI crawlers | Could look like SEO/content promotion of personal credit | Public | Left unused | n/a |
| `site.webmanifest` | No | Web app manifest has no standard technical-creator field that would not confuse publisher identity | Avoid ownership confusion | Public | Left unused | n/a |

## 19. Requires Explicit Approval

- Host rewrite so an unlisted path (no `.html`) serves `unlisted page`.
- Adding `unlisted page` or `humans.txt` to `sitemap.xml` / `sitemap_index.xml`.
- Adding the credits URL to `llms.txt`.
- JSON-LD `Person` as `contributor` on the credits page or any other page.
- PDF Author/Creator XMP for specific Document Center files after per-file authorship verification.
- Visible production credit inside PDF/source documents, including clinical, legal, billing, TRF, or privacy PDFs.
- Populating a public or admin `technicalCreator` field per Document Center file.
- Changing live CloudFront/Netlify/Vercel/Firebase project descriptions, security.txt contact, or analytics account names.
- Creating `CHANGELOG.md` / `README.md` if stakeholders want a public project readme beyond `TECHNICAL_CREDITS.md`.
- Any later production deploy of this working tree.

## 20. Human review checklist before any deployment

- [ ] Confirm `meta name="author"` is still `RSM Diagnostics Lab` on all pages.
- [ ] Confirm footer copyright still reads RSM Diagnostics Lab only.
- [ ] Confirm header/footer navigation on Home, tests, Document Center, and Request a Kit do not include Technical Credits.
- [ ] Open `unlisted path` and confirm the canonical statement and `mailto:l.jcooke@icloud.com`.
- [ ] Open `/humans.txt` and confirm plain-text credits.
- [ ] Confirm Request a Kit Google Forms still load and submit as before.
- [ ] Confirm Document Center filters, preview, and downloads still work.
- [ ] Confirm Privacy Policy and Terms visible text unchanged.
- [ ] Confirm sitemap / `robots.txt` / `llms.txt` still parse and do not list the credits URL (source comments only).
- [ ] Authorize deploy separately; this report does not authorize it.

## 21. Project attribution coverage

Inventory date: 2026-08-14. Scope: every file on disk under the website project directory. Exact credited statement (wording unchanged; wrappers only): `Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/`

| Project path | File type | Supports comments | Custom and eligible | Attribution inserted | Comment syntax | Exclusion reason | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `.DS_Store` | macOS Finder metadata | No | No | No | n/a | Binary / not applicable | n/a |
| `.htaccess` | Apache / LiteSpeed config | Yes | Yes | Yes | `# …` (inside existing header) | n/a | Comment-only; `apachectl` present, no isolated vhost test |
| `.well-known/security.txt` | security.txt (RFC 9116) | Yes | Yes | Yes | `# …` | n/a | Comment-only; required fields preserved |
| `404.html` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `TECHNICAL_ATTRIBUTION_IMPLEMENTATION_REPORT.md` | Markdown | Yes | Yes | Yes | `<!-- … -->` | n/a | n/a (documentation) |
| `TECHNICAL_CREDITS.md` | Markdown | Yes | Yes | Yes | `<!-- … -->` | n/a | n/a (documentation) |
| `_headers` | Netlify / Cloudflare Pages headers | Yes | Yes | Yes | `# …` (inside existing header) | n/a | Comment-only; path blocks unchanged |
| `_redirects` | Netlify / Cloudflare Pages redirects | Yes | Yes | Yes | `# …` (inside existing header) | n/a | Comment-only; redirect rules unchanged |
| `amplify-redirects.json` | JSON (Amplify redirects) | No | No | No | n/a | File-format limitation (strict JSON; comments would invalidate parse) | `json.loads` passed |
| `assets/EGHA_logo-900.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/EGHA_logo.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/Kolims_LOGO-216.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/Kolims_LOGO_Transparent.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/RSM_LOGO-320.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/RSM_LOGO-UPSCALED-NOBG.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/Total_GI_logo-900.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/Total_GI_logo.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/Upper_Respiratory_Microscreen_Logo-400.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/Upper_Respiratory_Microscreen_Logo.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/apple-touch-icon.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/favicon-16x16.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/favicon-32x32.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/favicon.ico` | ICO image | No | No | No | n/a | Binary image | n/a |
| `assets/fonts/montserrat-400.woff2` | WOFF2 font | No | No | No | n/a | Third-party font binary | n/a |
| `assets/fonts/montserrat-500.woff2` | WOFF2 font | No | No | No | n/a | Third-party font binary | n/a |
| `assets/fonts/montserrat-600.woff2` | WOFF2 font | No | No | No | n/a | Third-party font binary | n/a |
| `assets/fonts/montserrat-700.woff2` | WOFF2 font | No | No | No | n/a | Third-party font binary | n/a |
| `assets/fonts/montserrat-800.woff2` | WOFF2 font | No | No | No | n/a | Third-party font binary | n/a |
| `assets/icon-192.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/icon-512.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `assets/og-card.png` | PNG image | No | No | No | n/a | Binary image | n/a |
| `customHttp.yml` | YAML (Amplify custom headers) | Yes | Yes | Yes | `# …` (inside existing header) | n/a | PyYAML parse passed |
| `deploy/cloudfront-seo.md` | Markdown | Yes | Yes | Yes | `# …` (inside existing header) | n/a | n/a (documentation) |
| `deploy/nginx.conf` | Nginx config | Yes | Yes | Yes | `# …` (inside existing header) | n/a | Comment-only; `nginx` binary not installed |
| `document-center.html` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `firebase.json` | JSON (Firebase hosting) | No | No | No | n/a | File-format limitation (strict JSON) | `json.loads` passed |
| `gastrointestinal-tests.html` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `humans.txt` | humans.txt | Yes | Yes | Yes | `/* … */` (matches existing file convention) | n/a | Existing TEAM/SITE blocks preserved |
| `index.html` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `llms.txt` | Markdown-style TXT | Yes | Yes | Yes | `<!-- … -->` | n/a | Heading structure preserved |
| `nasal-throat-tests.html` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `netlify.toml` | TOML | Yes | Yes | Yes | `# …` (inside existing header) | n/a | `tomllib` parse passed |
| `privacy-policy.html` | HTML (legal page source) | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Non-rendered comment only; legal body unchanged |
| `request-kit.html` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `resources/.DS_Store` | macOS Finder metadata | No | No | No | n/a | Binary / not applicable | n/a |
| `resources/A_(Descriptive-Summaries)/.DS_Store` | macOS Finder metadata | No | No | No | n/a | Binary / not applicable | n/a |
| `resources/A_(Descriptive-Summaries)/A0_RSM_Total_GI_Test_Summary.pdf` | PDF | No | No | No | n/a | Binary; clinical/lab document; no source comments | n/a |
| `resources/A_(Descriptive-Summaries)/A1_Upper-Respiratory-Microscreen_2026_Summary.pdf` | PDF | No | No | No | n/a | Binary; clinical/lab document; no source comments | n/a |
| `resources/A_(Descriptive-Summaries)/A2_rsm_intestinal_elisa_markers_quick_guide_v4.pdf` | PDF | No | No | No | n/a | Binary; clinical/lab document; no source comments | n/a |
| `resources/B_(Marketing-Material)/.DS_Store` | macOS Finder metadata | No | No | No | n/a | Binary / not applicable | n/a |
| `resources/B_(Marketing-Material)/B0_TGI_Comparison_Table-PATIENT-FACING.pdf` | PDF | No | No | No | n/a | Binary; patient-facing document; no source comments | n/a |
| `resources/B_(Marketing-Material)/B1_TGI_Comparison_Table-PROVIDER-FACING.pdf` | PDF | No | No | No | n/a | Binary; no source comments | n/a |
| `resources/B_(Marketing-Material)/B2_rsm_total_gi_vs_egha_provider_handout.pdf` | PDF | No | No | No | n/a | Binary; no source comments | n/a |
| `resources/B_(Marketing-Material)/B3_RSM_UpperRespi_MicroScreen_Brochure_2026.pdf` | PDF | No | No | No | n/a | Binary; no source comments | n/a |
| `resources/B_(Marketing-Material)/B4_Alpha-Hero-Holo-Myco.pdf` | PDF | No | No | No | n/a | Binary; no source comments | n/a |
| `resources/C_(References&Samples)/.DS_Store` | macOS Finder metadata | No | No | No | n/a | Binary / not applicable | n/a |
| `resources/C_(References&Samples)/C0_TGI_Sample-Report.pdf` | PDF | No | No | No | n/a | Binary; clinical sample report; no source comments | n/a |
| `resources/C_(References&Samples)/C1_EGHA _Sample-Report.pdf` | PDF | No | No | No | n/a | Binary; clinical sample report; no source comments | n/a |
| `resources/C_(References&Samples)/C2_Throat_Sample-Report.pdf` | PDF | No | No | No | n/a | Binary; clinical sample report; no source comments | n/a |
| `resources/C_(References&Samples)/C3_Stool_Collection_Instructions_Final-2-26.pdf` | PDF | No | No | No | n/a | Binary; patient collection instructions; no source comments | n/a |
| `resources/C_(References&Samples)/C4_Respiratory_Collection_Instructions-4-30-26.pdf` | PDF | No | No | No | n/a | Binary; patient collection instructions; no source comments | n/a |
| `resources/C_(References&Samples)/C5_TRF-Clinic_Billing.pdf` | PDF | No | No | No | n/a | Binary; billing/TRF; no source comments | n/a |
| `resources/C_(References&Samples)/C6_TRF-Direct_Patient_Billing.pdf` | PDF | No | No | No | n/a | Binary; billing/TRF; no source comments | n/a |
| `resources/E_(Videos)/E0_KOLIMS_WALKTHROUGH_BILL-CLINIC_CUT&CROPPED.mp4` | MP4 video | No | No | No | n/a | Binary media | n/a |
| `resources/E_(Videos)/E1_KOLIMS_WALKTHROUGH_BILL-PATIENT_CUT&CROPPED.mp4` | MP4 video | No | No | No | n/a | Binary media | n/a |
| `resources/F_(Forms)/.DS_Store` | macOS Finder metadata | No | No | No | n/a | Binary / not applicable | n/a |
| `resources/F_(Forms)/F0_RSM—Account_Requisition_Form.pdf` | PDF | No | No | No | n/a | Binary form; no source comments | n/a |
| `resources/F_(Forms)/F1_RSM—Bulk_Shipment_Request_Form.pdf` | PDF | No | No | No | n/a | Binary form; no source comments | n/a |
| `resources/F_(Forms)/F2__RSM—Patient_Direct_Drop_Shipment_Request_Form.pdf` | PDF | No | No | No | n/a | Binary form; no source comments | n/a |
| `robots.txt` | robots.txt | Yes | Yes | Yes | `# …` | n/a | Comment-only; directives unchanged |
| `script.js` | JavaScript | Yes | Yes | Yes | `/* … */` | n/a | `node --check` passed |
| `site.webmanifest` | JSON (Web App Manifest) | No | No | No | n/a | File-format limitation (strict JSON) | `json.loads` passed |
| `sitemap-images.xml` | XML sitemap | Yes | Yes | Yes | `<!-- … -->` after XML declaration | n/a | `xml.etree` parse passed |
| `sitemap.xml` | XML sitemap | Yes | Yes | Yes | `<!-- … -->` after XML declaration | n/a | `xml.etree` parse passed |
| `sitemap_index.xml` | XML sitemap index | Yes | Yes | Yes | `<!-- … -->` after XML declaration | n/a | `xml.etree` parse passed |
| `staticwebapp.config.json` | JSON (Azure Static Web Apps) | No | No | No | n/a | File-format limitation (strict JSON) | `json.loads` passed |
| `styles.css` | CSS | Yes | Yes | Yes | `/* … */` | n/a | Comment-only |
| `unlisted page` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `unlisted page` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |
| `terms-of-service.html` | HTML (legal page source) | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Non-rendered comment only; legal body unchanged |
| `vercel.json` | JSON (Vercel) | No | No | No | n/a | File-format limitation (strict JSON) | `json.loads` passed |
| `web.config` | XML (IIS) | Yes | Yes | Yes | `<!-- … -->` inside existing header after XML declaration | n/a | `xml.etree` parse passed |
| `why-rsm.html` | HTML | Yes | Yes | Yes | `<!-- … -->` after `<!doctype html>` | n/a | Doctype preserved |

### Coverage totals

| Metric | Count |
| --- | --- |
| Total project files reviewed | 86 |
| Total editable text-based files reviewed | 36 |
| Total comment-capable files | 30 |
| Total eligible files credited | 30 |
| Total files excluded by file-format limitations | 6 |
| Total files excluded because they are generated, third-party, sensitive, binary, or not applicable | 50 |
| Files requiring explicit approval before attribution is added | 0 for native source comments on remaining files |

### Format-limitation exclusions (no alternate attribution mechanism)

- `amplify-redirects.json`
- `firebase.json`
- `site.webmanifest`
- `staticwebapp.config.json`
- `vercel.json`

### Binary / third-party / not-applicable exclusions

- 7× `.DS_Store`
- 17× raster images under `assets/` (PNG/ICO)
- 5× third-party Montserrat `.woff2` fonts
- 19× PDF binaries under `resources/` (including clinical, patient-facing, billing/TRF, and form PDFs)
- 2× MP4 videos under `resources/E_(Videos)/`

No `.env`, key, certificate, or credential files were present. No `package.json`, lockfile, vendor directory, minified bundle, source map, or generated build output was present. No SQL, GraphQL, Docker, Makefile, or application backend files were present.

### Files requiring explicit approval

No remaining on-disk file is eligible for a native source comment that was skipped pending approval. PDF Author/XMP, JSON-LD Person nodes, and live host project descriptions remain listed in section 19 and were not performed.

