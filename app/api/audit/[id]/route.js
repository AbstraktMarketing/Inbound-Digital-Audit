import { Redis } from "@upstash/redis";
const kv = Redis.fromEnv();
import { fetchPageSpeed } from "../../providers/pagespeed.js";
import { fetchSemrush } from "../../providers/semrush.js";
import { fetchPlacesData } from "../../providers/places.js";
import { fetchEntityData } from "../../providers/entity.js";
import { fetchSitemap } from "../../providers/sitemapCheck.js";
import { pollGTmetrixResult } from "../../providers/gtmetrix.js";
import { buildWebPerfMetrics, buildSEOMetrics, buildKeywords, buildContentMetrics, buildSocialMetrics, buildAISEOMetrics, buildEntityMetrics, checkUrl } from "../route.js";

export const maxDuration = 60;

export async function GET(request, { params }) {
  const { id } = params;

  if (!id || id.length !== 10) {
    return Response.json({ error: "Invalid audit ID" }, { status: 400 });
  }

  const audit = await kv.get(`audit:${id}`);
  if (!audit) {
    return Response.json({ error: "Audit not found" }, { status: 404 });
  }

  // If ?refresh=true and there are pending providers (or force=true for GTmetrix), re-run them
  const url = new URL(request.url);
  const shouldRefresh = url.searchParams.get("refresh") === "true";
  const forceRefresh = url.searchParams.get("force") === "true";

  // Force refresh: re-add gtmetrix to pending if test ID exists but data was never fetched
  if (shouldRefresh && forceRefresh && audit.gtmetrixTestId) {
    console.log(`[Refresh] Force refresh for audit ${id}, gtmetrixTestId: ${audit.gtmetrixTestId}`);
    if (!audit.pendingProviders) audit.pendingProviders = [];
    if (!audit.pendingProviders.includes("gtmetrix")) audit.pendingProviders.push("gtmetrix");
    if (audit.retryCounts) delete audit.retryCounts.gtmetrix;
  }

  if (shouldRefresh && audit.pendingProviders && audit.pendingProviders.length > 0) {
    const fullUrl = audit.meta?.url;
    if (!fullUrl) return Response.json(audit);

    const pending = new Set(audit.pendingProviders);
    const companyName = audit.meta?.companyName || "";

    const socialProfiles = audit.meta?.socialProfiles || {};

    // Re-run only failed providers (crawl provider disabled)
    const results = await Promise.allSettled([
      pending.has("pageSpeed") ? fetchPageSpeed(fullUrl) : Promise.resolve(null),
      pending.has("semrush") ? fetchSemrush(fullUrl) : Promise.resolve(null),
      pending.has("places") ? fetchPlacesData(companyName, fullUrl) : Promise.resolve(null),
      pending.has("entity") ? fetchEntityData(fullUrl, companyName, socialProfiles) : Promise.resolve(null),
      fetchSitemap(fullUrl, audit.meta?.blogUrl || null),
      checkUrl(`${fullUrl}/robots.txt`),
    ]);

    const ps = results[0].status === "fulfilled" && results[0].value ? results[0].value : null;
    const cr = null; // Crawl provider disabled
    // SEMrush can return an object with all nulls — check for real content
    const srRaw = results[1].status === "fulfilled" ? results[1].value : null;
    const sr = srRaw && (srRaw.domainAuthority || srRaw.backlinks || srRaw.topKeywords?.length > 0) ? srRaw : null;
    // Places can return { found: false } — check for actual data
    const plRaw = results[2].status === "fulfilled" ? results[2].value : null;
    const pl = plRaw && plRaw.found === true && plRaw.data ? plRaw : null;
    const entityRaw = results[3].status === "fulfilled" ? results[3].value : null;
    const sitemap = results[4].status === "fulfilled" ? results[4].value : null;
    const hasRobots = results[5].status === "fulfilled" && results[5].value;

    let updated = false;

    const hasSitemap = sitemap?.found === true;

    // GTmetrix deferred polling — check if stored test is complete
    let gt = null;
    if (pending.has("gtmetrix") && audit.gtmetrixTestId) {
      console.log(`[Refresh] Polling GTmetrix testId=${audit.gtmetrixTestId}, timeout=${forceRefresh ? 30000 : 15000}ms`);
      gt = await pollGTmetrixResult(audit.gtmetrixTestId, forceRefresh ? 30000 : 15000);
      console.log(`[Refresh] GTmetrix poll result: ${gt ? "DATA RECEIVED" : "null (still running or error)"}`);
    }

    // Rebuild only sections where we got new data
    if (ps && pending.has("pageSpeed")) {
      audit.webPerf = buildWebPerfMetrics(ps, cr || null, hasSitemap, audit.siteAudit || null, gt);
      audit.content = buildContentMetrics(cr || null, ps, entityRaw, sitemap);
      if (sr || audit.seo) {
        audit.seo = buildSEOMetrics(sr || null, sitemap, hasRobots, companyName);
      }
      pending.delete("pageSpeed");
      updated = true;
    }
    if (sr && pending.has("semrush")) {
      audit.seo = buildSEOMetrics(sr, sitemap, hasRobots, companyName);
      audit.keywords = buildKeywords(sr);
      pending.delete("semrush");
      updated = true;
    }
    if (pl && pending.has("places")) {
      audit.entity = buildEntityMetrics(pl, cr || null, entityRaw);
      audit.places = pl?.data || null;
      pending.delete("places");
      updated = true;
    }
    if (entityRaw && pending.has("entity")) {
      audit.entity = buildEntityMetrics(pl || null, cr || null, entityRaw);
      audit.content = buildContentMetrics(cr || null, ps || null, entityRaw, sitemap);
      audit.socialLocal = buildSocialMetrics(cr || null, entityRaw, sitemap, pl || null);
      audit.aiSeo = buildAISEOMetrics(cr || null, entityRaw);
      pending.delete("entity");
      updated = true;
    }
    if (gt && pending.has("gtmetrix")) {
      audit.webPerf = buildWebPerfMetrics(ps || null, cr || null, hasSitemap, audit.siteAudit || null, gt);
      if (gt.reportUrl) audit.gtmetrixReportUrl = gt.reportUrl;
      delete audit.gtmetrixTestId;
      pending.delete("gtmetrix");
      updated = true;
    }

    // Update pending list with retry tracking
    const retryCounts = audit.retryCounts || {};
    const remaining = [...pending];
    const stillPending = [];
    for (const provider of remaining) {
      retryCounts[provider] = (retryCounts[provider] || 0) + 1;
      if (retryCounts[provider] < 3) {
        stillPending.push(provider);
      } else {
        console.log(`[Refresh] Giving up on ${provider} after 3 retries for audit ${id}`);
        // Clean up orphaned test IDs for exhausted providers
        if (provider === "gtmetrix") delete audit.gtmetrixTestId;
      }
    }

    if (stillPending.length > 0) {
      audit.pendingProviders = stillPending;
      audit.retryCounts = retryCounts;
    } else {
      delete audit.pendingProviders;
      delete audit.retryCounts;
    }

    // Always save — either we got new data or we updated retry counts
    await kv.set(`audit:${id}`, audit);
  }

  return Response.json(audit);
}

export async function PATCH(request, { params }) {
  const { id } = params;

  if (!id || id.length !== 10) {
    return Response.json({ error: "Invalid audit ID" }, { status: 400 });
  }

  const audit = await kv.get(`audit:${id}`);
  if (!audit) {
    return Response.json({ error: "Audit not found" }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Merge recap data
  if (body.recap) {
    const validTabs = ["website", "seo", "content", "social", "local"];
    const sanitized = {};
    for (const tab of validTabs) {
      if (body.recap[tab]) {
        sanitized[tab] = {
          summary: typeof body.recap[tab].summary === "string" ? body.recap[tab].summary.slice(0, 1000) : undefined,
          risks: Array.isArray(body.recap[tab].risks) ? body.recap[tab].risks.slice(0, 5).map(r => String(r).slice(0, 300)) : undefined,
          opportunity: typeof body.recap[tab].opportunity === "string" ? body.recap[tab].opportunity.slice(0, 1000) : undefined,
        };
      }
    }
    audit.recap = { ...(audit.recap || {}), ...sanitized };
  }

  await kv.set(`audit:${id}`, audit);
  return Response.json({ ok: true, recap: audit.recap });
}
