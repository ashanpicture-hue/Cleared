# Images Findings

## Current Image Inventory

| Page | Images | Type | Purpose |
|------|--------|------|---------|
| All pages | Logo (inline SVG) | Vector | Brand identity |
| All pages | Favicon (SVG) | Vector | Browser tab |
| Homepage | Hero canvas (Three.js) | WebGL/Canvas | Animated 3D background |
| Homepage | Ripple card canvas | Canvas 2D | Kinetic letter demo |
| Sample Report | None | — | Table only |
| Other pages | None | — | Text + tables only |

**Total raster images: 0** — Excellent for performance, but misses visual communication opportunities.

## Image Optimization Status
- **No raster images to optimize** — N/A
- **SVG logo** — Inline, scales perfectly, no HTTP request
- **Favicon** — SVG, minimal
- **Canvas animations** — Client-side rendered, no image assets

## Visual Content Gaps

### Missing Visual Assets (High Impact)

| Asset | Purpose | Priority | Suggested Format |
|-------|---------|----------|------------------|
| **Process flowchart** | Visualize "Send → Check → Review → Pay" | High | SVG (scalable, accessible) |
| **Sample report screenshot** | Show actual PDF output | High | PNG/WebP (1200w) |
| **Dashboard preview (Desk plan)** | Show saved buyers, HS codes, LC terms UI | Medium | PNG/WebP (1200w) |
| **Mobile app/web mockup** | Show signup/verification flow | Medium | PNG/WebP |
| **OG/Twitter Card images** | Social sharing for all 7 pages | High | PNG 1200x630 |
| **Trust badges** | "Human reviewed", "Pay after delivery", "Refund guarantee" | Medium | SVG icons |
| **Payment method icons** | JazzCash, Easypaisa, Raast, Bank logos | Low | SVG |
| **Document type icons** | Invoice, Packing List, B/L, LC | Low | SVG |

### Current Visual Communication
- **Hero**: Three.js animated document cards (abstract, not explanatory)
- **Demo**: Interactive table with mismatch highlighting (strong)
- **Ripple card**: Kinetic letter "C" that settles when mismatches fixed (novel but unclear value)
- **Tables**: Clean, mono-spaced data presentation (good)

## Accessibility Issues

### Logo SVG
```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" aria-hidden="true">
  <path d="M5 12.5l4.5 4.5L19 7.5"/>
</svg>
```
- ❌ `aria-hidden="true"` — screen readers skip entirely
- ❌ No `<title>` or `<desc>` inside SVG
- ❌ No visible text fallback (logo text "Cleared" is separate)

**Fix:** Add `<title>Cleared logo</title>` inside SVG OR remove `aria-hidden` and add `role="img" aria-label="Cleared"`

### Canvas Animations
- Three.js hero canvas: `aria-hidden="true"` (decorative) — appropriate
- Ripple card canvas: `role="img" aria-label="A large letter c that ripples..."` — good

### Color Contrast (Design Tokens)
From `cleared.css`:
- `--ink: #0f2233` on `--bg: #eef2f4` → **12.6:1** ✅ AAA
- `--ink: #0f2233` on `--surface: #fff` → **15.3:1** ✅ AAA
- `--sea: #1b6f8a` on `--bg: #eef2f4` → **4.8:1** ✅ AA (large text), ⚠️ AA (normal text)
- `--flag: #c93a1e` on `--flagbg: #fbe6e0` → **4.2:1** ⚠️ AA (large), fails AA normal
- `--ok: #1d7a4b` on `--okbg: #e1f2e8` → **4.5:1** ✅ AA (large), ⚠️ AA normal

**Dark mode:**
- `--ink: #e8eff3` on `--bg: #0b1721` → **13.2:1** ✅ AAA
- `--sea: #5fb3cf` on `--bg: #0b1721` → **6.1:1** ✅ AA
- `--flag: #ff8a6b` on `--flagbg: #3a1d17` → **5.8:1** ✅ AA

