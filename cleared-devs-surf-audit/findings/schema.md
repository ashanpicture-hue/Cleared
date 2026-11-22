# Schema & Structured Data Findings

## Current Implementation Status

### Pages with Schema

| Page | Schemas | Validation |
|------|---------|------------|
| Home | Organization, WebPage | ✅ Valid |
| Pricing | Organization, WebPage | ✅ Valid |
| Contact | Organization, WebPage | ✅ Valid |
| Sample Report | Organization, WebPage | ✅ Valid |
| Terms | WebPage only | ⚠️ Missing Organization |
| Privacy | WebPage only | ⚠️ Missing Organization |
| Refund | WebPage only | ⚠️ Missing Organization |

### Organization Schema (Current)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cleared",
  "url": "https://cleared.devs.surf/",
  "description": "Export document checking for Pakistani exporters — mismatch reports and corrected document sets, reviewed by a person before bank submission.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-300-0000000",
    "contactType": "customer service",
    "availableLanguage": ["en", "ur"]
  },
  "sameAs": ["https://linkedin.com/company/cleared"]
}
```
**Missing from Organization:**
- `logo` (URL to logo image)
- `sameAs` — only LinkedIn; missing Twitter/X, Facebook, Instagram
- `email` in contactPoint
- `areaServed`: "PK"
- `foundingDate`
- `numberOfEmployees`
- `knowsAbout`: ["Export Documentation", "Letter of Credit", "Bill of Lading", "HS Code", "Pakistan Customs"]

### WebPage Schema (Current)
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title — Cleared",
  "url": "https://cleared.devs.surf/page.html",
  "description": "Page description",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Cleared",
    "url": "https://cleared.devs.surf/"
  }
}
```
**Present on all 7 pages** — consistent but minimal.

## Missing Schema Opportunities (Prioritized)

### 1. Service Schema — CRITICAL
**Target:** Home, Pricing
**Why:** Defines the core commercial offering. Enables service-rich results, AI understanding of what you sell.

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Export Document Verification",
  "description": "We compare your commercial invoice, packing list, bill of lading, and LC/PO across every shared field. A person reviews the mismatch report before you submit to the bank.",
  "serviceType": "Export Document Verification",
  "provider": { "@type": "Organization", "name": "Cleared", "url": "https://cleared.devs.surf/" },
  "areaServed": { "@type": "Country", "name": "Pakistan" },
  "offers": [
    {
      "@type": "Offer",
      "name": "Per Shipment",
      "description": "Rs 3,000 and up per shipment. First 10 free.",
      "price": "3000",
      "priceCurrency": "PKR",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Desk Plan",
      "description": "Rs 35,000/month for up to 20 shipments. Saved buyers, products, HS codes, LC terms checking, team seats.",
      "price": "35000",
      "priceCurrency": "PKR",
      "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" },
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Partners API",
      "description": "Volume pricing after pilot. API for document checks, your branding on reports, audit trail.",
      "availability": "https://schema.org/InStock",
      "priceSpecification": { "@type": "PriceSpecification", "priceCurrency": "PKR" }
    }
  ],
  "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Cleared Pricing Plans" }
}
```

### 2. FAQPage Schema — HIGH
**Target:** Home (6-8 Qs), Pricing (4-5 Qs), Contact (3-4 Qs)
**Why:** Highest AI citation surface. Captures "People Also Ask" real estate.

**Homepage FAQ Candidates:**
1. What documents do you check? (Invoice, packing list, B/L, LC/PO)
2. How long does a check take? (Same day / few hours)
3. What payment methods do you accept? (Bank transfer, JazzCash, Easypaisa, Raast)
4. Is my data secure? (Encrypted, audit trail, deletion rights)
5. What if I disagree with a finding? (Human reviewer fixes agent errors)
6. Do you replace my customs agent? (No — second check, not a guarantee)
7. How do the first 10 free orders work? (No card, pay after report arrives)
8. Can you integrate with my freight software? (Partners API — contact us)

### 3. HowTo Schema — HIGH
**Target:** Homepage "How it works" section
**Why:** 4-step process perfect for HowTo rich results.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How Cleared Export Document Verification Works",
  "description": "From document upload to corrected set in 4 steps.",
  "totalTime": "PT1H",
  "estimatedCost": { "@type": "MonetaryAmount", "currency": "PKR", "value": "0" },
  "supply": [
    { "@type": "HowToSupply", "name": "Commercial Invoice" },
    { "@type": "HowToSupply", "name": "Packing List" },
    { "@type": "HowToSupply", "name": "Bill of Lading" },
    { "@type": "HowToSupply", "name": "Letter of Credit or Purchase Order" }
  ],
  "tool": [
    { "@type": "HowToTool", "name": "WhatsApp or Email" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Send Documents",
      "text": "Share your PO/LC and documents via WhatsApp or email. Scans and Excel files accepted.",
      "url": "https://cleared.devs.surf/app/signup.html"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Automated Field Comparison",
      "text": "Our agent compares quantities, values, weights, descriptions, dates, and party details across every document.",
      "url": "https://cleared.devs.surf/#how"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Human Review",
      "text": "A documentation officer reviews the report and corrects any agent errors before you see it.",
      "url": "https://cleared.devs.surf/sample-report.html"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Pay & Receive Corrected Set",
      "text": "You pay after the report arrives. We send the corrected document set ready for bank submission.",
      "url": "https://cleared.devs.surf/pricing.html"
    }
  ]
}
```

