# Inbound Digital Visibility & Performance Audit

A comprehensive SEO audit tool built for **Abstrakt Marketing Group's Inbound SDR sales team**. Transforms complex SEO metrics into clear, actionable business intelligence for sales presentations.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo â€” Vercel auto-detects Next.js
4. Click **Deploy**

No environment variables or build config needed. It works out of the box.

## Project Structure

```
inbound-audit-tool/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ globals.css          # Base resets
â”‚   â”œâ”€â”€ layout.js            # Root layout + font imports + metadata
â”‚   â””â”€â”€ page.js              # Home page â†’ renders audit component
â”œâ”€â”€ components/
â”‚   â””â”€â”€ BeaconAudit.jsx      # Main audit component (client-side)
â”œâ”€â”€ public/                  # Static assets (empty for now)
â”œâ”€â”€ package.json             # Next.js 14 + React 18
â”œâ”€â”€ next.config.js           # Next.js config
â”œâ”€â”€ .gitignore
â””â”€â”€ README.md
```

## Audit Areas

| Tab | What It Measures |
|-----|-----------------|
| **Website Performance** | Site health, page speed, mobile optimization, security, image optimization |
| **Search Visibility** | Organic keywords, domain authority, backlinks, indexation, branded traffic |
| **Local Search Performance** | Knowledge Graph, entity signals, NAP consistency, schema markup, reviews |
| **Content Performance** | Content freshness, word count, bounce rate, meta descriptions, readability |
| **Social & AI Visibility** | AI search mentions, structured data, entity recognition, social platform presence |

## Key Features

- **Score Rings** â€” Visual score out of 100 for each audit area (inside Recommendations card)
- **Expandable Metric Rows** â€” Click any metric for Why It Matters, Recommended Fix, Expected Impact, and Difficulty
- **Impact Tags** â€” ðŸ”¥ High Impact, âš¡ Medium Impact, ðŸŸ¢ Foundational prioritization
- **Dynamic Summaries** â€” Advisor-tone recommendations generated from actual metric data
- **Conditional Sell Sheets** â€” Contextual product CTAs that adapt based on audit severity
- **Dark/Light Mode** â€” Full theme support
- **Audit/Form Toggle** â€” Switch between results view and data entry

## Sell Sheet Scenarios

Each product tab dynamically selects messaging based on metric severity:

| Severity | Badge | Tone |
|----------|-------|------|
| ðŸ”´ High Risk | Multiple critical failures | Urgent â€” immediate attention needed |
| ðŸŸ  Moderate | Foundation exists, gaps remain | Encouraging â€” optimization opportunity |
| ðŸŸ¡ Specific Gap | Single key issue | Focused â€” targeted fix |
| Default | Metrics healthy | Growth â€” proactive positioning |

### Tab â†’ Product Mapping

| Tab | Product | Pricing |
|-----|---------|---------|
| Website Performance | Project Website | $6Kâ€“$20K+ |
| Search Visibility | Website & SEO Content | $2,500/mo (12-mo) |
| Local Search | Local Lift | $500/mo |
| Content / Social | Generic CTA | â€” |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, inline styles (zero CSS dependencies)
- **Fonts**: DM Sans + JetBrains Mono (Google Fonts)
- **Deploy**: Vercel (zero-config)

## Status Labels

| Metric Status | Display |
|--------------|---------|
| Good | âœ“ Pass |
| Warning / Poor | âš ï¸ Needs Attention |

## Development Notes

Mock data is embedded in `BeaconAudit.jsx` for demo purposes. To connect live data:

1. Add API routes in `app/api/` for your data sources
2. Replace mock objects (`mockWebPerf`, `mockSEO`, `mockContentPerf`, `mockSocialLocal`, `mockAISEO`, `mockEntity`) with fetched data
3. All metric datasets include expandable fields (`why`, `fix`, `expectedImpact`, `difficulty`)

## License

Proprietary â€” Abstrakt Marketing Group

