// Diagnostic endpoint — test ALL providers in parallel
// GET /api/debug/providers?domain=abstraktmg.com&company=Abstrakt+Marketing+Group
// Protected by DEBUG_API_SECRET bearer token

import { fetchPageSpeed } from "../../providers/pagespeed.js";
import { fetchSemrush } from "../../providers/semrush.js";
import { fetchPlacesData } from "../../providers/places.js";
import { fetchEntityData } from "../../providers/entity.js";
import { fetchSitemap } from "../../providers/sitemapCheck.js";
import { startGTmetrixTest, pollGTmetrixResult } from "../../providers/gtmetrix.js";

export const maxDuration = 60;

export async function GET(request) {
  const secret = process.env.DEBUG_API_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || "abstraktmg.com";
  const company = searchParams.get("company") || "Abstrakt Marketing Group";
  const fullUrl = `https://${domain}`;

  async function timed(name, fn) {
    const start = Date.now();
    try {
      const result = await fn();
      return { name, status: "ok", detail: result, ms: Date.now() - start };
    } catch (err) {
      return { name, status: "error", detail: err.message, ms: Date.now() - start };
    }
  }

  const tests = await Promise.allSettled([
    // 1. PageSpeed
    timed("pageSpeed", async () => {
      const ps = await fetchPageSpeed(fullUrl);
      if (!ps) return "No data returned";
      return `Desktop: ${ps.desktop ?? "?"}, Mobile: ${ps.mobile ?? "?"}, LCP: ${ps.lcp ?? "?"}ms`;
    }),

    // 2. SEMrush
    timed("semrush", async () => {
      const sr = await fetchSemrush(domain);
      if (!sr) return "No data returned";
      const da = sr.domainAuthority;
      return `Rank: ${da?.rank ?? "?"}, Keywords: ${da?.organicKeywords ?? "?"}, Backlinks: ${sr.backlinks?.totalBacklinks ?? "?"}`;
    }),

    // 3. Places
    timed("places", async () => {
      const pl = await fetchPlacesData(company, fullUrl);
      if (!pl || !pl.found) return "Not found";
      return `Found: ${pl.data?.name ?? "?"}, ${pl.data?.rating ?? "?"}★ (${pl.data?.reviewCount ?? 0} reviews)`;
    }),

    // 4. GTmetrix — start + poll (15s timeout)
    timed("gtmetrix", async () => {
      const apiKey = process.env.GTMETRIX_API_KEY;
      if (!apiKey) return "GTMETRIX_API_KEY not set";

      const start = await startGTmetrixTest(fullUrl);
      if (!start || !start.testId) return "Failed to start test (check API key or credits)";

      const testId = start.testId;
      const result = await pollGTmetrixResult(testId, 15000);
      if (!result) return `Test started (ID: ${testId}) but poll timed out after 15s — test may still be running`;

      return `Grade: ${result.gtmetrixGrade ?? "?"}, Perf: ${result.performanceScore ?? "?"}%, TTFB: ${result.ttfb ?? "?"}ms, Weight: ${result.pageBytes ? Math.round(result.pageBytes / 1024) + "KB" : "?"}`;
    }),

    // 5. Entity
    timed("entity", async () => {
      const ent = await fetchEntityData(fullUrl, company, {});
      if (!ent) return "No data returned";
      const dirs = ent.directories || [];
      const foundCount = dirs.filter(d => d.found).length;
      return `Schema: ${ent.schema?.hasOrganization ? "yes" : "no"}, KG: ${ent.knowledgeGraph?.found ? "yes" : "no"}, Dirs: ${foundCount}/${dirs.length}`;
    }),

    // 6. Sitemap
    timed("sitemap", async () => {
      const sm = await fetchSitemap(fullUrl);
      if (!sm || !sm.found) return "Not found";
      return `Found at ${sm.location}, ${sm.totalPages} pages, Blog: ${sm.blogDetected ? `yes (${sm.blogUrls} posts)` : "no"}`;
    }),
  ]);

  const results = {};
  for (const t of tests) {
    const val = t.status === "fulfilled" ? t.value : { name: "unknown", status: "error", detail: t.reason?.message, ms: 0 };
    results[val.name] = { status: val.status, detail: val.detail, ms: val.ms };
  }

  return Response.json({ domain, company, results });
}
