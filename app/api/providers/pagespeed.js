// Google PageSpeed Insights API — extracts specific resource-level findings

export async function fetchPageSpeed(url) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY not configured");

  const results = {};
  for (const strategy of ["mobile", "desktop"]) {
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`PageSpeed API error (${strategy}): ${await res.text()}`);
    results[strategy] = await res.json();
  }

  return mapPageSpeedData(results, url);
}

function mapPageSpeedData(results, url) {
  const lh = results.desktop.lighthouseResult;
  const audits = lh?.audits || {};
  const categories = lh?.categories || {};

  const mobilePerf = Math.round((results.mobile.lighthouseResult?.categories?.performance?.score || 0) * 100);
  const desktopPerf = Math.round((categories.performance?.score || 0) * 100);
  const avgPerf = Math.round((mobilePerf + desktopPerf) / 2);
  const mobileFriendly = results.mobile.lighthouseResult?.categories?.["best-practices"]?.score >= 0.7;
  const isHttps = audits["is-on-https"]?.score === 1;

  // ── Specific: Unoptimized images with URLs + sizes ──
  const imageAudit = audits["uses-optimized-images"] || audits["modern-image-formats"] || {};
  const unoptimizedImages = (imageAudit.details?.items || []).slice(0, 5).map(item => ({
    url: shortenResourceUrl(item.url),
    wastedBytes: item.wastedBytes ? Math.round(item.wastedBytes / 1024) : null,
  }));

  // ── Specific: Largest Contentful Paint element ──
  const lcpAudit = audits["largest-contentful-paint-element"];
  let lcpElement = null;
  if (lcpAudit?.details?.items?.[0]) {
    const item = lcpAudit.details.items[0];
    lcpElement = item.node?.snippet?.substring(0, 100) || item.node?.nodeLabel || null;
  }

  // ── Specific: Render-blocking resources ──
  const blockingAudit = audits["render-blocking-resources"];
  const blockingResources = (blockingAudit?.details?.items || []).slice(0, 3).map(item => ({
    url: shortenResourceUrl(item.url),
    wastedMs: Math.round(item.wastedMs || 0),
  }));

  // ── Specific: Largest resources by transfer size ──
  const networkAudit = audits["network-requests"];
  let largestResources = [];
  if (networkAudit?.details?.items) {
    largestResources = networkAudit.details.items
      .filter(i => i.transferSize > 50000)
      .sort((a, b) => b.transferSize - a.transferSize)
      .slice(0, 5)
      .map(i => ({
        url: shortenResourceUrl(i.url),
        sizeKB: Math.round(i.transferSize / 1024),
        type: i.resourceType || "unknown",
      }));
  }

  // ── Core Web Vitals with actual numbers ──
  const fieldData = results.desktop.loadingExperience?.metrics || {};
  const lcp = fieldData.LARGEST_CONTENTFUL_PAINT_MS?.percentile || audits["largest-contentful-paint"]?.numericValue || null;
  const fid = fieldData.FIRST_INPUT_DELAY_MS?.percentile || audits["max-potential-fid"]?.numericValue || null;
  const cls = fieldData.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile !== undefined
    ? fieldData.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100
    : audits["cumulative-layout-shift"]?.numericValue || null;
  const fcp = audits["first-contentful-paint"]?.numericValue || null;
  const tbt = audits["total-blocking-time"]?.numericValue || null;
  const si = audits["speed-index"]?.numericValue || null;

  // ── Specific: Accessibility issues ──
  const a11yIssues = [];
  ["color-contrast", "image-alt", "link-name", "button-name", "label"].forEach(key => {
    if (audits[key]?.score === 0 && audits[key]?.details?.items?.length > 0) {
      a11yIssues.push({ issue: audits[key].title, count: audits[key].details.items.length });
    }
  });

  return {
    performanceScore: avgPerf,
    mobileScore: mobilePerf,
    desktopScore: desktopPerf,
    mobileFriendly,
    isHttps,
    imageOptimization: {
      unoptimizedCount: unoptimizedImages.length,
      totalImages: (audits["image-elements"]?.details?.items?.length) || 0,
      improvementPct: unoptimizedImages.length > 0 ? Math.round((unoptimizedImages.length / Math.max(1, (audits["image-elements"]?.details?.items?.length) || 1)) * 100) : 0,
      examples: unoptimizedImages,
    },
    coreWebVitals: {
      lcp, lcpFormatted: lcp ? `${(lcp / 1000).toFixed(1)}s` : null,
      fid, fidFormatted: fid ? `${Math.round(fid)}ms` : null,
      cls, clsFormatted: cls !== null ? cls.toFixed(2) : null,
      fcp, fcpFormatted: fcp ? `${(fcp / 1000).toFixed(1)}s` : null,
      tbt, tbtFormatted: tbt ? `${Math.round(tbt)}ms` : null,
      si, siFormatted: si ? `${(si / 1000).toFixed(1)}s` : null,
    },
    lcpElement,
    blockingResources,
    largestResources,
    a11yIssues,
    seoScore: Math.round((categories.seo?.score || 0) * 100),
    accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
  };
}

function shortenResourceUrl(url) {
  if (!url) return "(unknown)";
  try {
    const u = new URL(url);
    const path = u.pathname + (u.search ? "?" + u.search.substring(0, 20) : "");
    return path.length > 70 ? path.substring(0, 67) + "..." : path;
  } catch {
    return url.length > 70 ? url.substring(0, 67) + "..." : url;
  }
}
