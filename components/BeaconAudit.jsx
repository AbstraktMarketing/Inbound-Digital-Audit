import { useState } from "react";

/* -- Brand Palette -- */
const brand = {
  growthGray: "#333333",
  pipelineRed: "#FF210F",
  creativePink: "#F725A2",
  inboundOrange: "#F46F0A",
  cloudBlue: "#0481A3",
  talentTeal: "#42BFBA",
  lightGray: "#EFEFEF",
  enterpriseMaroon: "#8C082B",
};

const accent = brand.talentTeal;
const accentAlt = brand.cloudBlue;

/* -- Theme tokens -- */
function getTheme(mode) {
  if (mode === "dark") return {
    bg: "#111114", bgGrad: "linear-gradient(180deg, #111114 0%, #0d0d12 50%, #0f1015 100%)",
    cardBg: "rgba(255,255,255,0.035)", cardBorder: "rgba(255,255,255,0.07)",
    subtle: "rgba(239,239,239,0.45)", body: "rgba(239,239,239,0.72)",
    text: "#EFEFEF", inputBg: "rgba(255,255,255,0.025)",
    scrollThumb: "rgba(66,191,186,0.2)", scrollHover: "rgba(66,191,186,0.35)",
    hoverRow: "rgba(66,191,186,0.03)", logoFill: "#EFEFEF",
    toggleBg: "rgba(255,255,255,0.06)", toggleBorder: "rgba(255,255,255,0.1)",
    badgeBg: "rgba(66,191,186,0.08)", badgeBorder: "rgba(66,191,186,0.15)",
    ctaBtnColor: "#fff", statusDot: "#0a0a0a", badgeText: "#EFEFEF", badgeDot: "#EFEFEF",
  };
  return {
    bg: "#f5f5f7", bgGrad: "linear-gradient(180deg, #f5f5f7 0%, #eeeef0 50%, #e8e8ec 100%)",
    cardBg: "rgba(255,255,255,0.85)", cardBorder: "rgba(0,0,0,0.08)",
    subtle: "rgba(51,51,51,0.5)", body: "rgba(51,51,51,0.75)",
    text: "#1a1a1a", inputBg: "rgba(0,0,0,0.03)",
    scrollThumb: "rgba(66,191,186,0.3)", scrollHover: "rgba(66,191,186,0.5)",
    hoverRow: "rgba(66,191,186,0.05)", logoFill: "#333333",
    toggleBg: "rgba(0,0,0,0.04)", toggleBorder: "rgba(0,0,0,0.1)",
    badgeBg: "rgba(255,33,15,0.06)", badgeBorder: "rgba(255,33,15,0.12)",
    ctaBtnColor: "#fff", statusDot: "#fff", badgeText: brand.enterpriseMaroon, badgeDot: brand.enterpriseMaroon,
  };
}

const tabs = [
  "Technical Foundation",
  "Authority & Search",
  "Content & Topical Depth",
  "Entity & Brand Authority",
  "Revenue & Attribution",
];

/* -- Mock Data -- */
const webPerfMetrics = [
  { label: "SEMrush Site Health", value: "68%", status: "poor", detail: "Overall site health score from SEMrush audit (aim for 90%+)", impact: "high", confidence: "measured" },
  { label: "GTMetrix Performance Score", value: "62%", status: "poor", detail: "Overall GTMetrix performance grade (aim for 90%+)" , confidence: "measured" },
  { label: "Mobile Friendly & Responsive", value: "Yes", status: "good", detail: "Passes Google mobile-friendly test and adapts to all screen sizes" , confidence: "measured" },
  { label: "Website Security / SSL Certificate", value: "Valid", status: "good", detail: "Expires in 243 days" , confidence: "measured" },
  { label: "HTTP/2", value: "Enabled", status: "good", detail: "Modern protocol active" , confidence: "measured" },
  { label: "Image Optimization", value: "34% unoptimized", status: "poor", detail: "17 of 50 images need compression" , confidence: "measured" },
  { label: "Alt Tags", value: "58% missing", status: "poor", detail: "31 of 53 images lack descriptive alt text — hurts accessibility and SEO" , confidence: "measured" },
];
function calculateModuleScore(metrics) {
  const statusValue = { good: 100, warning: 50, poor: 0 };
  let totalWeight = 0, totalScore = 0;
  metrics.forEach(metric => {
    const weight = metric.impact === "high" ? 1.5
      : metric.impact === "low" ? 0.75
      : 1;
    totalWeight += weight;
    totalScore += weight * (statusValue[metric.status] ?? 0);
  });
  return Math.round(totalScore / totalWeight);
}
const mockWebPerf = {
  score: calculateModuleScore(webPerfMetrics),
  metrics: webPerfMetrics,
};

const mockSEO = {
  score: 65,
  metrics: [
    { label: "Domain Authority", value: "32/100", status: "warning" , confidence: "measured" },
    { label: "Indexed Pages", value: "156", status: "good" , confidence: "measured" },
    { label: "Backlinks", value: "423", status: "warning" , confidence: "measured" },
    { label: "Page Speed", value: "72/100", status: "warning" , confidence: "measured" },
    { label: "Meta Descriptions", value: "68% optimized", status: "warning" , confidence: "measured" },
    { label: "H1 Tags", value: "All pages have H1", status: "good" , confidence: "measured" },
    { label: "Sitemap", value: "Found", status: "good" , confidence: "measured" },
    { label: "Robots.txt", value: "Configured", status: "good" , confidence: "measured" },
  ],
};

/*
 * Content Performance scoring:
 *   - First 2 metrics (Blog Exists, Recent Publish) are high-impact (1.5x)
 *   - Remaining metrics are standard (1.0x)
 *   - Status values: good = 100, warning = 50, poor = 0
 *   - Score = impact-weighted avg of all metric scores
 */
const contentMetrics = [
  { label: "Blog Page Exists", value: "Yes", status: "good", detail: "A dedicated blog/news page was detected", impact: "high", confidence: "measured" },
  { label: "Content Published (Last 30 Days)", value: "No", status: "poor", detail: "No new content detected in the last 30 days", impact: "high", confidence: "measured" },
  { label: "Avg. Time on Page", value: "1m 42s", status: "warning", detail: "Industry avg is 2m 30s" , confidence: "estimated" },
  { label: "Bounce Rate", value: "64%", status: "poor", detail: "Above the 50% threshold" , confidence: "estimated" },
  { label: "Content Freshness", value: "38 days avg", status: "warning", detail: "Last blog post: 52 days ago" , confidence: "measured" },
  { label: "Readability Score", value: "Grade 11", status: "warning", detail: "Aim for Grade 8 for broader reach" , confidence: "measured" },
  { label: "Word Count (top pages)", value: "~620 avg", status: "poor", detail: "Competitors average 1,400+ words" , confidence: "measured" },
  { label: "Internal Links / Page", value: "2.1 avg", status: "poor", detail: "Best practice is 5-10 per page" , confidence: "measured" },
  { label: "Content-to-Code Ratio", value: "18%", status: "warning", detail: "Aim for 25%+" , confidence: "measured" },
  { label: "Duplicate Content", value: "3 pages flagged", status: "poor", detail: "Near-duplicate meta descriptions" , confidence: "measured" },
];
const mockContentPerf = {
  score: calculateModuleScore(contentMetrics),
  metrics: contentMetrics,
};

