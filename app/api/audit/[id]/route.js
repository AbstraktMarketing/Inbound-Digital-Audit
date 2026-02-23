import { kv } from "@vercel/kv";
import { fetchPageSpeed } from "../../providers/pagespeed.js";
import { fetchCrawlData } from "../../providers/crawl.js";
import { fetchSemrush } from "../../providers/semrush.js";
import { fetchPlacesData } from "../../providers/places.js";
import { buildWebPerfMetrics, buildSEOMetrics, buildKeywords, buildContentMetrics, buildSocialMetrics, buildAISEOMetrics, buildEntityMetrics, checkUrl } from "../route.js";

export async function GET(request, { params }) {
  const { id } = params;

  if (!id || id.length !== 10) {
    return Response.json({ error: "Invalid audit ID" }, { status: 400 });
  }

  const raw = await kv.get(`audit:${id}`);
  if (!raw) {
    return Response.json({ error: "Audit not found" }, { status: 404 });
  }

  const audit = typeof raw === "string" ? JSON.parse(raw) : raw;

  // If ?refresh=true and there are pending providers, re-run them
  const url = new URL(request.url);
  const shouldRefresh = url.searchParams.get("refresh") === "true";

  if (shouldRefresh && audit.pendingProviders && audit.pendingProviders.length > 0) {
    const fullUrl = audit.meta?.url;
    if (!fullUrl) return Response.json(audit);

    const pending = new Set(audit.pendingProviders);
    const companyName = audit.meta?.companyName || "";

    // Re-run only failed providers
    const results = await Promise.allSettled([
      pending.has("pageSpeed") ? fetchPageSpeed(fullUrl) : Promise.resolve(null),
      pending.has("crawl") ? fetchCrawlData(fullUrl) : Promise.resolve(null),
      pending.has("semrush") ? fetchSemrush(fullUrl) : Promise.resolve(null),
      pending.has("places") ? fetchPlacesData(companyName, fullUrl) : Promise.resolve(null),
    ]);

    const ps = results[0].status === "fulfilled" && results[0].value ? results[0].value : null;
    const cr = results[1].status === "fulfilled" && results[1].value ? results[1].value : null;
    // SEMrush can return an object with all nulls — check for real content
    const srRaw = results[2].status === "fulfilled" ? results[2].value : null;
    const sr = srRaw && (srRaw.domainAuthority || srRaw.backlinks || srRaw.topKeywords?.length > 0) ? srRaw : null;
    // Places can return { found: false } — check for actual data
    const plRaw = results[3].status === "fulfilled" ? results[3].value : null;
    const pl = plRaw && plRaw.found === true && plRaw.data ? plRaw : null;

    let updated = false;

    // Rebuild only sections where we got new data
    if (ps && pending.has("pageSpeed")) {
      const [sitemapCheck, robotsCheck] = await Promise.allSettled([checkUrl(`${fullUrl}/sitemap.xml`), checkUrl(`${fullUrl}/robots.txt`)]);
      const hasSitemap = sitemapCheck.status === "fulfilled" && sitemapCheck.value;
      const hasRobots = robotsCheck.status === "fulfilled" && robotsCheck.value;
      audit.webPerf = buildWebPerfMetrics(ps, cr || null);
      audit.content = buildContentMetrics(cr || null, ps);
      if (sr || audit.seo) {
        audit.seo = buildSEOMetrics(sr || null, hasSitemap, hasRobots);
      }
      pending.delete("pageSpeed");
      updated = true;
    }
    if (cr && pending.has("crawl")) {
      // Rebuild sections that depend on crawl
      audit.webPerf = buildWebPerfMetrics(ps || null, cr);
      audit.content = buildContentMetrics(cr, ps || null);
      audit.socialLocal = buildSocialMetrics(cr);
      audit.aiSeo = buildAISEOMetrics(cr);
      audit.entity = buildEntityMetrics(pl || null, cr);
      pending.delete("crawl");
      updated = true;
    }
    if (sr && pending.has("semrush")) {
      const [sitemapCheck, robotsCheck] = await Promise.allSettled([checkUrl(`${fullUrl}/sitemap.xml`), checkUrl(`${fullUrl}/robots.txt`)]);
      const hasSitemap = sitemapCheck.status === "fulfilled" && sitemapCheck.value;
      const hasRobots = robotsCheck.status === "fulfilled" && robotsCheck.value;
      audit.seo = buildSEOMetrics(sr, hasSitemap, hasRobots);
      audit.keywords = buildKeywords(sr);
      pending.delete("semrush");
      updated = true;
    }
    if (pl && pending.has("places")) {
      audit.entity = buildEntityMetrics(pl, cr || null);
      audit.places = pl?.data || null;
      pending.delete("places");
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
    await kv.set(`audit:${id}`, JSON.stringify(audit));
  }

  return Response.json(audit);
}

export async function PATCH(request, { params }) {
  const { id } = params;

  if (!id || id.length !== 10) {
    return Response.json({ error: "Invalid audit ID" }, { status: 400 });
  }

  const raw = await kv.get(`audit:${id}`);
  if (!raw) {
    return Response.json({ error: "Audit not found" }, { status: 404 });
  }

  const audit = typeof raw === "string" ? JSON.parse(raw) : raw;
  const body = await request.json();

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

  await kv.set(`audit:${id}`, JSON.stringify(audit));
  return Response.json({ ok: true, recap: audit.recap });
}
