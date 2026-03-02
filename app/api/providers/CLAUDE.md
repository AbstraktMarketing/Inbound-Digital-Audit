# Providers — Claude Context

Each file in this directory is a standalone data provider module. They are called in parallel by the audit orchestrator (`app/api/audit/route.js`).

## Provider Files

### crawl.js
- **Export:** `fetchCrawlData(url)`
- **What it does:** Fetches the target URL directly and parses the raw HTML to extract on-page signals — meta tags, headings, schema markup, social links, blog freshness, SSL status, and more.
- **External API:** None (direct HTTP fetch)

### pagespeed.js
- **Export:** `fetchPageSpeed(url)`
- **What it does:** Calls Google PageSpeed Insights API v5 for both mobile and desktop. Returns Lighthouse scores (performance, accessibility, best practices, SEO) and Core Web Vitals (LCP, FID, CLS, TTFB).
- **External API:** Google PageSpeed Insights v5
- **Env var:** `GOOGLE_PSI_API_KEY` (optional — works without key at lower quota)

### semrush.js
- **Exports:** `fetchSemrush(domain)`, `fetchSiteAudit(projectId)`
- **What it does:** Fetches domain authority, backlink overview, top organic keywords, and competitor domains. `fetchSiteAudit` pulls health score from a SEMrush project.
- **External API:** SEMrush API
- **Env var:** `SEMRUSH_API_KEY` (required)

### places.js
- **Export:** `fetchPlacesData(companyName, url)`
- **What it does:** Searches Google Places for the business by name, then fetches full Place Details (rating, reviews, hours, photos, etc.).
- **External API:** Google Places Text Search + Place Details
- **Env var:** `GOOGLE_API_KEY` (required)

### sheets.js
- **Export:** `appendAuditToSheet(audit)`
- **What it does:** Appends a row of audit summary data to a Google Sheet for logging. Uses service account JWT auth (no npm deps).
- **External API:** Google Sheets API v4
- **Env vars:** `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`

### utils.js
- **Exports:** `USER_AGENT`, `cleanDomain(input)`
- **What it does:** Shared utilities used across providers. `cleanDomain` strips protocol, path, and www prefix from URLs. `USER_AGENT` is the crawler identity string.

## Patterns
- Shared utilities (domain cleaning, user-agent) are imported from `utils.js`.
- All providers use `Promise.allSettled` internally when making parallel sub-requests.
- Providers throw on fatal errors; the orchestrator catches via `Promise.allSettled`.
- Timeouts are enforced via `AbortSignal.timeout()`.