const mockSocialLocal = {
  socialScore: 45,
  localScore: 70,
  combinedScore: 55,
  platforms: [
    { name: "Google Business", status: "Claimed", followers: "—", activity: "Last post 12 days ago", health: "warning" },
    { name: "Facebook", status: "Active", followers: "2,340", activity: "3 posts / month", health: "warning" },
    { name: "Instagram", status: "Active", followers: "1,120", activity: "2 posts / month", health: "poor" },
    { name: "LinkedIn", status: "Active", followers: "890", activity: "4 posts / month", health: "good" },
    { name: "X (Twitter)", status: "Inactive", followers: "312", activity: "No posts in 60+ days", health: "poor" },
    { name: "YouTube", status: "Not Found", followers: "—", activity: "—", health: "poor" },
    { name: "TikTok", status: "Not Found", followers: "—", activity: "—", health: "poor" },
  ],
  signals: [
    { label: "Open Graph Tags", value: "Partial", status: "warning", detail: "Missing og:image on 8 pages" , confidence: "measured" },
    { label: "Twitter Cards", value: "Not configured", status: "poor", detail: "No twitter:card meta tags found" , confidence: "measured" },
    { label: "Social Share Buttons", value: "None", status: "poor", detail: "No sharing widgets detected" , confidence: "measured" },
    { label: "Brand Consistency", value: "Mixed", status: "warning", detail: "Profile images differ across platforms" , confidence: "estimated" },
  ],
  localMetrics: [
    { label: "GBP Listing", value: "Claimed & Verified", status: "good" , confidence: "measured" },
    { label: "Reviews", value: "4.2★ (89 reviews)", status: "good" , confidence: "measured" },
    { label: "Local Citations", value: "34 found", status: "warning" , confidence: "estimated" },
    { label: "Local Keywords", value: "Moderate Usage", status: "warning" , confidence: "estimated" },
    { label: "Service Area", value: "Defined", status: "good" , confidence: "measured" },
    { label: "Local Schema", value: "Present", status: "good" , confidence: "measured" },
    { label: "Apple Maps", value: "Listed", status: "good" , confidence: "measured" },
    { label: "Bing Places", value: "Not Claimed", status: "poor" , confidence: "measured" },
  ],
  reviews: [
    { author: "Sarah M.", rating: 5, timeAgo: "2 weeks ago", text: "Excellent service, very professional team." },
    { author: "James K.", rating: 4, timeAgo: "1 month ago", text: "Good results, communication could be better." },
    { author: "Lisa R.", rating: 5, timeAgo: "2 months ago", text: "Transformed our online presence completely." },
  ],
};

const mockAISEO = {
  score: 41,
  metrics: [
    { label: "AI Discovery Presence", value: "Limited (2 of 6)", status: "poor", detail: "Found in 2 of 6 major AI search platforms" , confidence: "estimated" },
    { label: "Structured Data", value: "Partial", status: "warning" , confidence: "measured" },
    { label: "Brand Entity Strength", value: "Low", status: "poor", detail: "AI models have weak association between your brand and your services" , confidence: "estimated" },
    { label: "Content Depth", value: "Below Average", status: "poor" , confidence: "estimated" },
    { label: "FAQ Schema", value: "Not Found", status: "poor" , confidence: "measured" },
    { label: "Topical Authority", value: "Moderate", status: "warning" , confidence: "estimated" },
    { label: "AI Citation Readiness", value: "Low", status: "poor", detail: "Content lacks the depth and structure AI models prioritize when citing sources" , confidence: "estimated" },
    { label: "Knowledge Panel", value: "Not Triggered", status: "poor" , confidence: "measured" },
  ],
};

const mockEntity = {
  score: 53,
  metrics: [
    { label: "Schema Markup", value: "Organization only", status: "warning" , confidence: "measured" },
    { label: "NAP Consistency", value: "4 mismatches", status: "poor" , confidence: "estimated" },
    { label: "Knowledge Graph", value: "Not Present", status: "poor" , confidence: "measured" },
    { label: "Entity Associations", value: "Weak", status: "poor" , confidence: "estimated" },
    { label: "Brand SERP", value: "Partially Controlled", status: "warning" , confidence: "estimated" },
    { label: "Wikidata", value: "No Entry", status: "poor" , confidence: "measured" },
    { label: "Same-As Links", value: "2 found", status: "warning" , confidence: "measured" },
    { label: "Entity Descriptions", value: "Inconsistent", status: "warning" , confidence: "estimated" },
  ],
};

/* Revenue Visibility Index */
function calcRevenueIndex() {
  const entityBrand = Math.round((mockEntity.score * 0.5) + (mockSocialLocal.localScore * 0.3) + (mockSocialLocal.socialScore * 0.2));
  return Math.round(
    (mockWebPerf.score * 0.15) +
    (mockSEO.score * 0.30) +
    (mockContentPerf.score * 0.20) +
    (entityBrand * 0.15) +
    (mockRevenueInfra.score * 0.20)
  );
}
function getRevenueVerdict(score) {
  if (score < 40) return "Your business is nearly invisible to buyers actively searching for your services. Revenue is being lost every day.";
  if (score < 60) return "Your business is capturing approximately " + score + "% of its potential digital demand. Competitors are capturing the remaining market share.";
  if (score < 75) return "Buyers searching for your services today are finding competitors first. You are capturing roughly " + score + "% of available demand.";
  return "Strong position — targeted improvements can accelerate pipeline growth significantly.";
}

/* Competitor Mock Data */
const competitorData = [
  { metric: "Organic Keywords", you: "312", competitor: "1,240", youWins: false },
  { metric: "Domain Authority", you: "32", competitor: "47", youWins: false },
  { metric: "Avg. Word Count", you: "620", competitor: "1,420", youWins: false },
  { metric: "Backlinks", you: "423", competitor: "1,890", youWins: false },
  { metric: "Monthly Traffic (est.)", you: "2,100", competitor: "11,400", youWins: false },
];

/* 12-Month Trend Data */
const trendData = {
  you: {
    keywords:  [295, 298, 301, 299, 303, 305, 302, 307, 304, 308, 310, 312],
    traffic:   [1980, 1950, 2010, 1990, 2020, 2050, 2030, 2080, 2060, 2070, 2090, 2100],
    backlinks: [390, 395, 398, 401, 405, 408, 410, 412, 415, 418, 420, 423],
  },
  competitor: {
    keywords:  [820, 870, 910, 950, 990, 1020, 1060, 1100, 1140, 1180, 1210, 1240],
    traffic:   [6200, 6800, 7300, 7900, 8400, 8900, 9400, 9800, 10200, 10700, 11100, 11400],
    backlinks: [1100, 1180, 1260, 1340, 1410, 1490, 1560, 1640, 1710, 1780, 1840, 1890],
  },
  labels: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"],
};
function calcGrowth(arr) {
  return Math.round(((arr[arr.length - 1] - arr[0]) / arr[0]) * 100);
}

