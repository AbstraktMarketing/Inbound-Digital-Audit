// Google PageSpeed Insights API v5 provider
// Replaces GTmetrix — synchronous, no polling needed
// Docs: https://developers.google.com/speed/docs/insights/v5/get-started

const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function fetchPageSpeed(url) {
  const apiKey = process.env.GOOGLE_PSI_API_KEY || process.env.GOOGLE_API_KEY || process.env.PAGESPEED_API_KEY;
  
  // PSI works without an API key (lower quota), but key is recommended
  const keyParam = apiKey ? `&key=${apiKey}` : "";

  // Run both mobile and desktop in parallel
  const [mobileRes, desktopRes] = await Promise.allSettled([
    fetchPSI(url, "mobile", keyParam),
    fetchPSI(url, "desktop", keyParam),
  ]);

  const mobile = mobileRes.status === "fulfilled" ? mobileRes.value : null;
  const desktop = desktopRes.status === "fulfilled" ? desktopRes.value : null;

  if (!mobile && !desktop) {
    const err = mobileRes.reason?.message || desktopRes.reason?.message || "Unknown error";
    throw new Error(`PageSpeed Insights failed: ${err}`);
  }

  // Use whichever succeeded, prefer mobile for the primary score
  const primary = mobile || desktop;
  const lh = primary.lighthouseResult;
  const categories = lh?.categories || {};
  const audits = lh?.audits || {};

  const perfScore = Math.round((categories.performance?.score ?? 0) * 100);
  const seoScore = Math.round((categories.seo?.score ?? 0) * 100);
  const a11yScore = Math.round((categories.accessibility?.score ?? 0) * 100);
  const bpScore = Math.round((categories["best-practices"]?.score ?? 0) * 100);

  const mobileScore = mobile ? Math.round((mobile.lighthouseResult?.categories?.performance?.score ?? 0) * 100) : null;
  const desktopScore = desktop ? Math.round((desktop.lighthouseResult?.categories?.performance?.score ?? 0) * 100) : null;

  // Core Web Vitals from lab data
  const lcp = audits["largest-contentful-paint"]?.numericValue ?? null;
  const fcp = audits["first-contentful-paint"]?.numericValue ?? null;
  const tbt = audits["total-blocking-time"]?.numericValue ?? null;
  const cls = audits["cumulative-layout-shift"]?.numericValue ?? null;
  const si = audits["speed-index"]?.numericValue ?? null;

  // Mobile friendly check
  const viewportAudit = audits["viewport"];
  const mobileFriendly = viewportAudit?.score === 1;

  // HTTPS check
  const isHttps = lh?.finalUrl?.startsWith("https://") ?? null;

  // Image optimization opportunities
  const imgAudit = audits["uses-optimized-images"] || audits["modern-image-formats"] || {};
  const imgDetails = imgAudit.details?.items || [];
  const imgExamples = imgDetails.slice(0, 5).map(item => ({
    url: shortenUrl(item.url || ""),
    wastedBytes: item.wastedBytes ? Math.round(item.wastedBytes / 1024) : null,
  }));
  const totalWastedBytes = imgDetails.reduce((sum, i) => sum + (i.wastedBytes || 0), 0);

  // Render-blocking resources
  const blockingAudit = audits["render-blocking-resources"] || {};
  const blockingItems = blockingAudit.details?.items || [];
  const blockingResources = blockingItems.slice(0, 5).map(item => ({
    url: shortenUrl(item.url || ""),
    wastedMs: item.wastedMs || 0,
  }));

  // LCP element
  const lcpAudit = audits["largest-contentful-paint-element"] || {};
  const lcpElement = lcpAudit.details?.items?.[0]?.items?.[0]?.node?.snippet || null;

  console.log(`[PSI] Scores: mobile=${mobileScore}, desktop=${desktopScore}, perf=${perfScore}, seo=${seoScore}, a11y=${a11yScore}`);
  console.log(`[PSI] CWV: LCP=${lcp}ms, FCP=${fcp}ms, TBT=${tbt}ms, CLS=${cls}`);

  return {
    performanceScore: perfScore,
    mobileScore,
    desktopScore,
    seoScore,
    accessibilityScore: a11yScore,
    bestPracticesScore: bpScore,
    mobileFriendly,
    isHttps,
    coreWebVitals: {
      lcp,
      fcp,
      tbt,
      cls,
      si,
      lcpFormatted: lcp ? `${(lcp / 1000).toFixed(1)}s` : null,
      fcpFormatted: fcp ? `${(fcp / 1000).toFixed(1)}s` : null,
      tbtFormatted: tbt ? `${Math.round(tbt)}ms` : null,
    },
    imageOptimization: {
      totalImages: imgDetails.length,
      improvementPct: totalWastedBytes > 0 ? Math.min(99, Math.round((totalWastedBytes / (totalWastedBytes + 100000)) * 100)) : null,
      examples: imgExamples,
    },
    blockingResources,
    lcpElement,
    // Accessibility issues from Lighthouse
    a11yIssues: extractA11yIssues(audits),
  };
}

async function fetchPSI(url, strategy, keyParam) {
  const categories = "category=performance&category=seo&category=accessibility&category=best-practices";
  const apiUrl = `${PSI_BASE}?url=${encodeURIComponent(url)}&strategy=${strategy}&${categories}${keyParam}`;

  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`PSI ${strategy} failed (${res.status}): ${errBody.substring(0, 200)}`);
  }

  return res.json();
}

function shortenUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 60 ? u.pathname.substring(0, 57) + "..." : u.pathname;
    return path;
  } catch {
    return url.length > 80 ? url.substring(0, 77) + "..." : url;
  }
}

function extractA11yIssues(audits) {
  const issues = [];
  const a11yAudits = ["color-contrast", "image-alt", "label", "link-name", "button-name"];
  
  for (const id of a11yAudits) {
    const audit = audits[id];
    if (audit && audit.score !== null && audit.score < 1) {
      const count = audit.details?.items?.length || 1;
      issues.push({ issue: audit.title || id, count });
    }
  }
  
  return issues;
}
