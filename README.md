# Inbound Digital Visibility & Performance Audit

## Overview
Sales enablement tool for Abstrakt Marketing Group's Inbound SDR team. Runs a real-time audit of any website using Google PageSpeed, SEMrush, Google Places, and custom HTML crawling.

## Features
- **Form-first flow**: Prospect fills in company info → audit runs → results display
- **4 API providers**: PageSpeed Insights, SEMrush, Google Places, custom crawl
- **5 audit areas**: Website Performance, Search Visibility, Local Search, Content, Social & AI
- **Dynamic sell sheets**: Contextual CTAs for Project Website, SEO Content, and Local Lift
- **Light/dark mode**

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variables
Create a `.env.local` file:
```
GOOGLE_API_KEY=your_google_api_key
SEMRUSH_API_KEY=your_semrush_api_key
```

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
Push to GitHub → connect to Vercel → add env variables in Vercel dashboard.

## API Coverage

| Source | Metrics | Cost |
|--------|---------|------|
| Google PageSpeed | Speed, mobile, CWV, images, SSL | Free |
| Custom Crawl | Alt tags, meta, schema, OG, HTTP/2 | Free |
| SEMrush | DA, keywords, backlinks, traffic | ~$120/mo |
| Google Places | GBP, reviews, rating, NAP | Free tier |

Metrics not covered by APIs show an "Estimated" badge.

## File Structure
```
app/
  page.js                    # Form → Loading → Results
  layout.js                  # Root layout + fonts
  api/audit/route.js         # Orchestration endpoint
  api/providers/
    pagespeed.js             # Google PageSpeed Insights
    crawl.js                 # Custom HTML analysis
    semrush.js               # SEMrush API
    places.js                # Google Places API
components/
  BeaconAudit.jsx            # Results display (1700 lines)
  AuditForm.jsx              # Intake form
  AuditLoading.jsx           # Loading animation
```