/* Revenue Scenarios */
const revenueScenarios = {
  traffic: 2100,
  avgDeal: 4200,
  conservative: { lift: 0.10, cvr: 0.015, label: "Conservative" },
  expected:     { lift: 0.30, cvr: 0.028, label: "Expected" },
  aggressive:   { lift: 0.50, cvr: 0.040, label: "Aggressive" },
};
function calcScenario(s) {
  const added = Math.round(revenueScenarios.traffic * s.lift);
  const leads = Math.round(added * s.cvr);
  const pipeline = leads * revenueScenarios.avgDeal;
  return { added, leads, pipeline };
}

/* Revenue Infrastructure */
const attributionMetrics = [
  { label: "GA4 Installed & Firing", value: "Detected", status: "good", detail: "Google Analytics 4 is properly installed and sending events", impact: "high", confidence: "measured" },
  { label: "Primary Conversion Events Configured", value: "Partial", status: "warning", detail: "Form submissions tracked, phone clicks not configured", impact: "high", confidence: "measured" },
  { label: "Call Tracking Installed", value: "Not Detected", status: "poor", detail: "Inbound calls are not being attributed to traffic sources", impact: "high", confidence: "measured" },
  { label: "CRM Integration / Lead Sync", value: "Not Connected", status: "poor", detail: "Leads are not automatically syncing to CRM for revenue attribution", impact: "high", confidence: "measured" },
  { label: "GTM Container Active", value: "Detected", status: "good", detail: "Google Tag Manager installed and firing", confidence: "measured" },
  { label: "UTM Capture on Forms", value: "Not Captured", status: "poor", detail: "Traffic source parameters not stored with lead data", confidence: "measured" },
  { label: "Enhanced Conversions / Offline Import", value: "Not Configured", status: "warning", detail: "Closed revenue not being pushed back to ad platforms", confidence: "measured" },
  { label: "Consent Mode / Tracking Integrity", value: "Partial", status: "warning", detail: "Cookie banner may block analytics before consent", confidence: "measured" },
];
const mockRevenueInfra = {
  score: calculateModuleScore(attributionMetrics),
  metrics: attributionMetrics,
};


/* -- Helpers -- */
function statusColor(s) {
  if (s === "good") return brand.talentTeal;
  if (s === "warning") return brand.inboundOrange;
  return brand.pipelineRed;
}
function statusIcon(s) {
  if (s === "good") return "✓";
  if (s === "warning") return "!";
  return "✗";
}

/* -- Abstrakt Logo SVG Component -- */
function AbstraktLogo({ fill = "#EFEFEF", height = 28 }) {
  const aspect = 190.42 / 60.65;
  const w = height * aspect;
  return (
    <svg viewBox="0 0 190.42 60.65" width={w} height={height} xmlns="http://www.w3.org/2000/svg">
      <g fill={fill}>
        <path d="M44.96,37.65c-.64-1.09-1.55-1.95-2.72-2.59-1.17-.64-2.5-.96-3.97-.96-1.81,0-3.43.47-4.85,1.4-1.42.93-2.53,2.25-3.32,3.95-.79,1.7-1.19,3.64-1.19,5.82s.4,4.09,1.19,5.75c.79,1.66,1.9,2.94,3.3,3.83,1.41.89,3.03,1.34,4.87,1.34,1.48,0,2.8-.31,3.97-.92,1.17-.61,2.08-1.46,2.72-2.55v3.14h6.23v-21.21h-6.23v3.01ZM43.71,49.78c-.84,1.06-2.03,1.59-3.6,1.59s-2.81-.52-3.66-1.57c-.85-1.05-1.28-2.56-1.28-4.54s.43-3.53,1.3-4.64c.86-1.11,2.08-1.67,3.64-1.67s2.76.54,3.6,1.61c.84,1.07,1.26,2.61,1.26,4.62s-.42,3.54-1.26,4.6Z"/>
        <path d="M72.31,35.46c-1.42-.91-3.05-1.36-4.89-1.36-1.45,0-2.77.31-3.95.94-1.19.63-2.09,1.49-2.7,2.57v-12.55h-6.32v30.79h6.28v-3.18c.61,1.09,1.51,1.95,2.7,2.57,1.18.63,2.52.94,3.99.94,1.81,0,3.43-.47,4.85-1.4,1.42-.93,2.53-2.24,3.33-3.93.79-1.69,1.19-3.62,1.19-5.79s-.39-4.09-1.17-5.75c-.78-1.66-1.88-2.94-3.3-3.85ZM69.21,49.74c-.84,1.09-2.04,1.63-3.6,1.63s-2.77-.54-3.62-1.61c-.85-1.07-1.28-2.61-1.28-4.62s.42-3.51,1.28-4.58c.85-1.07,2.06-1.61,3.62-1.61s2.76.53,3.6,1.59c.84,1.06,1.25,2.57,1.25,4.52s-.42,3.6-1.25,4.68Z"/>
        <path d="M90.33,43.38l-3.56-.79c-.89-.2-1.51-.44-1.86-.73-.35-.29-.52-.68-.52-1.15,0-.64.29-1.14.88-1.51.59-.36,1.39-.54,2.43-.54s2.15.2,3.28.59c1.13.39,2.24.96,3.33,1.71l1.76-4.22c-1.14-.84-2.44-1.48-3.89-1.95-1.45-.46-2.93-.69-4.43-.69-1.78,0-3.36.29-4.73.86-1.37.57-2.43,1.37-3.2,2.41-.77,1.03-1.15,2.2-1.15,3.51,0,1.62.48,2.91,1.44,3.89.96.98,2.46,1.69,4.5,2.13l3.47.79c1.06.22,1.8.49,2.22.79.42.31.63.73.63,1.25,0,.64-.29,1.13-.88,1.47-.59.33-1.42.5-2.51.5-1.42,0-2.82-.22-4.18-.65-1.37-.43-2.61-1.05-3.72-1.86l-1.67,4.39c2.31,1.73,5.48,2.59,9.5,2.59,2.82,0,5.03-.59,6.65-1.76,1.62-1.17,2.43-2.76,2.43-4.77,0-1.67-.49-3.01-1.46-4.02-.98-1-2.55-1.76-4.73-2.26Z"/>
        <path d="M122.67,35.21c-1.13.71-1.96,1.74-2.49,3.07l-.42-3.64h-5.94c.22,1.78.33,3.81.33,6.07v15.14h6.32v-11.09c0-1.62.44-2.88,1.32-3.79.88-.91,2.16-1.36,3.83-1.36,1.03,0,2.06.24,3.1.71l.04-5.77c-.61-.28-1.37-.42-2.26-.42-1.42,0-2.7.36-3.83,1.07Z"/>
        <path d="M145.68,37.65c-.64-1.09-1.55-1.95-2.72-2.59-1.17-.64-2.49-.96-3.97-.96-1.81,0-3.43.47-4.85,1.4-1.42.93-2.53,2.25-3.33,3.95-.79,1.7-1.19,3.64-1.19,5.82s.4,4.09,1.19,5.75c.8,1.66,1.9,2.94,3.3,3.83,1.41.89,3.03,1.34,4.87,1.34,1.48,0,2.8-.31,3.97-.92,1.17-.61,2.08-1.46,2.72-2.55v3.14h6.23v-21.21h-6.23v3.01ZM144.43,49.78c-.84,1.06-2.04,1.59-3.6,1.59s-2.81-.52-3.66-1.57c-.85-1.05-1.28-2.56-1.28-4.54s.43-3.53,1.3-4.64,2.08-1.67,3.64-1.67,2.76.54,3.6,1.61c.84,1.07,1.26,2.61,1.26,4.62s-.42,3.54-1.26,4.6Z"/>
        <polygon points="176.96 34.68 169.38 34.68 161.44 43.76 161.44 25.06 155.12 25.06 155.12 55.85 161.44 55.85 161.44 46.35 169.76 55.85 177.5 55.85 167.96 44.85 176.96 34.68"/>
        <path d="M54.29,19.5s-.07-.35-.16-.68c.14-13.18-20.39-7.24-36.37-17.1,0,0,.26,3.12,2.92,5,.67.47,1.48.87,2.48,1.11,0,0-.81-.09-2.15-.28C16.27,6.87,4.97,4.77,0,0c0,0,.3,6.49,7.29,15.81,0,0-1.13-.58-1.52-1.03,0,0,.76,11.77,4.76,18.34-3.8,1.13,1.04,10.59,3.27,10.24-.53.08,2.35,7.1,2.67,7.67,1.39,2.51,3.25,4.79,5.55,6.53,3.1,2.34,6.64,3.26,10.2,3.07,0,0,0,0,.01,0,.68.04,1.37.03,2.06-.02-.28-.02-.55-.05-.82-.09-1.05-.15-2.09-.43-3.1-.84-1.01-.42-1.98-.97-2.91-1.67-1.47-1.11-2.73-2.49-3.77-4.01-.35-.51-.67-1.03-.97-1.57-.07-.12-.27-.59-.53-1.22-.13-.32-.28-.67-.42-1.05-.08-.19-.15-.38-.23-.57-.53-1.36-1.05-2.83-1.14-3.43-.02-.17-.01-.27.04-.28-.24.04-.51-.06-.8-.25-.36-.24-.75-.64-1.12-1.14-.07-.1-.15-.2-.22-.31-.37-.53-.72-1.16-1.01-1.8-.06-.13-.12-.26-.17-.39-.11-.26-.21-.53-.29-.79-.09-.27-.16-.53-.22-.78-.09-.39-.14-.76-.16-1.11,0-.12,0-.23,0-.34,0-.11.01-.22.03-.32.1-.73.46-1.28,1.17-1.5-.53-.88-1-1.86-1.41-2.9-.24-.62-.47-1.27-.67-1.91-.14-.43-.26-.87-.38-1.31-1.3-4.8-1.61-9.55-1.61-9.55.34.39,1.3.88,1.3.88-5.97-7.96-6.23-13.51-6.23-13.51,2.2,1.2,5.7,2.85,10.24,3.91,3.93.92,5.49.65,14.86,1.27.45.03.88.06,1.31.09,2.56.18,4.79.38,6.77.68.66.1,1.29.21,1.9.33,1.82.37,3.42.85,4.87,1.53.24.11.48.23.72.35,3.37,1.78,4.7,4.06,5.13,5.09.06-.96,0-1.82-.15-2.58Z"/>
        <path d="M190.42,39.37v-4.73h-5.4v-7.03l-6.32,2.05v4.98h-.01v4.73h.01v8.37c0,2.68.69,4.75,2.07,6.23,1.38,1.48,3.38,2.22,6,2.22,1.42,0,2.64-.2,3.64-.58v-4.9c-.78.2-1.48.29-2.09.29-.98,0-1.77-.27-2.39-.82-.61-.54-.92-1.4-.92-2.57v-8.24h5.4Z"/>
        <path d="M105.54,27.61l-6.32,2.05v4.98h-.01v4.73h.01v8.37c0,2.68.69,4.75,2.07,6.23,1.38,1.48,3.38,2.22,6,2.22,1.42,0,2.63-.2,3.64-.58v-4.9c-.78.2-1.48.29-2.09.29-.98,0-1.77-.27-2.39-.82-.61-.54-.92-1.4-.92-2.57v-8.24h5.4v-4.73h-5.4v-7.03Z"/>
      </g>
    </svg>
  );
}

