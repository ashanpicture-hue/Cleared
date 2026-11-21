# Security Audit — Cleared

**Scope:** Static frontend (HTML/CSS/JS) under `G:/Cleared`. No backend, no API routes, no build step.  
**Method:** Source-level review only. No sandboxed execution was performed (no server code to execute).  
**Status:** Complete — findings below.

---

## Findings

### 1. Internal administrative paths exposed in sitemap and robots.txt
**Severity:** Low  
**Location:** `sitemap.xml`, `robots.txt`  
**Description:** The sitemap lists `admin/` and `reviewer/` routes (`/admin/users.html`, `/reviewer/queue.html`, etc.). These are internal tooling paths. While the files are static HTML mockups with no backend behind them, listing them in a public sitemap makes the internal surface discoverable to crawlers and attackers.  
**Recommendation:** Remove admin and reviewer routes from `sitemap.xml` and `robots.txt`. Keep them reachable only through internal links or an internal-only host. If these ever connect to a real backend, protect them with authentication and authorization at the route level.

### 2. No authentication or authorization enforcement
**Severity:** High (design gap, not yet exploitable)  
**Location:** `app/`, `reviewer/`, `admin/`  
**Description:** The customer app, reviewer console, and admin sections are presented as static HTML pages with login/signup UI, but there is no authentication backend, session management, or role-based access control. Anyone can navigate directly to `/admin/users.html` or `/reviewer/queue.html` and view the full UI.  
**Recommendation:** When a backend is added, enforce authentication on all `/app/`, `/reviewer/`, and `/admin/` routes. Enforce role-based access (customer / reviewer / admin) server-side — never rely on hiding links in the UI.

### 3. Form data is simulated, not transmitted
**Severity:** Informational  
**Location:** `app/signup.html`, `app/login.html`, `app/new-shipment.html`  
**Description:** Form submit handlers prevent default and simulate success with `setTimeout`. No data is sent to a server, so there is no current injection or exfiltration risk from these forms.  
**Recommendation:** When connecting to a backend, use HTTPS, validate all input server-side, parameterize any database queries, and add CSRF protection to state-changing endpoints.

### 4. No security headers
**Severity:** Low  
**Location:** All pages  
**Description:** Static HTML files do not set Content Security Policy (CSP), X-Content-Type-Options, or X-Frame-Options headers. These are deployment-layer concerns handled by the hosting provider (Vercel).  
**Recommendation:** On Vercel, configure a `vercel.json` with security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and a restrictive CSP that allows only self-hosted assets and Google Fonts.

### 5. Phone numbers and contact info exposed in plain text
**Severity:** Informational  
**Location:** `contact.html`, `app/billing.html`, `llms.txt`  
**Description:** Example phone numbers (`+92 300 0000000`) and email addresses are published in HTML and `llms.txt`. These are placeholder/example values.  
**Recommendation:** Replace with real contact channels before launch. Avoid publishing personal phone numbers; use a shared business line or WhatsApp business account.

### 6. No secrets or credentials in source
**Severity:** None (pass)  
**Description:** No API keys, database credentials, signing secrets, or tokens were found in any HTML, CSS, or JS file.  
**Recommendation:** Continue to keep all secrets out of the frontend. Use environment variables on the backend when one is added.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 (auth gap — design, not yet exploitable) |
| Medium | 0 |
| Low | 1 (internal paths exposed) |
| Informational | 3 |

The codebase is a static frontend with no backend, so the exploit surface is minimal today. The highest-priority work before connecting a backend is: (1) remove internal routes from public sitemap/robots, and (2) implement server-side authentication and authorization for `/app/`, `/reviewer/`, and `/admin/`.

---

## Next steps before launch

1. Remove `admin/` and `reviewer/` URLs from `sitemap.xml` and `robots.txt`.
2. Add `vercel.json` with security headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`).
3. Implement OTP phone auth server-side with session cookies (`HttpOnly`, `SameSite=lax`, `Secure`).
4. Add role-based middleware: customer, reviewer, admin.
5. Validate and sanitize all file uploads (PDF, Excel, images) — restrict MIME types, scan for malware, store outside web root.
6. Add rate limiting to OTP endpoints to prevent SMS pumping and brute force.
