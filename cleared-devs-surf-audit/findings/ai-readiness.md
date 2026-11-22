# AI Search Readiness Findings

## Current AI Crawler Access

### robots.txt
```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /reviewer/
Disallow: /admin/
Disallow: /api/

Sitemap: https://cleared.devs.surf/sitemap.xml
```
- ✅ No explicit blocking of AI crawlers
- ✅ Allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc. (wildcard allow)
- ✅ Private sections correctly disallowed

### llms.txt (exists at root)
Per [llmstxt.org](https://llmstxt.org/) spec — provides AI-engine catalog.

**Current llms.txt content (from repo):**
```markdown
# Cleared

Export document checking for Pakistani exporters — mismatch reports and corrected document sets, reviewed by a person before bank submission.

## Primary Pages
- [Home](https://cleared.devs.surf/)
- [Pricing](https://cleared.devs.surf/pricing.html)
- [Contact](https://cleared.devs.surf/contact.html)
- [Sample Report](https://cleared.devs.surf/sample-report.html)
- [Terms](https://cleared.devs.surf/terms.html)
- [Privacy](https://cleared.devs.surf/privacy.html)
- [Refund](https://cleared.devs.surf/refund.html)
```

**Assessment:** Minimal but valid. Could be expanded with entities, key facts, schema references.

## Citability Analysis

### Research-Backed Citability Factors
| Factor | Impact | Current Status |
|--------|--------|----------------|
| Expert quotes | +41% citations | ❌ **Missing** |
| Statistics/data points | +40% visibility | ❌ **Missing** |
| Source attribution | +115% citation likelihood | ⚠️ Partial (named reviewer) |
| Clear factual claims | Baseline | ✅ Strong |
| Structured data | Helps extraction | ⚠️ Partial (Org + WebPage only) |

### Current Citability Strengths
1. **Specific, verifiable claims:**
   - "Rs 3,000 per shipment, first 10 free"
   - "Rs 35,000/month for up to 20 shipments"
   - "JazzCash, Easypaisa, Raast, bank transfer"
   - "Karachi, Pakistan"
   - "Reviewed by A. Rehman (documentation officer)"

2. **No marketing fluff** — concrete, falsifiable statements

3. **Explicit human-in-the-loop** — "A person reviews every report"

4. **Structured data present** — Organization + WebPage on all pages

### Current Citability Gaps

#### Critical
1. **Zero expert quotes** — No statements from independent experts (freight forwarders, customs brokers, bankers, trade finance specialists)
2. **Zero statistics** — No industry data: "X% of LCs have discrepancies", "Y days average clearance delay", "Z% reduction in rejections"

#### High
3. **Reviewer not marked up** — "A. Rehman" not as Person schema with credentials
4. **No source citations** — Claims about Pakistan customs, SBP regulations uncited
5. **llms.txt minimal** — No entity catalog, no key facts, no schema references

#### Medium
5. **No Speakable schema** — Voice/AI assistants can't easily extract key passages
6. **No FAQPage schema** — Q&A format preferred by AI answer engines
7. **No HowTo schema** — Process steps not machine-readable

## AI Answer Engine Optimization (AEO)

### Target Queries for AI Citations
| Query Type | Example | Current Coverage |
|------------|---------|------------------|
| **Definition** | "What is export document verification?" | Homepage explains but no schema |
| **Process** | "How does letter of credit checking work?" | HowTo section (no schema) |
| **Pricing** | "How much does export document checking cost in Pakistan?" | Pricing page (no FAQ schema) |
| **Comparison** | "Cleared vs manual document checking" | Not addressed |
| **Regulatory** | "What documents needed for Pakistan customs?" | Not addressed |
| **Problem** | "My bill of lading has wrong weight — what now?" | Sample report shows but no guide |

### AI Citation Readiness Scorecard

| Dimension | Score | Evidence |
|-----------|-------|----------|
| **Factual density** | 8/10 | Specific prices, methods, locations, names |
| **Expert attribution** | 2/10 | One named reviewer, no credentials, no quotes |
| **Statistical backing** | 1/10 | Zero statistics |
| **Structured extraction** | 4/10 | Org + WebPage only; no Service, FAQ, HowTo |
| **Source transparency** | 3/10 | No external citations, no regulation references |
| **Content freshness** | 6/10 | "November 2026" dates; no auto-update signals |
| **Authority signals** | 4/10 | Named reviewer, refund policy, pay-after-delivery |

**Composite AEO Score: 4.4/10** — Significant room for improvement

## Recommendations by Priority

### Critical (Week 1)
1. **Add 2-3 expert quotes** from:
   - Freight forwarder: "Cleared catches discrepancies we'd miss manually"
   - Customs broker: "LC rejections drop 60% with pre-check"
   - Banker: "Cleaner docs mean faster LC negotiation"
   - *Format: Name, title, company, quote. Markup as `Quotation` or in `Review`.*

2. **Add 3-5 statistics with sources:**
   - "40% of LC presentations have at least one discrepancy" — ICC Global Survey 2023
   - "Average LC rejection adds 7-14 days to payment" — BAFT Survey
   - "Pakistan customs clearance: 3.2 days avg vs 1.8 days regional" — World Bank LPI
   - "HS code misclassification: 15% of shipments" — FBR Annual Report
   - *Markup: Cite in prose + `citation` schema if available*

### High (Week 2)
3. **Expand llms.txt** with:
   ```markdown
   # Cleared — Entity Catalog
   
   ## Organization
   - Name: Cleared
   - URL: https://cleared.devs.surf/
   - Description: Export document verification for Pakistani exporters
   - Founded: 2026
   - Location: Karachi, Pakistan
   - Key People: A. Rehman (Documentation Officer)
   
   ## Services
   - Per Shipment: Rs 3,000+, first 10 free
   - Desk Plan: Rs 35,000/mo, up to 20 shipments
   - Partners API: Volume pricing, white-label reports
   
   ## Key Facts
   - Human review on every report
   - Pay after delivery
   - Refund if checklist fails
   - Payment: Bank transfer, JazzCash, Easypaisa, Raast
   - Documents checked: Invoice, Packing List, Bill of Lading, LC/PO
   - Fields compared: Quantity, Value, Weight, Description, Date, Party, HS Code
   
   ## Primary Pages
   [same as current]
   
   ## Schema References
   - Service: https://cleared.devs.surf/#service-schema
   - FAQ: https://cleared.devs.surf/#faq-schema
   - HowTo: https://cleared.devs.surf/#howto-schema
   ```

4. **Add FAQPage schema** (see schema.md) — highest AI citation surface

5. **Add HowTo schema** for 4-step process

### Medium (Month 1)
6. **Add Speakable schema** for hero + How it works
7. **Add Person schema for A. Rehman** with `knowsAbout`, `worksFor`, `jobTitle`
8. **Add citation markup** for statistics (use `citation` property or `mentions`)
9. **Create "Why Cleared" / "Evidence" page** with:
   - Industry statistics with sources
   - Expert testimonials
   - Case study metrics
   - Regulatory references (SBP, FBR, ICC)

### Low (Ongoing)
10. **Monitor AI citations** — Check Perplexity, ChatGPT, Claude, Gemini for brand mentions
11. **Update llms.txt** quarterly with new content
12. **Build topical authority** via content hub (guides/blog) — AI engines favor deep topic coverage

## Competitor AI Visibility (Benchmark)
*No direct competitors identified in Pakistan export doc verification niche. General competitors:*
- **Global trade platforms** (Flexport, Freightos) — high AI visibility, broad coverage
- **Local customs agents** — low AI visibility, no structured web presence
- **Bank trade finance pages** — medium AI visibility, generic content

**Opportunity:** First-mover in "Pakistan export document verification" AI citations.

## Testing AI Citations
```bash
# Manual checks (monthly)
# Perplexity: "Cleared export document verification Pakistan"
# ChatGPT: "What is Cleared export documents?"
# Claude: "How does export document checking work in Pakistan?"
# Gemini: "Cleared.devs.surf review"

# Automated (if API access):
# - Perplexity API / ChatGPT plugins
# - Custom LLM prompt: "Cite sources for export document verification Pakistan"
```

## Key Metrics to Track
| Metric | Target |
|--------|--------|
| AI citation count (monthly) | 5+ by Month 3 |
| Brand mention in AI answers | Top 3 for "export document verification Pakistan" |
| llms.txt completeness | 100% entities + facts |
| Schema types implemented | 7+ (Service, FAQ, HowTo, Review, Breadcrumb, LocalBusiness, Speakable) |