/* -- Shared Components -- */
function ScoreRing({ score, size = 130, t }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? brand.talentTeal : score >= 70 ? brand.inboundOrange : brand.pipelineRed;
  const glowColor = score >= 90 ? "rgba(66,191,186,0.25)" : score >= 70 ? "rgba(244,111,10,0.25)" : "rgba(255,33,15,0.25)";
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto 14px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 12px ${glowColor})` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.cardBorder} strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{score}</span>
        <span style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 500 }}>/ 100</span>
      </div>
    </div>
  );
}

function SourceBadge({ confidence, t }) {
  if (!confidence) return null;
  const config = {
    measured: { label: "Measured", color: brand.talentTeal, bg: "rgba(66,191,186,0.1)", border: "rgba(66,191,186,0.2)" },
    estimated: { label: "Estimated", color: brand.inboundOrange, bg: "rgba(244,111,10,0.1)", border: "rgba(244,111,10,0.2)" },
    assumed: { label: "Assumed", color: t.subtle, bg: "rgba(128,128,128,0.1)", border: "rgba(128,128,128,0.2)" },
  };
  const c = config[confidence] || config.assumed;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, color: c.color,
      background: c.bg, border: "1px solid " + c.border,
      padding: "1px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8,
      whiteSpace: "nowrap",
    }}>{c.label}</span>
  );
}

function WeightBadge({ impact }) {
  if (!impact || impact === "medium") return null;
  const tier = impact === "high" ? { label: "High Impact", color: brand.pipelineRed, bg: "rgba(255,33,15,0.08)", border: "rgba(255,33,15,0.18)" }
    : impact === "low" ? { label: "Low Impact", color: brand.cloudBlue, bg: "rgba(4,129,163,0.08)", border: "rgba(4,129,163,0.18)" }
    : null;
  if (!tier) return null;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, color: tier.color,
      background: tier.bg, border: "1px solid " + tier.border,
      padding: "1px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8,
      whiteSpace: "nowrap",
    }}>{tier.label}</span>
  );
}

function MetricRow({ label, value, status, detail, confidence, impact, t }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`, transition: "background 0.2s", cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: detail ? 3 : 0 }}>
          <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{label}</span>
          <SourceBadge confidence={confidence} t={t} />
          <WeightBadge impact={impact} />
        </div>
        {detail && <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{detail}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
        <span style={{
          width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: t.statusDot, background: statusColor(status),
        }}>{statusIcon(status)}</span>
      </div>
    </div>
  );
}

