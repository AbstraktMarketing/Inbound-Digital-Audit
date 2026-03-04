// GTmetrix provider — async test start + polling for results
// Uses GTmetrix API v2.0: https://gtmetrix.com/api/docs/2.0/
// Auth: HTTP Basic with GTMETRIX_API_KEY as username, empty password
//
// Flow: POST /tests → poll GET /tests/{id} → GET /reports/{reportId}
// The test endpoint returns state + report ID. Metrics live on the report endpoint.

const API_BASE = "https://gtmetrix.com/api/2.0";

/**
 * Start a GTmetrix test. Returns { testId } immediately.
 * Call pollGTmetrixResult(testId) to get results.
 */
export async function startGTmetrixTest(url) {
  const apiKey = process.env.GTMETRIX_API_KEY;
  if (!apiKey) {
    console.log("[GTmetrix] No GTMETRIX_API_KEY — skipping");
    return null;
  }

  try {
    const auth = Buffer.from(`${apiKey}:`).toString("base64");
    const res = await fetch(`${API_BASE}/tests`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "test",
          attributes: { url },
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[GTmetrix] Start test failed: ${res.status} ${text}`);
      return null;
    }

    const json = await res.json();
    const testId = json.data?.id;
    if (!testId) {
      console.error("[GTmetrix] No test ID in response");
      return null;
    }

    console.log(`[GTmetrix] Test started: ${testId}`);
    return { testId };
  } catch (err) {
    console.error(`[GTmetrix] Start error: ${err.message}`);
    return null;
  }
}

/**
 * Poll a GTmetrix test until complete or timeout.
 * When complete, fetches the report endpoint for actual metrics.
 * Returns parsed metrics or null if still running / error.
 */
export async function pollGTmetrixResult(testId, maxWaitMs = 60000) {
  const apiKey = process.env.GTMETRIX_API_KEY;
  if (!apiKey || !testId) return null;

  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const headers = { Authorization: `Basic ${auth}` };
  const start = Date.now();
  const pollInterval = 3000; // 3 seconds between polls

  while (Date.now() - start < maxWaitMs) {
    try {
      // Don't auto-follow redirects — GTmetrix may redirect to report when complete
      const res = await fetch(`${API_BASE}/tests/${testId}`, {
        headers,
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });

      // 303 redirect → test is complete, follow to report
      if (res.status === 303) {
        const reportUrl = res.headers.get("location");
        console.log(`[GTmetrix] Test ${testId} complete (303 redirect → ${reportUrl})`);
        if (reportUrl) {
          return await fetchReport(reportUrl, headers, testId);
        }
        return null;
      }

      if (!res.ok) {
        console.error(`[GTmetrix] Poll failed: ${res.status}`);
        return null;
      }

      const json = await res.json();
      const state = json.data?.attributes?.state;
      console.log(`[GTmetrix] Poll state for ${testId}: ${state}`);

      if (state === "completed") {
        // Get report ID from test response
        const reportId = json.data?.attributes?.report || json.data?.links?.report;
        console.log(`[GTmetrix] Test completed, reportId: ${reportId}`);

        if (reportId) {
          // reportId could be a full URL or just an ID
          const reportUrl = reportId.startsWith("http")
            ? reportId
            : `${API_BASE}/reports/${reportId}`;
          return await fetchReport(reportUrl, headers, testId);
        }

        // Fallback: try to parse from test response (unlikely to have metrics)
        return parseGTmetrixResult(json.data);
      }

      if (state === "error") {
        console.error(`[GTmetrix] Test errored: ${json.data?.attributes?.error || "unknown"}`);
        return null;
      }

      // Still queued or started — wait and retry
      await sleep(pollInterval);
    } catch (err) {
      console.error(`[GTmetrix] Poll error: ${err.message}`);
      return null;
    }
  }

  console.log(`[GTmetrix] Timed out after ${maxWaitMs}ms for test ${testId}`);
  return null;
}

/**
 * Fetch the report endpoint to get actual metrics (grade, scores, TTFB, etc.)
 */
async function fetchReport(reportUrl, headers, testId) {
  try {
    console.log(`[GTmetrix] Fetching report: ${reportUrl}`);
    const res = await fetch(reportUrl, {
      headers,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[GTmetrix] Report fetch failed: ${res.status}`);
      return null;
    }

    const json = await res.json();
    const attrs = json.data?.attributes || {};
    console.log(`[GTmetrix] Report attributes keys: ${Object.keys(attrs).join(", ")}`);

    const result = {
      gtmetrixGrade: attrs.gtmetrix_grade || null,
      gtmetrixScore: attrs.gtmetrix_score ?? null,
      structureScore: attrs.structure_score ?? null,
      performanceScore: attrs.performance_score ?? null,
      fullyLoadedTime: attrs.fully_loaded_time ?? null,       // ms
      onloadTime: attrs.onload_time ?? null,                   // ms
      ttfb: attrs.time_to_first_byte ?? null,                  // ms
      pageBytes: attrs.page_bytes ?? null,                     // bytes
      pageRequests: attrs.page_requests ?? null,               // count
      htmlBytes: attrs.html_bytes ?? null,                     // bytes
      reportUrl: json.data?.links?.report_url || attrs.report_url || `https://gtmetrix.com/reports/${testId}`,
    };

    console.log(`[GTmetrix] Parsed report: grade=${result.gtmetrixGrade}, perf=${result.performanceScore}, ttfb=${result.ttfb}, bytes=${result.pageBytes}`);
    return result;
  } catch (err) {
    console.error(`[GTmetrix] Report fetch error: ${err.message}`);
    return null;
  }
}

// Keep for backwards compatibility — used as fallback
function parseGTmetrixResult(data) {
  const attrs = data?.attributes || {};
  return {
    gtmetrixGrade: attrs.gtmetrix_grade || null,
    gtmetrixScore: attrs.gtmetrix_score ?? null,
    structureScore: attrs.structure_score ?? null,
    performanceScore: attrs.performance_score ?? null,
    fullyLoadedTime: attrs.fully_loaded_time ?? null,
    onloadTime: attrs.onload_time ?? null,
    ttfb: attrs.time_to_first_byte ?? null,
    pageBytes: attrs.page_bytes ?? null,
    pageRequests: attrs.page_requests ?? null,
    htmlBytes: attrs.html_bytes ?? null,
    reportUrl: attrs.report_url || null,
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