**Verdict:** Mostly compliant. `--flag` on `--flagbg` and `--sea` on light `--bg` need verification for normal text.

## Social Sharing (Open Graph / Twitter Cards)

### Current State: **ZERO OG/Twitter meta tags**

**Missing on all pages:**
```html
<meta property="og:type" content="website">
<meta property="og:url" content="https://cleared.devs.surf/">
<meta property="og:title" content="Cleared: export documents, cross-checked per shipment">
<meta property="og:description" content="Send us your invoice, packing list, bill of lading and LC. We find mismatches and send back a corrected set, checked by a person. First 10 free.">
<meta property="og:image" content="https://cleared.devs.surf/og-home.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@cleared">
```

**Required per page:** Unique `og:title`, `og:description`, `og:url`, `og:image`

## Recommendations

### Phase 1: Critical (Week 1)
1. **Create OG/Twitter Card images** (4-7 images, 1200x630)
   - Homepage: Brand + "First 10 orders free" + hero visual
   - Pricing: Tier cards visual + "Rs 3,000/shipment"
   - Contact: WhatsApp/email icons + "Karachi, Pakistan"
   - Sample Report: Table preview + "See real mismatch report"
   - Legal pages: Shared brand image OK
   - *Tool: Figma, Canva, or code-generated (OG-image generation script)*

2. **Add OG/Twitter meta tags** to all 7 pages

3. **Fix logo SVG accessibility** — add `<title>` or visible fallback

### Phase 2: High Impact (Week 2)
4. **Create process flowchart (SVG)**
   - 4 steps: Send → Check → Review → Pay
   - Icons: WhatsApp/email → Magnifying glass → Person → Checkmark
   - Embed on Homepage "How it works" section
   - Add `alt="4-step process: Send documents via WhatsApp/email, automated field comparison, human review, pay and receive corrected set"`

5. **Create sample report screenshot**
   - Generate actual PDF from sample data
   - Capture 1200w screenshot
   - Embed on Sample Report page + Homepage "What comes back" section

### Phase 3: Nice to Have (Month 1)
6. **Dashboard preview for Desk plan** — screenshot of saved buyers, HS codes, LC terms UI
7. **Trust badge icons (SVG)** — "Human Reviewed", "Pay After Delivery", "Refund Guarantee"
8. **Payment method icons** — JazzCash, Easypaisa, Raast, Bank (SVG)
9. **Document type icons** — Invoice, Packing List, B/L, LC (SVG)

## Image Optimization Checklist (When Assets Added)
- [ ] Use WebP/AVIF with PNG fallback
- [ ] Specify `width`/`height` attributes (prevent CLS)
- [ ] Add descriptive `alt` text (not "image", not filename)
- [ ] Lazy-load below-fold images (`loading="lazy"`)
- [ ] Serve via Vercel edge cache (`Cache-Control: public, max-age=31536000, immutable`)
- [ ] Compress: target <100 KB for 1200w WebP
- [ ] Add to `sitemap.xml` with `<image:image>` tags (optional)

## Design System Integration
New images should use design tokens from `cleared.css`:
- Colors: `--ink`, `--sea`, `--flag`, `--ok`, `--navy`, `--glacier`
- Typography: `--font-sans` (Bricolage Grotesque), `--font-display` (Fraunces)
- Spacing: `--s1`–`--s9`
- Border radius: `--r-sm`–`--r-lg`

## Estimated Asset Sizes
| Asset | Format | Est. Size |
|-------|--------|-----------|
| OG images (7) | WebP 1200x630 | 60-80 KB each |
| Process flowchart | SVG | 5-10 KB |
| Sample report screenshot | WebP 1200w | 80-120 KB |
| Dashboard preview | WebP 1200w | 100-150 KB |
| Trust badges (3) | SVG | 2-3 KB each |
| Payment icons (4) | SVG | 1-2 KB each |
| Document icons (4) | SVG | 1-2 KB each |

**Total new image weight:** ~1-2 MB (acceptable for 7-page site)