# On-Page SEO Findings

## Page-by-Page Analysis

### 1. Homepage (/) — Score: 85/100
**URL:** `https://cleared.devs.surf/`
**Title:** `Cleared: export documents, cross-checked per shipment` ✅
**Meta Description:** Present ✅ (`Cleared compares your invoice, packing list, bill of lading and LC across every shared field and sends back a corrected set, checked by a person. Made for exporters in Pakistan.`)
**H1:** `Export documents that agree with each other before the bank sees them` ✅
**Word Count:** ~1,200 ✅
**Structure:**
- Hero (H1 + lead + CTAs)
- Interactive demo (table)
- Ripple band (kinetic letter)
- Report preview section
- Pricing tiers (H2 + 3 tiers)
- Ecosystem (H2 + 4 cards)
- How it works (H2 + 4 steps)
- Footer

**Issues:**
- No FAQPage schema
- No HowTo schema for 4-step process
- No Service schema
- Three.js/GSAP/Tailwind CDN loaded (performance)
- No OG/Twitter meta tags

---

### 2. Pricing (/pricing.html) — Score: 60/100
**URL:** `https://cleared.devs.surf/pricing.html`
**Title:** `Rs 3,000 a shipment, and your first 10 are free` ✅
**Meta Description:** ❌ **MISSING**
**H1:** `Rs 3,000 a shipment, and your first 10 are free` ✅
**Word Count:** ~450 ⚠️ Thin
**Structure:**
- H1 + sub
- 3 tier cards (Per Shipment, Desk, Partners)
- No comparison table
- No FAQ

**Issues:**
- Missing meta description (High)
- Thin content (expand to 600+ words)
- No comparison matrix
- No FAQPage schema
- No Service schema for offers
- GSAP/Tailwind CDN loaded unnecessarily
- No OG/Twitter meta tags

---

### 3. Contact (/contact.html) — Score: 45/100
**URL:** `https://cleared.devs.surf/contact.html`
**Title:** `Message us on WhatsApp or email` ✅
**Meta Description:** ❌ **MISSING**
**H1:** `Message us on WhatsApp or email` ✅
**Word Count:** ~180 ❌ **Very thin**
**Structure:**
- H1 + sub
- 4 contact method cards (WhatsApp, Email, LinkedIn, Office)
- CTA card (signup + sample report)
- Footer

**Issues:**
- Missing meta description (High)
- Very thin content (expand to 500+ words)
- WhatsApp shows "coming at launch" — placeholder
- No FAQ section
- No FAQPage schema
- No LocalBusiness schema
- GSAP/Tailwind CDN loaded unnecessarily
- No OG/Twitter meta tags

---

### 4. Sample Report (/sample-report.html) — Score: 55/100
**URL:** `https://cleared.devs.surf/sample-report.html`
**Title:** `A mismatch report for a Rotterdam shipment` ✅
**Meta Description:** ❌ **MISSING**
**H1:** `A mismatch report for a Rotterdam shipment` ✅
**Word Count:** ~220 ❌ **Thin**
**Structure:**
- H1 + sub
- Demo table (5 mismatches across 4 docs)
- "What corrected set looks like" card (H3)
- Human review note card (H3)
- **Heading skip: H1 → H3 (no H2)**

**Issues:**
- Missing meta description (High)
- Thin content (expand to 500+ words)
- Heading hierarchy skip (H1→H3)
- No FAQ section
- No Review schema for reviewer note
- GSAP/Tailwind CDN loaded unnecessarily
- No OG/Twitter meta tags

---

### 5. Terms (/terms.html) — Score: 50/100
**URL:** `https://cleared.devs.surf/terms.html`
**Title:** `Terms of Service` ⚠️ No brand
**Meta Description:** ❌ **MISSING**
**H1:** `Terms of Service` ✅
**Word Count:** ~280 ❌ **Thin**
**Structure:**
- H1 + date
- 7 sections (H3 each): What Cleared does, Your responsibility, Payments, Refunds, Data, Termination, Governing law
- **No H2** — flat H3 structure

**Issues:**
- Missing meta description (High)
- Thin content (expand with Pakistan-specific context)
- Title tag lacks brand (`Terms of Service — Cleared`)
- Flat heading structure (add H2 "Terms of Service")
- Missing Organization schema
- GSAP/Tailwind CDN loaded unnecessarily
- No OG/Twitter meta tags

---

### 6. Privacy (/privacy.html) — Score: 50/100
**URL:** `https://cleared.devs.surf/privacy.html`
**Title:** `Privacy Policy` ⚠️ No brand
**Meta Description:** ❌ **MISSING**
**H1:** `Privacy Policy` ✅
**Word Count:** ~250 ❌ **Thin**
**Structure:**
- H1 + date
- 6 sections (H3 each): Information we collect, How we use it, Who sees your data, Storage and security, Your rights, Cookies and analytics
- **No H2**

**Issues:**
- Missing meta description (High)
- Thin content (expand with SBP/FBR references)
- Title tag lacks brand
- Flat heading structure
- Missing Organization schema
- GSAP/Tailwind CDN loaded unnecessarily
- No OG/Twitter meta tags

---

### 7. Refund (/refund.html) — Score: 50/100
**URL:** `https://cleared.devs.surf/refund.html`
**Title:** `Refund Policy` ⚠️ No brand
**Meta Description:** ❌ **MISSING**
**H1:** `Refund Policy` ✅
**Word Count:** ~260 ❌ **Thin**
**Structure:**
- H1 + date
- 5 sections (H3 each): Pay-after-delivery promise, What qualifies, How to request, What not covered, Free orders
- **No H2**