function Card({ title, children, t, style: s }) {
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14,
      overflow: "hidden", backdropFilter: "blur(8px)", ...s,
    }}>
      {title && (
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${t.cardBorder}`, fontSize: 12,
          fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 3, height: 14, background: accent, borderRadius: 2, display: "inline-block" }} />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function RecommendationList({ items, t }) {
  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
            flexShrink: 0, marginTop: 1,
          }}>{i + 1}</span>
          <span style={{ fontSize: 13, color: t.body, lineHeight: 1.6 }}>{r}</span>
        </div>
      ))}
    </div>
  );
}

/* Revenue Visibility Index Banner */
function RevenueVisibilityBanner({ t }) {
  const score = calcRevenueIndex();
  const verdict = getRevenueVerdict(score);
  const color = score >= 80 ? brand.talentTeal : score >= 60 ? brand.inboundOrange : brand.pipelineRed;
  const glowColor = score >= 80 ? "rgba(66,191,186,0.15)" : score >= 60 ? "rgba(244,111,10,0.15)" : "rgba(255,33,15,0.15)";
  const low = calcScenario(revenueScenarios.conservative);
  const mid = calcScenario(revenueScenarios.expected);
  const high = calcScenario(revenueScenarios.aggressive);
  return (
    <div style={{
      textAlign: "center", marginBottom: 32, padding: "32px 24px 28px",
      background: t.cardBg, border: "1px solid " + t.cardBorder, borderRadius: 14,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, " + color + ", " + brand.inboundOrange + ")",
      }} />
      <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>
        Revenue Visibility Index
      </div>
      <div style={{
        fontSize: 72, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color: color, lineHeight: 1, marginBottom: 4,
        textShadow: "0 0 30px " + glowColor,
      }}>
        {score}
        <span style={{ fontSize: 24, color: t.subtle, fontWeight: 400 }}> / 100</span>
      </div>
      <div style={{
        fontSize: 15, color: t.body, fontWeight: 500, marginTop: 14,
        letterSpacing: 0.2, lineHeight: 1.5, maxWidth: 520, margin: "14px auto 0",
      }}>
        {verdict}
      </div>
      {/* Pipeline Range */}
      <div style={{
        marginTop: 24, paddingTop: 20, borderTop: "1px solid " + t.cardBorder,
      }}>
        <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginBottom: 14, textAlign: "center" }}>
          Monthly Pipeline You’re Leaving on the Table
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed }}>
            ${low.pipeline.toLocaleString()}
          </span>
          <span style={{ fontSize: 20, color: t.subtle, fontWeight: 500 }}>–</span>
          <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed }}>
            ${high.pipeline.toLocaleString()}
          </span>
        </div>
        {/* Scenario breakdown */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 16, marginTop: 18, flexWrap: "wrap",
        }}>
          {[
            { ...low, ...revenueScenarios.conservative, color: t.subtle },
            { ...mid, ...revenueScenarios.expected, color: brand.inboundOrange },
            { ...high, ...revenueScenarios.aggressive, color: brand.talentTeal },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "10px 16px", borderRadius: 8,
              background: i === 1 ? t.toggleBg : "transparent",
              border: "1px solid " + (i === 1 ? t.cardBorder : "transparent"),
              textAlign: "center", minWidth: 130,
            }}>
              <div style={{ fontSize: 9, color: s.color, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.text }}>
                ${s.pipeline.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: t.subtle, marginTop: 2 }}>
                +{s.added} visits · {s.leads} leads
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: t.subtle, marginTop: 14, letterSpacing: 0.3, textAlign: "center" }}>
          Scenarios: {revenueScenarios.conservative.lift * 100}%/{revenueScenarios.expected.lift * 100}%/{revenueScenarios.aggressive.lift * 100}% visibility lift &nbsp;·&nbsp; {revenueScenarios.conservative.cvr * 100}%/{revenueScenarios.expected.cvr * 100}%/{revenueScenarios.aggressive.cvr * 100}% CVR &nbsp;·&nbsp; ${revenueScenarios.avgDeal.toLocaleString()} avg deal
        </div>
      </div>
    </div>
  );
}

/* Competitor Comparison Table */
function CompetitorComparisonTable({ t }) {
  return (
    <Card title="Competitive Gap Snapshot" t={t}>
      <div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 100px 100px", padding: "10px 18px",
          borderBottom: "1px solid " + t.cardBorder, gap: 8,
        }}>
          {["Metric", "You", "Competitor"].map(h => (
            <span key={h} style={{
              fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
              textAlign: h === "Metric" ? "left" : "center",
            }}>{h}</span>
          ))}
        </div>
        {competitorData.map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 100px 100px", alignItems: "center",
            padding: "13px 18px", borderBottom: "1px solid " + t.cardBorder, gap: 8,
            transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{row.metric}</span>
            <span style={{
              fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              textAlign: "center", color: row.youWins ? brand.talentTeal : brand.pipelineRed,
            }}>{row.you}</span>
            <span style={{
              fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              textAlign: "center", color: row.youWins ? brand.pipelineRed : brand.talentTeal,
            }}>{row.competitor}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* Collapsible Foundational Section */
function FoundationalCollapsible({ items, t }) {
  const [open, setOpen] = useState(false);
  const count = items.length;
  return (
    <div style={{ borderBottom: "1px solid " + t.cardBorder }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 18px", cursor: "pointer", transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: t.statusDot, background: brand.talentTeal,
          }}>{"✓"}</span>
          <span style={{ fontSize: 14, color: t.subtle, fontWeight: 500 }}>
            {count} foundational checks passing
          </span>
        </div>
        <span style={{ fontSize: 12, color: t.subtle, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          {"▼"}
        </span>
      </div>
      {open && items.map((m, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 18px 10px 50px", borderTop: "1px solid " + t.cardBorder,
          opacity: 0.7,
        }}>
          <span style={{ fontSize: 13, color: t.subtle }}>{m.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: t.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</span>
            <span style={{
              width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: t.statusDot, background: brand.talentTeal,
            }}>{"✓"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


/* -- Tab Renderers -- */
/* Competitive Velocity Card */
function TrendVelocityCard({ t }) {
  const youKwGrowth = calcGrowth(trendData.you.keywords);
  const compKwGrowth = calcGrowth(trendData.competitor.keywords);
  const youTrafficGrowth = calcGrowth(trendData.you.traffic);
  const compTrafficGrowth = calcGrowth(trendData.competitor.traffic);
  const youBlGrowth = calcGrowth(trendData.you.backlinks);
  const compBlGrowth = calcGrowth(trendData.competitor.backlinks);
  const rows = [
    { metric: "Keyword Growth (12 mo)", you: youKwGrowth, comp: compKwGrowth },
    { metric: "Traffic Growth (12 mo)", you: youTrafficGrowth, comp: compTrafficGrowth },
    { metric: "Backlink Growth (12 mo)", you: youBlGrowth, comp: compBlGrowth },
  ];
  /* Sparkline: tiny inline SVG showing 12 data points */
  function Spark({ data, color }) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 80, h = 24;
    const points = data.map((v, i) =>
      (i / (data.length - 1)) * w + "," + (h - ((v - min) / range) * h)
    ).join(" ");
    return (
      <svg width={w} height={h} style={{ display: "block" }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  const metricDataMap = {
    "Keyword Growth (12 mo)": { you: trendData.you.keywords, comp: trendData.competitor.keywords },
    "Traffic Growth (12 mo)": { you: trendData.you.traffic, comp: trendData.competitor.traffic },
    "Backlink Growth (12 mo)": { you: trendData.you.backlinks, comp: trendData.competitor.backlinks },
  };
  return (
    <Card title="Competitive Velocity — Last 12 Months" t={t}>
      <div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 100px 80px 100px 80px", padding: "10px 18px",
          borderBottom: "1px solid " + t.cardBorder, gap: 8,
        }}>
          {["Metric", "You", "", "Competitor", ""].map((h, i) => (
            <span key={i} style={{
              fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
              textAlign: i === 0 ? "left" : "center",
            }}>{h}</span>
          ))}
        </div>
        {rows.map((row, i) => {
          const d = metricDataMap[row.metric];
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 100px 80px 100px 80px", alignItems: "center",
              padding: "13px 18px", borderBottom: "1px solid " + t.cardBorder, gap: 8,
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{row.metric}</span>
              <span style={{
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                textAlign: "center", color: row.you >= row.comp ? brand.talentTeal : brand.pipelineRed,
              }}>+{row.you}%</span>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spark data={d.you} color={row.you >= row.comp ? brand.talentTeal : brand.pipelineRed} />
              </div>
              <span style={{
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                textAlign: "center", color: row.comp > row.you ? brand.talentTeal : brand.pipelineRed,
              }}>+{row.comp}%</span>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spark data={d.comp} color={row.comp > row.you ? brand.talentTeal : brand.pipelineRed} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 18px", fontSize: 12, color: brand.pipelineRed, fontWeight: 600, lineHeight: 1.5 }}>
        Your competitors are growing {Math.round(compKwGrowth / Math.max(youKwGrowth, 1))}x faster in keyword coverage. The gap is widening every month.
      </div>
    </Card>
  );
}

function WebPerformanceTab({ t }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <ScoreRing score={mockWebPerf.score} size={140} t={t} />
        <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Technical Foundation Score</div>
      </div>
      <Card title="Performance Metrics" t={t}>
        {mockWebPerf.metrics.filter(m => m.status !== "good").map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`, transition: "background 0.2s", cursor: "default",
          }}
            onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{m.label}</span>
                {m.impact && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: brand.cloudBlue,
                    background: "rgba(4,129,163,0.1)", border: "1px solid rgba(4,129,163,0.2)",
                    padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
                  }}>+25% weight</span>
                )}
              </div>
              {m.detail && <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4, marginTop: 3 }}>{m.detail}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</span>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: t.statusDot, background: statusColor(m.status),
              }}>{statusIcon(m.status)}</span>
            </div>
          </div>
        ))}
        <FoundationalCollapsible items={mockWebPerf.metrics.filter(m => m.status === "good")} t={t} />
      </Card>
      <Card title="SEMrush Site Health — Biggest Areas to Improve" t={t}>
        <div style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          {[
            { issue: "Broken Internal Links", count: 23, severity: "high", detail: "Pages returning 4xx errors hurt crawlability and user experience" },
            { issue: "Slow Page Load (>3s)", count: 18, severity: "high", detail: "18 pages exceed the 3-second threshold — primarily image-heavy landing pages" },
            { issue: "Missing Meta Descriptions", count: 14, severity: "medium", detail: "Pages without meta descriptions lose click-through potential in SERPs" },
            { issue: "Redirect Chains", count: 11, severity: "medium", detail: "Multiple sequential redirects (3+ hops) slowing crawl efficiency" },
            { issue: "Duplicate Title Tags", count: 9, severity: "medium", detail: "Identical titles across service pages reduce search differentiation" },
            { issue: "Images Without Alt Text", count: 31, severity: "high", detail: "Missing alt attributes hurt accessibility and image search rankings" },
            { issue: "Mixed Content (HTTP/HTTPS)", count: 6, severity: "low", detail: "Some resources still loading over HTTP on secure pages" },
            { issue: "Orphan Pages", count: 4, severity: "low", detail: "Pages with no internal links pointing to them — invisible to crawlers" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`,
              transition: "background 0.2s", cursor: "default",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{item.issue}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                    padding: "2px 7px", borderRadius: 4,
                    color: item.severity === "high" ? brand.pipelineRed : item.severity === "medium" ? brand.inboundOrange : brand.talentTeal,
                    background: item.severity === "high" ? "rgba(255,33,15,0.1)" : item.severity === "medium" ? "rgba(244,111,10,0.1)" : "rgba(66,191,186,0.1)",
                    border: `1px solid ${item.severity === "high" ? "rgba(255,33,15,0.2)" : item.severity === "medium" ? "rgba(244,111,10,0.2)" : "rgba(66,191,186,0.2)"}`,
                  }}>{item.severity}</span>
                </div>
                <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4, marginTop: 3 }}>{item.detail}</div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: item.severity === "high" ? brand.pipelineRed : item.severity === "medium" ? brand.inboundOrange : brand.talentTeal,
                minWidth: 36, textAlign: "right",
              }}>{item.count}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "23 broken links are sending potential buyers to dead pages — every one is a lost conversation",
          "34% of your images are unoptimized — slow pages lose 53% of mobile visitors before they even see your offer",
          "Buyers searching your services today are landing on faster competitor pages first",
          "Every 100ms of delay costs 1% in conversions — your JavaScript is blocking first interaction",
        ]} />
      </Card>
    </div>
  );
}

function SEOTab({ t }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <ScoreRing score={mockSEO.score} size={140} t={t} />
        <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Authority & Search Score</div>
      </div>

      {/* Competitor Comparison */}
      <CompetitorComparisonTable t={t} />

      {/* Competitive Velocity */}
      <TrendVelocityCard t={t} />

      <Card title="Search Authority Metrics" t={t}>
        {mockSEO.metrics.filter(m => m.status !== "good").map((m, i) => <MetricRow key={i} {...m} t={t} />)}
        <FoundationalCollapsible items={mockSEO.metrics.filter(m => m.status === "good")} t={t} />
      </Card>
      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Your domain authority (32) is 15 points behind your top competitor — every point costs you rankings on high-value keywords",
          "423 backlinks vs. 1,890 for competitors — your content isn’t being referenced as an authority source",
          "68% of meta descriptions are optimized — the other 32% are costing you clicks in search results",
          "Ranking for 312 keywords vs. 1,240 — competitors own 4x more search real estate than you",
        ]} />
      </Card>
    </div>
  );
}

function ContentPerformanceTab({ t }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <ScoreRing score={mockContentPerf.score} size={140} t={t} />
        <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Content & Topical Depth Score</div>
      </div>
      <Card title="Content Metrics" t={t}>
        {mockContentPerf.metrics.map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`, transition: "background 0.2s", cursor: "default",
          }}
            onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{m.label}</span>
                {m.impact && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: brand.cloudBlue,
                    background: "rgba(4,129,163,0.1)", border: "1px solid rgba(4,129,163,0.2)",
                    padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
                  }}>+25% weight</span>
                )}
              </div>
              {m.detail && <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4, marginTop: 3 }}>{m.detail}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</span>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: t.statusDot, background: statusColor(m.status),
              }}>{statusIcon(m.status)}</span>
            </div>
          </div>
        ))}
      </Card>
      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Publish new blog content immediately — no content in the last 30 days significantly impacts your score",
          "Your competitors are publishing weekly. Every week without new content, they capture more of your keyword territory",
          "Your top pages average 620 words. Competitors ranking above you average 1,420. Google is choosing depth over yours",
          "AI models cite content with depth, structure, and FAQ schema — your pages lack all three",
        ]} />
      </Card>
    </div>
  );
}

