# SEO Action Plan: cleared.devs.surf

**Priority Order:** Critical → High → Medium → Low  
**Total Estimated Effort:** ~60 hours for Phases 1-3

---

## Phase 1: Critical Fixes (Week 1) — ~4 hours

| # | Task | Details | Files to Edit | Effort |
|---|------|---------|---------------|--------|
| 1 | **Add meta descriptions** | Unique 150-160 char descriptions for Pricing, Contact, Sample Report, Terms, Privacy, Refund | `public/pricing.html`, `public/contact.html`, `public/sample-report.html`, `public/terms.html`, `public/privacy.html`, `public/refund.html` | 15 min |
| 2 | **Add Service schema** | Define core service: `serviceType: "Export Document Verification"`, `offers` (Per Shipment, Desk, Partners), `areaServed: "PK"`, `provider: Organization` | `public/index.html`, `public/pricing.html` (JSON-LD) | 30 min |
| 3 | **Add FAQPage schema** | 6-8 Q&As on Home (process, pricing, documents, payments, refunds, timeline), 4-5 on Pricing, 3-4 on Contact | `public/index.html`, `public/pricing.html`, `public/contact.html` | 45 min |
| 4 | **Add HowTo schema** | 4 steps: Send → Check → Review → Pay. Include `supply` (documents), `tool` (WhatsApp/email) | `public/index.html` | 20 min |
| 5 | **Move heavy JS to homepage only** | Three.js, GSAP, ScrollTrigger, Tailwind CDN only on `index.html`. Other pages load only `cleared.css` + `api.js` | `public/index.html` (keep), `public/pricing.html`, `public/contact.html`, `public/sample-report.html`, `public/terms.html`, `public/privacy.html`, `public/refund.html` (remove) | 30 min |
| 6 | **Build Tailwind locally** | `npm install -D tailwindcss @tailwindcss/cli`, configure `tailwind.config.js`, build `css/cleared.css` with `@import "tailwindcss"`, remove CDN script | `package.json`, new `tailwind.config.js`, `css/cleared.css`, all HTML files | 1 hr |
| 7 | **Fix CSP for inline scripts** | Option A: Add `'unsafe-inline'` to `script-src` (quick). Option B: Move all inline `<script>` to external `js/app.js` and `js/home.js` (better) | `vercel.json` (CSP header), new `public/js/app.js`, `public/js/home.js` | 1 hr |

---

## Phase 2: High-Impact Improvements (Weeks 2-3) — ~22 hours

| # | Task | Details | Files to Edit | Effort |
|---|------|---------|---------------|--------|
| 8 | **Launch content hub** | Create `/guides/` or `/resources/` section. 5 pillar articles: "Export Documentation Checklist Pakistan", "Letter of Credit Discrepancies Guide", "Bill of Lading Errors & Fixes", "HS Code Classification for Textiles", "Pakistan Customs Clearance Process" | New `public/guides/*.html`, update `public/sitemap.xml`, `public/robots.txt` | 10 hrs |
| 9 | **Expand thin pages** | Contact: add FAQ, office hours, response time. Sample Report: add explanation of each column, download process. Terms/Privacy/Refund: add Pakistan-specific context, SBP regulations, data localization. | `public/contact.html`, `public/sample-report.html`, `public/terms.html`, `public/privacy.html`, `public/refund.html` | 3 hrs |
| 10 | **Add case studies** | 3-5 anonymized: "Textile exporter KHI→EU: 40% fewer LC rejections", "Freight forwarder: 200 shipments/mo, 90% time saved", "SME: first 10 free → Desk plan". Include metrics, logos (with permission). | New `public/case-studies.html` or section on Home/Pricing | 5 hrs |
| 11 | **Add Review/AggregateRating schema** | Markup "Reviewed by A. Rehman" as `Review` with `author: Person`, `reviewRating: 5/5`, `datePublished` | `public/index.html`, `public/sample-report.html` | 20 min |
| 12 | **Add BreadcrumbList schema** | All public pages: Home > Pricing, Home > Contact, etc. | All 7 public HTML files | 30 min |
| 13 | **Create OG/Twitter Card images** | 1200x630 brand image for homepage, pricing, contact, sample report. Include logo, tagline, "First 10 free". | New `public/og-home.png`, `og-pricing.png`, etc. Add `<meta property="og:image">` to each page | 2 hrs |
| 14 | **Add `display=swap` to fonts** | Update Google Fonts URL: `&display=swap` | All 7 public HTML files | 2 min |
| 15 | **Standardize title tags** | Format: "Page Title — Cleared" or "Cleared — Page Title". Add brand to all. | All 7 public HTML files | 10 min |
| 16 | **Add internal links from content** | Homepage pricing section → "See Refund Policy", Signup CTA → "Read Privacy Policy", Contact → "View Sample Report" | `public/index.html`, `public/pricing.html`, `public/contact.html` | 15 min |
| 17 | **Fix heading hierarchy** | Sample Report: add H2 "What the corrected set looks like" before H3 | `public/sample-report.html` | 5 min |
| 18 | **Add security.txt** | `/.well-known/security.txt` with `Contact: mailto:support@cleared.devs.surf`, `Expires: 2027-12-31` | New `public/.well-known/security.txt` | 10 min |