**Issues:**
- Missing meta description (High)
- Thin content (expand)
- Title tag lacks brand
- Flat heading structure
- Missing Organization schema
- GSAP/Tailwind CDN loaded unnecessarily
- No OG/Twitter meta tags

---

## Cross-Page Issues

### Meta Descriptions — **6 of 7 MISSING**
| Page | Status | Recommended |
|------|--------|-------------|
| Home | ✅ Present | Keep |
| Pricing | ❌ Missing | "Compare Cleared's export document verification plans: Per Shipment from Rs 3,000 (first 10 free), Desk at Rs 35,000/mo, Partners API. Pay after delivery via bank transfer, JazzCash, Easypaisa, Raast." |
| Contact | ❌ Missing | "Contact Cleared via WhatsApp (+92 300 0000000), email (support@cleared.devs.surf), or visit our Karachi office. Export document verification for Pakistani exporters." |
| Sample Report | ❌ Missing | "View a real mismatch report example: 5 discrepancies found across invoice, packing list, bill of lading, and LC terms for a Rotterdam shipment. Human-reviewed by documentation officer." |
| Terms | ❌ Missing | "Cleared Terms of Service: export document verification for Pakistani exporters. Pay after delivery, human review on every report, refund guarantee. Governed by Pakistan law." |
| Privacy | ❌ Missing | "Cleared Privacy Policy: how we collect, use, and protect your export documents and data. Encrypted storage, audit trail, deletion rights. No tracking cookies." |
| Refund | ❌ Missing | "Cleared Refund Policy: pay after your mismatch report arrives. Full refund if corrected set fails our checklist. Free orders excluded. Bank transfer, JazzCash, Easypaisa, Raast." |

### Title Tag Standardization
**Current:**
- Home: `Cleared: export documents, cross-checked per shipment`
- Pricing: `Rs 3,000 a shipment, and your first 10 are free`
- Contact: `Message us on WhatsApp or email`
- Sample Report: `A mismatch report for a Rotterdam shipment`
- Terms: `Terms of Service`
- Privacy: `Privacy Policy`
- Refund: `Refund Policy`

**Recommended Format:** `Page Title — Cleared`
- Home: `Cleared: Export Document Verification for Pakistani Exporters`
- Pricing: `Pricing — Cleared`
- Contact: `Contact — Cleared`
- Sample Report: `Sample Mismatch Report — Cleared`
- Terms: `Terms of Service — Cleared`
- Privacy: `Privacy Policy — Cleared`
- Refund: `Refund Policy — Cleared`

### Heading Hierarchy Issues
| Page | Issue | Fix |
|------|-------|-----|
| Sample Report | H1 → H3 (no H2) | Add H2 "Sample Mismatch Report" before table |
| Terms | Flat H3s | Wrap in H2 "Terms of Service" |
| Privacy | Flat H3s | Wrap in H2 "Privacy Policy" |
| Refund | Flat H3s | Wrap in H2 "Refund Policy" |

### Internal Linking Gaps
**Current:** Footer navigation only (site-wide)
**Missing Contextual Links:**
- Homepage pricing section → "See Refund Policy" (`/refund.html`)
- Homepage CTA → "Read Privacy Policy" (`/privacy.html`)
- Pricing page → "View Sample Report" (`/sample-report.html`)
- Contact page → "See Pricing" (`/pricing.html`)
- Sample Report → "Start Your First Shipment" (`/app/signup.html`)

### Schema Markup Gaps (Per Page)
| Page | Current | Missing |
|------|---------|---------|
| Home | Org, WebPage | Service, FAQPage, HowTo, Review, BreadcrumbList, Speakable |
| Pricing | Org, WebPage | Service (offers), FAQPage, BreadcrumbList |
| Contact | Org, WebPage | FAQPage, LocalBusiness, BreadcrumbList |
| Sample Report | Org, WebPage | Review, BreadcrumbList |
| Terms | WebPage only | Organization, BreadcrumbList |
| Privacy | WebPage only | Organization, BreadcrumbList |
| Refund | WebPage only | Organization, BreadcrumbList |

### Content Depth by Page
| Page | Current Words | Target | Gap |
|------|---------------|--------|-----|
| Home | 1,200 | 1,200+ | ✅ |
| Pricing | 450 | 600+ | +150 |
| Contact | 180 | 500+ | +320 |
| Sample Report | 220 | 500+ | +280 |
| Terms | 280 | 500+ | +220 |
| Privacy | 250 | 500+ | +250 |
| Refund | 260 | 500+ | +240 |

**Total content gap:** ~1,460 words across 6 pages

### Technical On-Page Issues
1. **GSAP/Tailwind/Three.js loaded on all pages** — only needed on home
2. **No OG/Twitter meta tags** on any page
3. **No `lastmod` in sitemap.xml**
4. **CSP blocks inline scripts** (GSAP init, demo interaction)
5. **Font `display=swap` missing** — causes FOIT
6. **No `security.txt`**

### Quick Wins Checklist (All < 30 min each)
- [ ] Add meta descriptions to 6 pages
- [ ] Standardize title tags with brand suffix
- [ ] Fix heading hierarchy on 4 pages
- [ ] Add contextual internal links (6-8 links)
- [ ] Add `display=swap` to Google Fonts URL
- [ ] Move heavy JS to homepage only
- [ ] Add OG/Twitter meta tags (template + 4 images)
- [ ] Add `lastmod` to sitemap.xml
- [ ] Add Organization schema to Terms/Privacy/Refund
- [ ] Add BreadcrumbList schema to all pages