# Audit Orchestrator — Claude Context

This directory contains the main audit API endpoint that ties all providers together.

## Files

### route.js (POST /api/audit)
- **What it does:** Accepts `{ url, companyName, contactName, email, phone, semrushProjectId }`, runs all providers in parallel via `Promise.allSettled`, maps raw provider data into a unified metric format, stores the result in Vercel KV, appends to Google Sheets, and returns the audit object.
- **Key builder functions** (exported): `buildWebPerfMetrics`, `buildSEOMetrics`, `buildKeywords`, `buildContentMetrics`, `buildSocialMetrics`, `buildAISEOMetrics`, `buildEntityMetrics`, `checkUrl`
- **Timeout:** `maxDuration = 60` (Vercel serverless function limit)
- **Storage:** Results saved to Upstash Redis under key `audit:{id}` (10-char random ID)

### [id]/route.js (GET /api/audit/[id])
- **What it does:** Retrieves a stored audit from Upstash Redis by ID. Supports `?refresh=true` to re-run any providers that were pending/failed on the original run.
- **Imports** builder functions from the parent `route.js`.

## Flow
1. Client submits form → `POST /api/audit`
2. Orchestrator runs providers in parallel
3. Maps results into metric object consumed by `DigitalHealthAssessment.jsx`
4. Stores in KV, returns audit with `id`
5. Client can revisit via `GET /api/audit/[id]` or share the results URL
