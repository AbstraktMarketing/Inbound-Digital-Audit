// GTmetrix API v2.0 provider
// Replaces PageSpeed Insights — async test flow: start → poll → get report
// Docs: https://gtmetrix.com/api/docs/2.0/

const GTMETRIX_BASE = "https://gtmetrix.com/api/2.0";

export async function fetchGtmetrix(url) {
  // Support multiple env var naming conventions
  const apiKey = process.env.GTMetrix_API_Key || process.env.GTMETRIX_API_KEY || process.env.GTMETRIX_API_Key;
  if (!apiKey) throw new Error("GTmetrix API key not configured. Set GTMetrix_API_Key or GTMETRIX_API_KEY in environment variables.");

  // Auth header: Basic base64(apiKey + ":") — v2.0 uses API key as username, empty password
  const authHeader = "Basic " + Buffer.from(apiKey + ":").toString("base64");

  // 1. Start the test
  const startRes = await fetch(`${GTMETRIX_BASE}/tests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      data: {
        type: "test",
        attributes: {
          url: url,
          report: "lighthouse",  // 1 credit — gives us performance_score + Lighthouse data
        },
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  // Handle HTTP errors
  if (!startRes.ok) {
    const errBody = await startRes.text();
    throw new Error(`GTmetrix start test failed (${startRes.status}): ${errBody}`);
  }

  const startData = await startRes.json();

  // Check for JSON:API error responses (GTmetrix may return 200 with errors array)
  if (startData.errors) {
    const errMsg = startData.errors.map(e => e.title || e.detail || e.code).join("; ");
    throw new Error(`GTmetrix API error: ${errMsg}`);
  }

  const testId = startData.data?.id;
  const pollUrl = startData.data?.links?.self;

  if (!testId) {
    // Log the actual response for debugging
    console.error("[GTmetrix] Unexpected start response:", JSON.stringify(startData).substring(0, 500));
    throw new Error(`GTmetrix: No test ID in response. Response keys: ${Object.keys(startData).join(", ")}`);
  }

  // 2. Poll until complete (max ~110s — Vercel maxDuration is 120s)
  const maxWait = 110000;
  const pollInterval = 3000;
  const startTime = Date.now();
  let testData = null;

  while (Date.now() - startTime < maxWait) {
    await sleep(pollInterval);

    const pollRes = await fetch(`${GTMETRIX_BASE}/tests/${testId}`, {
      headers: { Authorization: authHeader },
    });

    if (!pollRes.ok) {
      throw new Error(`GTmetrix poll failed (${pollRes.status})`);
    }

    const pollData = await pollRes.json();
    const state = pollData.data?.attributes?.state;
    console.log(`[GTmetrix] Poll: state=${state}, elapsed=${Math.round((Date.now() - startTime) / 1000)}s`);

    if (state === "completed") {
      testData = pollData.data;
      break;
    }

    if (state === "error") {
      const errMsg = pollData.data?.attributes?.error || "Unknown GTmetrix error";
      throw new Error(`GTmetrix test error: ${errMsg}`);
    }

    // states "queued" or "started" — keep polling
  }

  if (!testData) {
    throw new Error("GTmetrix: Test timed out after 110s");
  }

  // 3. Get the report
  const reportId = testData.attributes?.report;
  if (!reportId) {
    throw new Error("GTmetrix: No report ID in completed test");
  }

  const reportRes = await fetch(`${GTMETRIX_BASE}/reports/${reportId}`, {
    headers: { Authorization: authHeader },
  });

  if (!reportRes.ok) {
    throw new Error(`GTmetrix report fetch failed (${reportRes.status})`);
  }

  const reportData = await reportRes.json();
  return mapGtmetrixData(reportData.data?.attributes || {});
}

function mapGtmetrixData(attrs) {
  // GTmetrix report attributes include:
  //   performance_score (0-100), structure_score (0-100), gtmetrix_grade ("A"-"F")
  //   lcp, tbt, cls, fcp, si, tti (Lighthouse metrics in ms/score)
  //   fully_loaded_time (ms), onload_time (ms), page_bytes, page_elements

  const perfScore = attrs.performance_score ?? null;
  const structureScore = attrs.structure_score ?? null;

  // Map to the same shape buildWebPerfMetrics expects from PageSpeed provider
  // Note: mobileFriendly and isHttps come from the crawl provider, so we set them null here
  // and let buildWebPerfMetrics fall back to crawl data
  return {
    performanceScore: perfScore,
    mobileScore: null,       // GTmetrix doesn't split mobile/desktop by default
    desktopScore: perfScore,  // The score IS the desktop score
    mobileFriendly: null,     // Crawl provider handles this
    isHttps: null,            // Crawl provider handles this
    imageOptimization: {
      unoptimizedCount: 0,
      totalImages: 0,
      improvementPct: null,   // Crawl provider handles image data
    },
    coreWebVitals: {
      lcp: attrs.largest_contentful_paint ?? attrs.lcp ?? null,
      fid: attrs.total_blocking_time ?? attrs.tbt ?? null,  // TBT is the lab proxy for FID
      cls: attrs.cumulative_layout_shift ?? attrs.cls ?? null,
    },
    // Use structure_score as a proxy for SEO/accessibility scores
    // This feeds into the "site health" approximation in buildWebPerfMetrics
    seoScore: structureScore ?? null,
    accessibilityScore: null,
    // Bonus fields from GTmetrix (available for future use)
    gtmetrixGrade: attrs.gtmetrix_grade ?? null,
    structureScore: structureScore,
    fullyLoadedTime: attrs.fully_loaded_time ?? null,
    pageBytes: attrs.page_bytes ?? null,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
