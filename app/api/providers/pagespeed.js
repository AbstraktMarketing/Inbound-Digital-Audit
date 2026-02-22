// Google PageSpeed Insights API provider
// Docs: https://developers.google.com/speed/docs/insights/v5/get-started

export async function fetchPageSpeed(url) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY not configured");

  const results = {};

  // Run both mobile and desktop
  for (const strategy of ["mobile", "desktop"]) {
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

    const res = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PageSpeed API error (${strategy}): ${err}`);
    }
    results[strategy] = await res.json();
  }

  return mapPageSpeedData(results, url);
}

function mapPageSpeedData(results, url) {
  const mobile = results.mobile;
  const desktop = results.desktop;
  const lh = desktop.lighthouseResult;
  const audits = lh?.audits || {};
  const categories = lh?.categories || {};

  // Performance score (average of mobile + desktop)
  const mobilePerf = Math.round((results.mobile.lighthouseResult?.categories?.performance?.score || 0) * 100);
  const desktopPerf = Math.round((categories.performance?.score || 0) * 100);
  const avgPerf = Math.round((mobilePerf + desktopPerf) / 2);

  // Mobile friendly
  const mobileFriendly = results.mobile.lighthouseResult?.categories?.["best-practices"]?.score >= 0.7;

  // SSL check
  const isHttps = audits["is-on-https"]?.score === 1;

  // Image optimization
  const imageAudit = audits["uses-optimized-images"] || audits["modern-image-formats"] || {};
  const unoptimizedImages = imageAudit.details?.items?.length || 0;
  const totalImages = (audits["image-elements"]?.details?.items?.length) || 50;
  const imageOptPct = totalImages > 0 ? Math.round((unoptimizedImages / totalImages) * 100) : 0;

  // Core Web Vitals from field data if available, otherwise lab
  const fieldData = desktop.loadingExperience?.metrics || {};
  const lcp = fieldData.LARGEST_CONTENTFUL_PAINT_MS?.percentile || audits["largest-contentful-paint"]?.numericValue || null;
  const fid = fieldData.FIRST_INPUT_DELAY_MS?.percentile || audits["max-potential-fid"]?.numericValue || null;
  const cls = fieldData.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile !== undefined
    ? fieldData.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100
    : audits["cumulative-layout-shift"]?.numericValue || null;

  return {
    performanceScore: avgPerf,
    mobileScore: mobilePerf,
    desktopScore: desktopPerf,
    mobileFriendly,
    isHttps,
    imageOptimization: {
      unoptimizedCount: unoptimizedImages,
      totalImages,
      improvementPct: imageOptPct,
    },
    coreWebVitals: { lcp, fid, cls },
    seoScore: Math.round((categories.seo?.score || 0) * 100),
    accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
  };
}