---

## Phase 3: Content & Authority (Month 2) — ~35 hours

| # | Task | Details | Effort |
|---|------|---------|--------|
| 19 | **Publish 10+ blog posts** | Target keywords: "export documents Pakistan", "LC discrepancy types", "bill of lading vs packing list", "HS code finder Pakistan", "customs clearance agent Karachi", "JazzCash international payment", "Raast payment for exporters", "Easypaisa business account", "letter of credit workflow", "documentary collection vs LC" | 20 hrs |
| 20 | **Build topic clusters** | Pillar: "Export Documentation Pakistan" → cluster articles. Pillar: "Letter of Credit Guide" → cluster. Pillar: "Pakistan Customs Compliance" → cluster. Interlink heavily. | 15 hrs |
| 21 | **Add LocalBusiness schema** | Karachi office: `address`, `telephone`, `openingHours`, `areaServed: "PK"`, `serviceType` | 15 min |
| 22 | **Add Speakable schema** | Homepage hero + How it works section for voice/AI assistants | 20 min |
| 23 | **Expand llms.txt** | List all public URLs, key entities (Cleared, A. Rehman, Pakistan, LC, Bill of Lading), primary claims (pricing, free orders, human review) | 30 min |
| 24 | **Backlink outreach** | Targets: Pakistan Customs website, FPCCI, Karachi Chamber of Commerce, freight forwarder associations, trade finance blogs, SBP guidelines pages, LinkedIn groups for exporters | Ongoing |

---

## Phase 4: Monitoring & Iteration (Ongoing)

| # | Task | Tool/Method | Frequency |
|---|------|-------------|-----------|
| 25 | **GSC monitoring** | Indexing, search queries, CTR, position | Weekly |
| 26 | **Core Web Vitals** | PageSpeed Insights, CrUX (when eligible) | Monthly |
| 27 | **Schema validation** | Schema.org validator, Rich Results Test | Per deploy |
| 28 | **Content freshness** | Update for SBP/cUSTOMS regulation changes | Quarterly |
| 29 | **Competitor gap** | Ahrefs/Semrush: vs. local alternatives (if any) | Quarterly |
| 30 | **AI visibility** | Check Perplexity, ChatGPT, Claude for brand mentions | Monthly |

---

## Quick Reference: Files to Modify

### Public HTML (7 pages)
- `public/index.html` — Home (most changes)
- `public/pricing.html`
- `public/contact.html`
- `public/sample-report.html`
- `public/terms.html`
- `public/privacy.html`
- `public/refund.html`

### Config
- `vercel.json` — CSP, headers, rewrites
- `package.json` — Tailwind build script
- `public/robots.txt` — Crawl-delay, sitemap
- `public/sitemap.xml` — Add guide URLs

### New Files Needed
- `tailwind.config.js`
- `public/js/app.js` (shared inline scripts)
- `public/js/home.js` (homepage-only: Three.js, GSAP, demo)
- `public/guides/*.html` (5+ articles)
- `public/case-studies.html` or section
- `public/og-*.png` (4+ images)
- `public/.well-known/security.txt`
- `public/llms.txt` (expand existing)

---

## Success Metrics (3-Month Targets)

| Metric | Current | Target (3mo) |
|--------|---------|--------------|
| **Organic clicks/mo** | ~0 (new) | 500+ |
| **Indexed pages** | 7 | 25+ (guides + blog) |
| **Schema types** | 2 (Org, WebPage) | 7+ (Service, FAQ, HowTo, Review, Breadcrumb, LocalBusiness, Speakable) |
| **Core Web Vitals (LCP)** | ~2.8s | <2.5s |
| **Meta description coverage** | 14% (1/7) | 100% (7/7) |
| **Content word count (avg)** | ~350 | 800+ |
| **Backlinks (referring domains)** | 0 | 10+ |

---

*Generated from seo-audit-1 full audit. Execute Phase 1 immediately for fastest ROI.*