### 4. Review / AggregateRating Schema — MEDIUM
**Target:** Homepage (reviewer note), Sample Report
**Why:** "Reviewed by A. Rehman" — markup as expert review.

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "author": {
    "@type": "Person",
    "name": "A. Rehman",
    "jobTitle": "Documentation Officer",
    "worksFor": { "@type": "Organization", "name": "Cleared" }
  },
  "itemReviewed": {
    "@type": "Service",
    "name": "Export Document Verification"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5",
    "worstRating": "1"
  },
  "reviewBody": "Consignee spelling corrected to match LC. Port typo on bill of lading flagged for carrier amendment.",
  "datePublished": "2026-11-15"
}
```

### 5. BreadcrumbList Schema — MEDIUM
**Target:** All pages
**Why:** Site structure clarity for crawlers.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cleared.devs.surf/" },
    { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://cleared.devs.surf/pricing.html" }
  ]
}
```

### 6. LocalBusiness Schema — LOW
**Target:** Contact page
**Why:** Karachi office — service area business (SAB).

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Cleared",
  "description": "Export document verification for Pakistani exporters",
  "url": "https://cleared.devs.surf/",
  "telephone": "+92-300-0000000",
  "email": "support@cleared.devs.surf",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Karachi",
    "addressCountry": "PK"
  },
  "areaServed": { "@type": "Country", "name": "Pakistan" },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" }
  ],
  "priceRange": "Rs 3,000 - Rs 35,000",
  "currenciesAccepted": "PKR",
  "paymentAccepted": "Bank Transfer, JazzCash, Easypaisa, Raast"
}
```

### 7. Speakable Schema — LOW
**Target:** Homepage hero + How it works
**Why:** Voice/AI assistant optimization.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".hero h1", ".hero p.lead", "#how h2", "#how .zero p"]
  }
}
```

### 8. WebSite with SearchAction — LOW
**Target:** Homepage
**Why:** Sitelinks search box in SERP.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://cleared.devs.surf/",
  "name": "Cleared",
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://cleared.devs.surf/search?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

## Implementation Checklist

| Schema | Priority | Pages | Est. Effort |
|--------|----------|-------|-------------|
| Service | Critical | Home, Pricing | 30 min |
| FAQPage | High | Home, Pricing, Contact | 45 min |
| HowTo | High | Home | 20 min |
| Review | Medium | Home, Sample Report | 20 min |
| BreadcrumbList | Medium | All 7 | 30 min |
| LocalBusiness | Low | Contact | 15 min |
| Speakable | Low | Home | 20 min |
| WebSite SearchAction | Low | Home | 10 min |
| Organization (complete) | Medium | All 7 | 20 min |

## Validation Tools
- [Schema.org Validator](https://validator.schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [JSON-LD Playground](https://json-ld.org/playground/)

## Notes
- All schemas should be JSON-LD in `<head>` (current pattern)
- Avoid duplicate schema definitions across pages (Organization on every page is fine)
- Service schema should reference the same Organization entity
- FAQPage content must be visible on page (not hidden)
- HowTo steps should match visible content order