function RevenueAttributionTab({ t }) {
  const d = mockSocialLocal;
  const currentTraffic = revenueScenarios.traffic;
  const low = calcScenario(revenueScenarios.conservative);
  const mid = calcScenario(revenueScenarios.expected);
  const high = calcScenario(revenueScenarios.aggressive);
  const currentLeads = Math.round(currentTraffic * revenueScenarios.expected.cvr);
  const currentPipeline = currentLeads * revenueScenarios.avgDeal;
  const potentialTraffic = Math.round(currentTraffic * (1 + revenueScenarios.expected.lift));
  const potentialLeads = Math.round(potentialTraffic * revenueScenarios.expected.cvr);
  const potentialPipeline = potentialLeads * revenueScenarios.avgDeal;
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <ScoreRing score={mockRevenueInfra.score} size={140} t={t} />
        <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Revenue Infrastructure Score</div>
        {(() => {
          const s = mockRevenueInfra.score;
          const tier = s < 50
            ? { icon: "\uD83D\uDD34", label: "High Revenue Leakage Risk", detail: "Attribution gaps likely causing under-reported performance", color: brand.pipelineRed, bg: "rgba(255,33,15,0.08)", border: "rgba(255,33,15,0.18)" }
            : s < 75
            ? { icon: "\uD83D\uDFE0", label: "Moderate Visibility, Incomplete Attribution", detail: "Some tracking in place but significant gaps remain", color: brand.inboundOrange, bg: "rgba(244,111,10,0.08)", border: "rgba(244,111,10,0.18)" }
            : { icon: "\uD83D\uDFE2", label: "Strong Infrastructure, Ready to Scale", detail: "Attribution stack can support increased traffic investment", color: brand.talentTeal, bg: "rgba(66,191,186,0.08)", border: "rgba(66,191,186,0.18)" };
          return (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              marginTop: 12, padding: "8px 16px", borderRadius: 8,
              background: tier.bg, border: "1px solid " + tier.border,
            }}>
              <span style={{ fontSize: 14 }}>{tier.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.label}</div>
                <div style={{ fontSize: 10, color: t.subtle, lineHeight: 1.3 }}>{tier.detail}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Attribution Infrastructure */}
      <div style={{ fontSize: 14, color: t.body, lineHeight: 1.6, padding: "0 4px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        Increasing traffic without reliable attribution creates invisible revenue. Before scaling visibility, your infrastructure must accurately capture, track, and attribute every lead.
      </div>

      <Card title="Revenue Infrastructure Health" t={t}>
        {mockRevenueInfra.metrics.map((m, i) => (
          <MetricRow key={i} {...m} t={t} />
        ))}
      </Card>

      {/* Scenario Model */}
      <Card title="Revenue Impact Model" t={t}>
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 100px", padding: "10px 18px",
            borderBottom: `1px solid ${t.cardBorder}`, gap: 6,
          }}>
            {["Metric", "Current", "Conservative", "Expected", "Aggressive"].map(h => (
              <span key={h} style={{
                fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600,
                textAlign: h === "Metric" ? "left" : "center",
              }}>{h}</span>
            ))}
          </div>
          {[
            { metric: "Added Visits / mo", current: "—", con: "+" + low.added, exp: "+" + mid.added, agg: "+" + high.added },
            { metric: "New Leads / mo", current: currentLeads.toString(), con: "+" + low.leads, exp: "+" + mid.leads, agg: "+" + high.leads },
            { metric: "Pipeline / mo", current: "$" + currentPipeline.toLocaleString(), con: "+$" + low.pipeline.toLocaleString(), exp: "+$" + mid.pipeline.toLocaleString(), agg: "+$" + high.pipeline.toLocaleString() },
            { metric: "Pipeline / yr", current: "$" + (currentPipeline * 12).toLocaleString(), con: "+$" + (low.pipeline * 12).toLocaleString(), exp: "+$" + (mid.pipeline * 12).toLocaleString(), agg: "+$" + (high.pipeline * 12).toLocaleString() },
          ].map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 100px", alignItems: "center",
              padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 6,
            }}>
              <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{row.metric}</span>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.subtle }}>{row.current}</span>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.body }}>{row.con}</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: brand.inboundOrange }}>{row.exp}</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: brand.talentTeal }}>{row.agg}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{
        padding: "12px 16px", background: t.toggleBg, borderRadius: 8, border: "1px solid " + t.cardBorder,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginBottom: 2 }}>
          Assumptions
        </div>
        <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.6 }}>
          <span style={{ color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>30%</span> visibility improvement &nbsp;·&nbsp;
          <span style={{ color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>2.8%</span> site conversion rate &nbsp;·&nbsp;
          <span style={{ color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>$4,200</span> avg deal size
        </div>
      </div>

      <Card title="Review Sentiment" t={t}>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {d.reviews.map((review, i) => (
            <div key={i} style={{ borderBottom: i < d.reviews.length - 1 ? `1px solid ${t.cardBorder}` : "none", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{review.author}</span>
                <span style={{ color: brand.inboundOrange, fontSize: 13 }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <span style={{ fontSize: 11, color: t.subtle }}>{review.timeAgo}</span>
              </div>
              <p style={{ fontSize: 13, color: t.body, margin: 0, lineHeight: 1.5 }}>{review.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Install Google Tag Manager immediately — without it, you can’t deploy tracking, retargeting, or conversion events without developer involvement",
          "Configure form submission and call events as GA4 conversions — right now you’re flying blind on which channels produce leads",
          "Add UTM hidden fields to every form — without source attribution, every dollar you spend on marketing is unaccountable",
          "Connect a CRM (HubSpot, Salesforce, or webhook) — leads that don’t flow into a pipeline system are leads that die on arrival",
        ]} />
      </Card>
    </div>
  );
}


function EntityBrandTab({ t }) {
  const d = mockSocialLocal;
  const combinedScore = Math.round((mockEntity.score * 0.5) + (d.localScore * 0.3) + (d.socialScore * 0.2));
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <ScoreRing score={combinedScore} size={140} t={t} />
        <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Entity & Brand Authority Score</div>
      </div>

      <Card title="Entity & Schema Signals" t={t}>
        {mockEntity.metrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
      </Card>

      <Card title="Local Presence" t={t}>
        {d.localMetrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
      </Card>

      <Card title="Platform Presence" t={t}>
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", padding: "10px 18px",
            borderBottom: `1px solid ${t.cardBorder}`, gap: 8,
          }}>
            {["Platform", "Status", "Followers", "Activity"].map(h => (
              <span key={h} style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
                textAlign: h === "Activity" ? "right" : h === "Status" || h === "Followers" ? "center" : "left" }}>{h}</span>
            ))}
          </div>
          {d.platforms.map((p, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", alignItems: "center",
              padding: "12px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 8, transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{p.name}</span>
              <span style={{ fontSize: 12, color: statusColor(p.health), textAlign: "center", fontWeight: 600 }}>{p.status}</span>
              <span style={{ fontSize: 12, color: t.body, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{p.followers}</span>
              <span style={{ fontSize: 11, color: t.subtle, textAlign: "right" }}>{p.activity}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Social SEO Signals" t={t}>
        {d.signals.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
      </Card>

      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "4 NAP mismatches are confusing search engines about your business identity — fix these before anything else",
          "No Knowledge Graph presence means Google doesn’t recognize you as an entity — competitors with panels dominate brand searches",
          "Inconsistent branding across platforms erodes trust — buyers who Google you see a fragmented identity",
          "Claim Bing Places listing — you’re invisible on the second-largest search engine",
        ]} />
      </Card>
    </div>
  );
}

/* -- Light/Dark Toggle -- */
function ModeToggle({ mode, setMode, t }) {
  return (
    <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20,
      border: `1px solid ${t.toggleBorder}`, background: t.toggleBg,
      color: t.subtle, fontSize: 12, fontWeight: 500, cursor: "pointer",
      transition: "all 0.25s", letterSpacing: 0.3,
    }}>
      <span style={{ fontSize: 15 }}>{mode === "dark" ? "☀" : "☾"}</span>
      {mode === "dark" ? "Light" : "Dark"}
    </button>
  );
}

/* -- Main Component -- */
export default function DigitalHealthAssessment() {
  const [view, setView] = useState("results");
  const [activeTab, setActiveTab] = useState(0);
  const [mode, setMode] = useState("dark");
  const t = getTheme(mode);

  const tabContent = [
    <WebPerformanceTab t={t} />,
    <SEOTab t={t} />,
    <ContentPerformanceTab t={t} />,
    <EntityBrandTab t={t} />,
    <RevenueAttributionTab t={t} />,
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bgGrad, color: t.text,
      fontFamily: "'Barlow', 'Helvetica Neue', sans-serif",
      transition: "background 0.4s, color 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.scrollHover}; }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 20px" }}>

        {/* -- Top Bar: Logo left, Mode toggle right -- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <AbstraktLogo fill={t.logoFill} height={26} />
          <ModeToggle mode={mode} setMode={setMode} t={t} />
        </div>

        {/* -- Header -- */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 20,
            background: t.badgeBg, border: `1px solid ${t.badgeBorder}`,
            fontSize: 11, color: t.badgeText, textTransform: "uppercase", letterSpacing: 2.5, fontWeight: 600,
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.badgeDot, boxShadow: `0 0 8px rgba(239,239,239,0.3)` }} />
            Abstrakt Marketing Group
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 10,
            color: t.text,
          }}>
            Digital Visibility &<br />Performance Audit
          </h1>
          <p style={{ fontSize: 14, color: t.subtle, letterSpacing: 0.3 }}>How much revenue is your digital presence leaving on the table?</p>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 36 }}>
          {["form", "results"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "9px 22px", borderRadius: 8,
              border: `1px solid ${v === view ? accent : t.cardBorder}`,
              background: v === view ? accent : "transparent",
              color: v === view ? "#fff" : t.subtle,
              fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.2,
              transition: "all 0.25s ease",
            }}>
              {v === "form" ? "Form View" : "Results View"}
            </button>
          ))}
        </div>

        {view === "form" ? (
          <Card t={t}>
            <div style={{ padding: 36 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: "center", color: t.text }}>
                Assess Your Digital Visibility
              </h2>
              <p style={{ fontSize: 14, color: t.subtle, textAlign: "center", marginBottom: 36 }}>
                Enter your business details to get a comprehensive performance audit
              </p>
              {["Full Name", "Email Address", "Business Name", "Website URL", "Competitor URL", "Industry", "Business Address"].map((label, i) => (
                <div key={i} style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 11, color: t.subtle, textTransform: "uppercase",
                    letterSpacing: 1.5, marginBottom: 7, fontWeight: 500 }}>{label}</label>
                  <input type="text" placeholder={`Enter ${label.toLowerCase()}`} style={{
                    width: "100%", padding: "13px 16px", borderRadius: 10,
                    border: `1px solid ${t.cardBorder}`, background: t.inputBg,
                    color: t.text, fontSize: 14, outline: "none", transition: "border-color 0.2s",
                  }}
                    onFocus={e => e.target.style.borderColor = accent}
                    onBlur={e => e.target.style.borderColor = t.cardBorder}
                  />
                </div>
              ))}
              <button style={{
                width: "100%", padding: "15px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 1.5,
                boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
              }}>
                Run Assessment →
              </button>
            </div>
          </Card>
        ) : (
          <>
            {/* Revenue Visibility Score */}
            <RevenueVisibilityBanner t={t} />

            {/* Tab Bar */}
            <div style={{
              display: "flex", gap: 4, marginBottom: 30, overflowX: "auto",
              padding: "5px", background: t.toggleBg, borderRadius: 12,
              border: `1px solid ${t.cardBorder}`,
            }}>
              {tabs.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)} style={{
                  flex: "0 0 auto", padding: "10px 16px", borderRadius: 8, border: "none",
                  background: i === activeTab ? `linear-gradient(135deg, ${accent}, ${accentAlt})` : "transparent",
                  color: i === activeTab ? "#fff" : t.subtle,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap", transition: "all 0.25s", letterSpacing: 0.3,
                  boxShadow: i === activeTab ? "0 2px 10px rgba(66,191,186,0.2)" : "none",
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {tabContent[activeTab]}

            {/* CTA */}
            {(() => {
              
              const ctaLow = calcScenario(revenueScenarios.conservative);
              const ctaHigh = calcScenario(revenueScenarios.aggressive);
              const ctaScore = calcRevenueIndex();
              return (
                <div style={{
                  textAlign: "center", marginTop: 40, padding: "44px 24px",
                  background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14,
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: -60, right: -60, width: 200, height: 200,
                    background: "radial-gradient(circle, rgba(255,33,15,0.08) 0%, transparent 70%)", borderRadius: "50%",
                  }} />
                  <div style={{
                    position: "absolute", bottom: -40, left: -40, width: 160, height: 160,
                    background: "radial-gradient(circle, rgba(66,191,186,0.06) 0%, transparent 70%)", borderRadius: "50%",
                  }} />
                  <h3 style={{
                    fontSize: 22, fontWeight: 700, marginBottom: 14, position: "relative",
                    color: brand.pipelineRed, lineHeight: 1.3,
                  }}>
                    You{"’"}re Leaving ${ctaLow.pipeline.toLocaleString()}{""}–${ctaHigh.pipeline.toLocaleString()} in Monthly Pipeline Untapped
                  </h3>
                  <p style={{ fontSize: 15, color: t.body, marginBottom: 28, maxWidth: 520, margin: "0 auto 28px", position: "relative", lineHeight: 1.6 }}>
                    Your Revenue Visibility Index is <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed }}>{ctaScore}/100</span>. Competitors are ranking for <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>4x</span> more keywords and capturing the demand you{"’"}re missing. Let{"’"}s capture it.
                  </p>
                  <button style={{
                    padding: "15px 40px", borderRadius: 10, border: "none",
                    background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                    letterSpacing: 0.5, position: "relative",
                    boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
                  }}>
                    Get Your Personalized Strategy {"→"}
                  </button>
                </div>
              );
            })()}
          </>
        )}

        <div style={{
          textAlign: "center", padding: "28px", color: t.subtle, fontSize: 10,
          textTransform: "uppercase", letterSpacing: 1.5, marginTop: 20,
        }}>
          Built by Abstrakt Marketing Group | Digital Visibility & Performance Audit
        </div>
      </div>
    </div>
  );
}
