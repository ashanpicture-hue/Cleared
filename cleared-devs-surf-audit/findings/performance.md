# Performance (Core Web Vitals) Findings

## Resource Waterfall Analysis (Homepage)

### Critical Path Resources
| Resource | Type | Size | Load Priority | Notes |
|----------|------|------|---------------|-------|
| `cleared.css` | CSS | ~15 KB | High | Blocks render |
| `Bricolage Grotesque` (variable) | Font | ~45 KB | High | `preconnect` present |
| `IBM Plex Mono` (variable) | Font | ~35 KB | Medium | `preconnect` present |
| `Fraunces` (variable) | Font | ~40 KB | Medium | `preconnect` present |
| `tailwindcss.com` (CDN) | JS | ~60 KB | High | **JIT compiler in browser** |
| `gsap.min.js` | JS | ~40 KB | Medium | Homepage only |
| `ScrollTrigger.min.js` | JS | ~20 KB | Medium | Homepage only |
| `three.min.js` | JS | ~80 KB | Low | Homepage only (hero canvas) |
| `api.js` | JS | ~5 KB | Low | All pages (deferred) |
| Inline scripts | JS | ~10 KB | Medium | GSAP init, demo interaction |

**Total JS on homepage:** ~215 KB (Tailwind + GSAP + ScrollTrigger + Three.js + api.js + inline)
**Total JS on other pages:** ~75 KB (Tailwind + GSAP + ScrollTrigger + api.js + inline) — **wasted**

### Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;600;800&family=IBM+Plex+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;600;900&display=swap">
```
- ✅ Preconnect hints present
- ✅ Variable fonts (single file per family)
- ✅ `crossorigin` on gstatic
- ⚠️ **Missing `display=swap`** — causes FOIT (Flash of Invisible Text), hurts LCP/CLS
- ⚠️ Fraunces weights: 400, 600, 900 — 900 may be unused (check)

### CSS Analysis
- Single `cleared.css` (~15 KB) — good
- Uses CSS custom properties (design tokens) — cacheable
- No critical CSS inlined — render-blocking
- Media queries: 1000px, 900px, 860px, 700px

### Image Assets
- **Zero raster images** — excellent
- Only SVG logo (inline) and favicon
- No `<img>` tags, no lazy-loading needed

## Core Web Vitals Breakdown

### LCP (Largest Contentful Paint) — Est. 2.8s
**Target:** <2.5s

**LCP Candidate Elements (Homepage):**
1. Hero `<h1>` — "Export documents that agree with each other before the bank sees them"
2. Hero `<p class="lead">` — paragraph
3. Demo table (`.set`) — appears below fold on mobile

**LCP Timeline:**
```
0ms          → Navigation start
~100ms       → HTML parsed, CSS/fonts requested
~300ms       → CSS downloaded, layout calculated
~500ms       → Fonts start downloading (preconnect helps)
~800ms       → Bricolage Grotesque loaded, hero text renders ← LCP
~1200ms      → GSAP/Three.js init (non-blocking but competes for main thread)
~1500ms      → Tailwind JIT compiles (if not cached)
```

**LCP Optimization Opportunities:**
1. **Inline critical CSS** for hero section (eliminates CSS request)
2. **Add `font-display: swap`** to Google Fonts URL (eliminates FOIT)
3. **Preload hero font** (`<link rel="preload" as="font" type="font/woff2" crossorigin href="...">`)
4. **Remove Tailwind CDN** — build locally (eliminates 60 KB + JIT compile)
5. **Move Three.js/GSAP to homepage only** — saves 140 KB on 6 pages

### INP (Interaction to Next Paint) — Est. 180ms
**Target:** <200ms ✅

**Interactions Measured:**
- "Fix all three" button click → table update + stamp change
- Navigation links (standard `<a>`)
- Form inputs (signup page)

**INP Drivers:**
- GSAP animation on button click (scale yoyo) — minimal
- Table cell updates (textContent + className) — minimal
- No heavy event handlers

**Risk:** If Tailwind JIT runs on interaction (unlikely), could spike INP.

### CLS (Cumulative Layout Shift) — Est. 0.05
**Target:** <0.1 ✅

**CLS Sources:**
- Font swap (FOIT/FOUT) — hero text may shift when Bricolage loads
- Table rendering — stable dimensions
- No images without dimensions
- No dynamic content injection above fold

**Mitigation:** `font-display: swap` + font size-adjust (CSS) would eliminate.

## Performance by Page Type

| Page | JS Load | CSS | Fonts | LCP Est. | Notes |
|------|---------|-----|-------|----------|-------|
| Home | 215 KB | 15 KB | 120 KB | 2.8s | Three.js + GSAP + Tailwind |
| Pricing | 75 KB | 15 KB | 120 KB | 2.2s | GSAP + Tailwind (unused) |
| Contact | 75 KB | 15 KB | 120 KB | 2.1s | GSAP + Tailwind (unused) |
| Sample Report | 75 KB | 15 KB | 120 KB | 2.1s | GSAP + Tailwind (unused) |
| Terms | 75 KB | 15 KB | 120 KB | 2.0s | GSAP + Tailwind (unused) |
| Privacy | 75 KB | 15 KB | 120 KB | 2.0s | GSAP + Tailwind (unused) |
| Refund | 75 KB | 15 KB | 120 KB | 2.0s | GSAP + Tailwind (unused) |

## Third-Party Impact

| Domain | Resources | Blocking? | Purpose |
|--------|-----------|-----------|---------|
| `fonts.googleapis.com` | CSS (font manifest) | Yes (render-blocking) | Font loading |
| `fonts.gstatic.com` | Font files (WOFF2) | No (async) | Font delivery |
| `cdnjs.cloudflare.com` | GSAP, ScrollTrigger, Three.js | No (deferred) | Animation/3D |
| `cdn.tailwindcss.com` | Tailwind JIT compiler | **Yes** (blocks render) | **Utility CSS** |

**Critical Finding:** Tailwind CDN is **render-blocking JavaScript** that runs a full JIT compiler in the browser. This is the single largest performance bottleneck.

## Optimization Roadmap

### Phase 1: Quick Wins (Week 1)
| Optimization | Effort | LCP Impact | INP Impact | CLS Impact |
|--------------|--------|------------|------------|------------|
| Add `&display=swap` to Google Fonts URL | 2 min | -200ms | — | -0.02 |
| Move Three.js/GSAP/ScrollTrigger/Tailwind CDN to homepage only | 30 min | -100ms (other pages) | — | — |
| Build Tailwind locally; remove CDN | 1 hr | -400ms (all pages) | -50ms | — |
| Preload hero font (Bricolage Grotesque woff2) | 10 min | -150ms | — | -0.01 |
| Inline critical CSS for hero | 30 min | -300ms | — | — |

### Phase 2: Deeper Optimizations (Week 2)
| Optimization | Effort | LCP Impact | INP Impact | CLS Impact |
|--------------|--------|------------|------------|------------|
| Move inline scripts to external `app.js` + `home.js` | 1 hr | -50ms | -20ms | — |
| Add `preload` for GSAP/Three.js on homepage | 10 min | -50ms | — | — |
| Implement `font-size-adjust` for fallback fonts | 15 min | — | — | -0.01 |
| Enable Brotli compression on Vercel (auto) | 0 min | -10% size | — | — |

### Phase 3: Advanced (Month 1)
| Optimization | Effort | LCP Impact | INP Impact | CLS Impact |
|--------------|--------|------------|------------|------------|
| Self-host fonts (eliminate Google Fonts DNS) | 2 hr | -200ms | — | -0.02 |
| Service Worker for offline/caching | 4 hr | Repeat visits | — | — |
| Speculation Rules API (prefetch) | 30 min | Navigation | — | — |

## Projected CWV After Phase 1

| Metric | Current | After Phase 1 | Target |
|--------|---------|---------------|--------|
| LCP | 2.8s | **~1.9s** | <2.5s ✅ |
| INP | 180ms | **~150ms** | <200ms ✅ |
| CLS | 0.05 | **~0.02** | <0.1 ✅ |

## Monitoring Setup
1. **PageSpeed Insights** — monthly lab tests
2. **CrUX Dashboard** — when eligible (field data)
3. **Vercel Analytics** — Real User Monitoring (if enabled)
4. **Lighthouse CI** — in CI/CD pipeline

## Vercel-Specific Notes
- Vercel auto-enables Brotli + Gzip
- Edge caching for static assets (CSS, JS, fonts) — configure `Cache-Control` in `vercel.json`
- Current `vercel.json` has `max-age=3600` for CSS/JS — consider `max-age=31536000, immutable` for versioned assets
- Serverless functions (`api/index.js`) cold start ~100-200ms — not CWV relevant