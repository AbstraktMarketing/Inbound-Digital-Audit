// Main audit orchestration endpoint
// POST /api/audit — accepts form data including url, companyName, contactName, email, and business intelligence fields
// Returns unified audit data matching DigitalHealthAssessment.jsx metric format

import { fetchPageSpeed } from "../providers/pagespeed.js";
import { fetchSemrush, fetchSiteAudit } from "../providers/semrush.js";
import { fetchPlacesData } from "../providers/places.js";
import { fetchEntityData } from "../providers/entity.js";
import { fetchSitemap } from "../providers/sitemapCheck.js";
import { startGTmetrixTest, pollGTmetrixResult } from "../providers/gtmetrix.js";
import { appendAuditToSheet } from "../providers/sheets.js";
import { Redis } from "@upstash/redis";
const kv = Redis.fromEnv();

export const maxDuration = 300; // Pro plan: up to 5 minutes for all providers

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, companyName, contactName, email, phone, semrushProjectId, linkedinUrl, facebookUrl, blogUrl, goal, paidAds, monthlyTraffic, contactMethods, challenge, competitorUrl } = body;

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    // Run providers + checks in parallel — don't let one failure kill the whole audit
    // Note: crawl provider disabled — cr is always null
    const socialProfiles = { linkedin: linkedinUrl || "", facebook: facebookUrl || "" };

    const [pageSpeed, semrush, places, entityResult, sitemapResult, robotsCheck, gtStart] = await Promise.allSettled([
      fetchPageSpeed(fullUrl),
      fetchSemrush(fullUrl),
      fetchPlacesData(companyName || "", fullUrl),
      fetchEntityData(fullUrl, companyName || "", socialProfiles),
      fetchSitemap(fullUrl, blogUrl || null),
      checkUrl(`${fullUrl}/robots.txt`),
      startGTmetrixTest(fullUrl),
    ]);

    const ps = pageSpeed.status === "fulfilled" ? pageSpeed.value : null;
    const cr = null; // Crawl provider disabled
    const sr = semrush.status === "fulfilled" ? semrush.value : null;
    const pl = places.status === "fulfilled" ? places.value : null;
    const entity = entityResult.status === "fulfilled" ? entityResult.value : null;
    const sitemap = sitemapResult.status === "fulfilled" ? sitemapResult.value : null;

    // GTmetrix: test was started in parallel — now poll for result (up to 60s)
    const gtTestId = gtStart.status === "fulfilled" && gtStart.value ? gtStart.value.testId : null;
    let gt = null;
    if (gtTestId) {
      gt = await pollGTmetrixResult(gtTestId, 60000);
    }

    console.log(`[Audit] Provider results: ps=${!!ps}, sr=${!!sr}, pl=${!!pl}, entity=${!!entity}, sitemap=${sitemap?.found}, gt=${!!gt}`);
    console.log(`[Audit] Provider statuses: ps=${pageSpeed.status}, sr=${semrush.status}, pl=${places.status}`);
    if (pageSpeed.status === "rejected") console.error(`[Audit] PageSpeed error: ${pageSpeed.reason?.message}`);
    if (semrush.status === "rejected") console.error(`[Audit] SEMrush error: ${semrush.reason?.message}`);
    if (places.status === "rejected") console.error(`[Audit] Places error: ${places.reason?.message}`);
    if (entityResult.status === "rejected") console.error(`[Audit] Entity error: ${entityResult.reason?.message}`);
    if (sitemapResult.status === "rejected") console.error(`[Audit] Sitemap error: ${sitemapResult.reason?.message}`);
    if (sr) console.log(`[Audit] SEMrush data: da=${JSON.stringify(sr.domainAuthority)}, bl=${!!sr.backlinks}, kw=${sr.topKeywords?.length}, comp=${sr.competitors?.length}`);
    if (pl) console.log(`[Audit] Places data: found=${pl.found}, hasData=${!!pl.data}, name=${pl.data?.name}`);

    const hasSitemap = sitemap?.found === true;
    const hasRobots = robotsCheck.status === "fulfilled" && robotsCheck.value;

    // Fetch SEMrush Site Audit if project ID provided (separate call, not parallel — needs API key)
    let siteAudit = null;
    if (semrushProjectId) {
      try {
        siteAudit = await fetchSiteAudit(semrushProjectId);
        console.log(`[Audit] Site Audit: score=${siteAudit?.score}, errors=${siteAudit?.errors}, warnings=${siteAudit?.warnings}`);
      } catch (err) {
        console.error(`[Audit] Site Audit error: ${err.message}`);
      }
    }

    // --- Map to metric format ---
    const audit = {
      meta: { url: fullUrl, companyName, contactName, email, phone, semrushProjectId: semrushProjectId || null, socialProfiles, blogUrl: blogUrl || null, goal: goal || [], paidAds: paidAds || [], monthlyTraffic: monthlyTraffic || null, contactMethods: contactMethods || [], challenge: challenge || null, competitorUrl: competitorUrl || null, timestamp: new Date().toISOString() },
      webPerf: buildWebPerfMetrics(ps, cr, hasSitemap, siteAudit, gt),
      seo: buildSEOMetrics(sr, sitemap, hasRobots, companyName),
      keywords: buildKeywords(sr),
      content: buildContentMetrics(cr, ps, entity, sitemap),
      socialLocal: buildSocialMetrics(cr, entity, sitemap, pl),
      aiSeo: buildAISEOMetrics(cr, entity),
      entity: buildEntityMetrics(pl, cr, entity),
      places: pl?.data || null,
      siteAudit: siteAudit || null,
      errors: {
        pageSpeed: pageSpeed.status === "rejected" ? pageSpeed.reason?.message : null,
        semrush: semrush.status === "rejected" ? semrush.reason?.message : null,
        places: places.status === "rejected" ? places.reason?.message : null,
      },
    };

    // Track which providers need retry (returned null/empty or rejected)
    const pending = [];
    if (!ps) pending.push("pageSpeed");
    // SEMrush can return an object with all null properties — treat as missing
    const srHasData = sr && (sr.domainAuthority || sr.backlinks || sr.topKeywords?.length > 0);
    if (!srHasData) pending.push("semrush");
    // Places can return { found: false, data: null } — treat as missing
    const plHasData = pl && pl.found === true && pl.data;
    if (!plHasData) pending.push("places");
    if (!entity) pending.push("entity");
    if (!gt && gtTestId) {
      pending.push("gtmetrix");
      audit.gtmetrixTestId = gtTestId; // Store for deferred polling
      audit.gtmetrixReportUrl = `https://gtmetrix.com/reports/${gtTestId}`;
    }
    if (gt?.reportUrl) audit.gtmetrixReportUrl = gt.reportUrl;
    if (pending.length > 0) audit.pendingProviders = pending;

    // Store in KV with unique ID
    const id = generateId();
    audit.id = id;
    await kv.set(`audit:${id}`, audit);

    // Log to Google Sheets (fire-and-forget — don't block response)
    appendAuditToSheet(audit).catch(err => console.error("Sheets log failed:", err.message));

    return Response.json(audit);
  } catch (err) {
    console.error("Audit error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

function generateId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000), redirect: "follow" });
    return res.ok;
  } catch { return false; }
}

// ── Metric Builders ──
// Each returns { score, metrics[] } matching DigitalHealthAssessment.jsx format
// Metric shape: { label, value, status, detail, impact, weighted?, why, fix, expectedImpact, difficulty }

function toStatus(val, goodThresh, warnThresh, invert = false) {
  if (val === null || val === undefined) return "warning";
  if (invert) return val <= goodThresh ? "good" : val <= warnThresh ? "warning" : "poor";
  return val >= goodThresh ? "good" : val >= warnThresh ? "warning" : "poor";
}

function calcScore(metrics) {
  const sv = { good: 100, warning: 50, poor: 0 };
  const impactWeight = { high: 3, medium: 1.5, foundational: 1 };
  let totalWeight = 0, totalScore = 0;
  metrics.forEach(m => {
    const base = impactWeight[m.impact] || 1;
    const w = m.weighted ? base * 1.25 : base;
    totalWeight += w;
    totalScore += w * (sv[m.status] ?? 0);
  });
  return Math.round(totalScore / totalWeight);
}

function buildWebPerfMetrics(ps, cr, hasSitemap, siteAudit, gt) {
  const perfScore = ps?.performanceScore ?? null;
  const sslValid = cr?.ssl?.valid ?? ps?.isHttps ?? null;
  const http2 = cr?.http2 ?? null;
  const mobileFriendly = ps?.mobileFriendly ?? null;
  const altPct = cr?.images?.altPct ?? null;
  const totalImages = cr?.images?.total || ps?.imageOptimization?.totalImages || 0;
  const missingAlt = cr?.images?.missingAlt || ps?.imageAlt?.failingCount || 0;
  const imgExamples = cr?.images?.missingAltExamples || ps?.imageAlt?.failingExamples || [];
  const altScore = ps?.imageAlt?.score ?? null;
  const psImgExamples = ps?.imageOptimization?.examples || [];
  const largestRes = ps?.largestResources || [];
  const cwv = ps?.coreWebVitals || {};
  const blockingRes = ps?.blockingResources || [];
  const emptyLinks = cr?.content?.emptyLinks || ps?.links?.emptyAnchors || 0;

  // GTmetrix data
  const pageBytes = gt?.pageBytes ?? null;
  const pageRequests = gt?.pageRequests ?? null;
  const fullyLoaded = gt?.fullyLoadedTime ?? null;
  const ttfb = gt?.ttfb ?? null;
  const gtGrade = gt?.gtmetrixGrade ?? null;

  // Site Health: Use SEMrush Site Audit score if available
  const siteHealth = siteAudit?.score ?? null;
  const siteHealthSource = siteAudit ? "semrush" : null;

  // Build specific findings for site health
  const healthFindings = [];
  if (emptyLinks > 0) healthFindings.push(`${emptyLinks} empty or broken link${emptyLinks > 1 ? "s" : ""} found (href="#" or javascript:void)`);
  if (ps?.a11yIssues?.length > 0) ps.a11yIssues.forEach(i => healthFindings.push(`${i.issue}: ${i.count} instance${i.count > 1 ? "s" : ""}`));
  if (cr?.meta?.noindex || ps?.meta?.noindex) healthFindings.push("Homepage has a noindex tag \u2014 search engines are blocked from indexing it");

  // Speed findings
  const speedFindings = [];
  if (cwv.lcpFormatted) speedFindings.push(`Largest Contentful Paint: ${cwv.lcpFormatted} (target: under 2.5s)`);
  if (cwv.fcpFormatted) speedFindings.push(`First Contentful Paint: ${cwv.fcpFormatted}`);
  if (cwv.tbtFormatted) speedFindings.push(`Total Blocking Time: ${cwv.tbtFormatted}`);
  if (ps?.lcpElement) speedFindings.push(`LCP element: ${ps.lcpElement}`);
  if (fullyLoaded) speedFindings.push(`GTmetrix Fully Loaded: ${(fullyLoaded / 1000).toFixed(1)}s`);
  if (ttfb) speedFindings.push(`Time to First Byte: ${ttfb}ms`);
  if (gtGrade) speedFindings.push(`GTmetrix Grade: ${gtGrade}`);
  if (blockingRes.length > 0) speedFindings.push(`${blockingRes.length} render-blocking resource${blockingRes.length > 1 ? "s" : ""}: ${blockingRes.map(r => r.url).join(", ")}`);

  // Image findings
  const imgFindings = [];
  if (largestRes.length > 0) {
    const bigImages = largestRes.filter(r => r.type === "Image" || r.type === "image");
    if (bigImages.length > 0) imgFindings.push(...bigImages.map(r => `${r.url} (${r.sizeKB}KB)`));
  }
  if (psImgExamples.length > 0) imgFindings.push(...psImgExamples.map(e => `${e.url}${e.wastedBytes ? ` \u2014 save ~${e.wastedBytes}KB` : ""}`));

  // Alt tag findings
  const altFindings = imgExamples.length > 0 ? imgExamples.map(u => u) : [];

  const imgImprovePct = ps?.imageOptimization?.improvementPct ?? (totalImages > 0 ? Math.round((missingAlt / totalImages) * 100) : null);

  const metrics = [
    {
      label: "Site Health",
      value: siteHealth !== null ? `${siteHealth}%` : "Not Connected",
      status: siteHealth !== null ? toStatus(siteHealth, 90, 70) : "warning",
      detail: siteHealth !== null
        ? `SEMrush Site Audit: ${siteAudit.errors} errors, ${siteAudit.warnings} warnings across ${siteAudit.pagesCrawled} pages.`
        : "Requires SEMrush Project ID to pull live site health data.",
      weighted: true, impact: "high", findings: healthFindings,
      why: "Technical issues silently drive away prospects. Every crawl error or broken page is a potential customer who never sees your offer.",
      fix: "Run a full technical audit to identify and resolve broken links, redirect chains, and crawl errors.",
      expectedImpact: "A clean site means more prospects reach your conversion pages instead of bouncing.", difficulty: "Medium",
    },
    {
      label: "Page Speed & Performance", value: perfScore !== null ? `${perfScore}%` : "Not Connected", status: toStatus(perfScore, 90, 50),
      detail: ps ? `Desktop: ${ps.desktopScore}% | Mobile: ${ps.mobileScore}%` : "PageSpeed Insights data unavailable.",
      impact: "high", findings: speedFindings,
      why: "53% of mobile visitors abandon pages that take over 3 seconds. Every second of delay costs you leads.",
      fix: "Compress images, implement lazy loading, enable browser caching, and defer non-critical JavaScript.",
      expectedImpact: "Sub-3-second loads can cut bounce rates by 20-30% \u2014 more visitors staying means more pipeline.", difficulty: "Medium",
    },
    {
      label: "Mobile Optimization", value: mobileFriendly === true ? "Yes" : mobileFriendly === false ? "No" : "Not Connected",
      status: mobileFriendly === true ? "good" : mobileFriendly === false ? "poor" : "warning",
      detail: ps ? `Mobile score: ${ps.mobileScore}% | Desktop score: ${ps.desktopScore}%` : "PageSpeed Insights data unavailable.",
      impact: "foundational",
      why: "Google uses mobile-first indexing \u2014 your mobile site IS your site for ranking purposes.",
      fix: mobileFriendly ? "No action needed." : "Implement responsive design and fix mobile usability issues.",
      expectedImpact: "Maintains eligibility for mobile search rankings (60%+ of all searches).", difficulty: mobileFriendly ? "N/A" : "Medium",
    },
    {
      label: "Security & SSL", value: sslValid === true ? "Valid" : sslValid === false ? "Invalid" : "Not Connected",
      status: sslValid === true ? "good" : sslValid === false ? "poor" : "warning",
      detail: sslValid === true ? "HTTPS is active and certificate is valid." : sslValid === false ? "Site is not served over HTTPS \u2014 browsers will flag it as insecure." : "SSL data unavailable.",
      impact: "foundational",
      why: "SSL is a ranking signal and browsers flag non-secure sites with warnings.",
      fix: sslValid ? "No action needed. Ensure certificate auto-renews." : "Install an SSL certificate immediately.",
      expectedImpact: "Maintains trust signals and prevents browser security warnings.", difficulty: sslValid ? "N/A" : "Low",
    },
    {
      label: "HTTP/2 Support", value: http2 === true ? "Enabled" : http2 === false ? "Not Detected" : "Not Connected",
      status: http2 === true ? "good" : http2 === false ? "warning" : "warning",
      detail: "HTTP/2 enables multiplexed connections for faster page delivery.", impact: "foundational",
      why: "HTTP/2 reduces page load times significantly over HTTP/1.1.",
      fix: http2 ? "No action needed." : "Enable HTTP/2 on your web server.",
      expectedImpact: "Faster page delivery, especially for resource-heavy pages.", difficulty: http2 ? "N/A" : "Low",
    },
    {
      label: "Image Optimization",
      value: imgImprovePct !== null ? `${imgImprovePct}% Improvement Needed` : "Not Connected",
      status: toStatus(imgImprovePct, 10, 30, true),
      detail: totalImages > 0 ? `${totalImages} images detected on homepage.` : "Image audit data.",
      impact: "high", findings: imgFindings.slice(0, 5),
      why: "Unoptimized images are the #1 cause of slow page loads.",
      fix: "Convert images to WebP, implement responsive srcset, and compress all images above 100KB.",
      expectedImpact: "Can reduce page load time by 40-60% on image-heavy pages.", difficulty: "Low",
    },
    {
      label: "Alt Tags",
      value: altScore !== null
        ? (missingAlt > 0 ? `${missingAlt} missing alt tags` : "All present")
        : (altPct !== null ? `${missingAlt} of ${totalImages} missing` : "Not Connected"),
      status: altScore !== null
        ? (altScore === 1 ? "good" : altScore >= 0.5 ? "warning" : "poor")
        : toStatus(altPct, 10, 30, true),
      detail: altScore !== null
        ? (missingAlt > 0 ? `${missingAlt} image${missingAlt > 1 ? "s" : ""} missing alt text.` : "All images have descriptive alt text.")
        : (altPct !== null ? `${altPct}% of images are missing alt text.` : "Alt tag data unavailable."),
      impact: "medium", findings: altFindings.slice(0, 5),
      why: "Alt tags enable image search rankings and are required for ADA/WCAG compliance.",
      fix: "Add descriptive, keyword-relevant alt text to each image.",
      expectedImpact: "Opens traffic channels through Google Image Search.", difficulty: "Low",
    },
    {
      label: "Page Weight",
      value: pageBytes !== null ? `${(pageBytes / 1048576).toFixed(1)} MB` : "Not Connected",
      status: pageBytes !== null ? (pageBytes <= 2097152 ? "good" : pageBytes <= 5242880 ? "warning" : "poor") : "warning",
      detail: pageBytes !== null ? `Total page size: ${(pageBytes / 1048576).toFixed(1)} MB (target: under 2 MB).` : "Requires GTmetrix data.",
      impact: "high",
      why: "Heavy pages drain mobile data and load slowly on poor connections — prospects leave before they see your value.",
      fix: "Audit large assets (images, videos, scripts), compress aggressively, and remove unused resources.",
      expectedImpact: "Pages under 2 MB load 2-3x faster on mobile networks.", difficulty: "Medium",
    },
    {
      label: "HTTP Requests",
      value: pageRequests !== null ? `${pageRequests} requests` : "Not Connected",
      status: pageRequests !== null ? (pageRequests <= 50 ? "good" : pageRequests <= 100 ? "warning" : "poor") : "warning",
      detail: pageRequests !== null ? `${pageRequests} HTTP requests to load the page (target: under 50).` : "Requires GTmetrix data.",
      impact: "medium",
      why: "Each HTTP request adds latency. Fewer requests means faster perceived load time.",
      fix: "Combine CSS/JS files, use CSS sprites, inline critical resources, and remove unused scripts.",
      expectedImpact: "Reducing requests under 50 can cut load times significantly.", difficulty: "Medium",
    },
    {
      label: "Fully Loaded Time",
      value: fullyLoaded !== null ? `${(fullyLoaded / 1000).toFixed(1)}s` : "Not Connected",
      status: fullyLoaded !== null ? (fullyLoaded <= 3000 ? "good" : fullyLoaded <= 6000 ? "warning" : "poor") : "warning",
      detail: fullyLoaded !== null ? `Page fully loaded in ${(fullyLoaded / 1000).toFixed(1)} seconds (target: under 3s).` : "Requires GTmetrix data.",
      impact: "high",
      why: "Fully loaded time is what your prospects actually experience. Beyond 3 seconds, conversion rates drop sharply.",
      fix: "Optimize server response, reduce third-party scripts, and implement lazy loading.",
      expectedImpact: "Sub-3-second loads can boost conversions by 20%+.", difficulty: "Medium",
    },
    {
      label: "Time to First Byte",
      value: ttfb !== null ? `${ttfb}ms` : "Not Connected",
      status: ttfb !== null ? (ttfb <= 200 ? "good" : ttfb <= 600 ? "warning" : "poor") : "warning",
      detail: ttfb !== null ? `Server responded in ${ttfb}ms (target: under 200ms).` : "Requires GTmetrix data.",
      impact: "medium",
      why: "TTFB measures server responsiveness — slow TTFB delays everything else.",
      fix: "Upgrade hosting, enable server-side caching, and optimize database queries.",
      expectedImpact: "Fast TTFB ensures the rest of the page can start loading quickly.", difficulty: "Medium",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

function buildSEOMetrics(sr, sitemap, hasRobots, companyName) {
  const hasSitemap = sitemap?.found === true;
  const da = sr?.domainAuthority;
  const bl = sr?.backlinks;
  const kwCount = da?.organicKeywords ?? null;
  const traffic = da?.organicTraffic ?? null;
  const totalBacklinks = bl?.totalBacklinks ?? null;
  const refDomains = bl?.referringDomains ?? null;
  const competitors = sr?.competitors || [];
  const topKw = sr?.topKeywords || [];
  const trafficCost = da?.organicCost ?? null;
  const rankHistory = sr?.rankHistory || [];
  const paidKw = sr?.paidKeywords || [];
  const paidComp = sr?.paidCompetitors || [];
  const adwordsKw = da?.adwordsKeywords ?? 0;
  const adwordsTraffic = da?.adwordsTraffic ?? 0;
  const adwordsCost = da?.adwordsCost ?? 0;

  const rank = da?.rank ?? 0;
  const estimatedDA = rank > 0 ? Math.min(100, Math.max(1, Math.round(100 - Math.log10(rank) * 15))) : null;
  const indexation = null;

  // Branded traffic % — check how many top keywords contain brand name
  let brandedPct = null;
  if (topKw.length > 0 && companyName) {
    const brandTerms = companyName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const brandedKws = topKw.filter(kw => {
      const kwLower = kw.keyword.toLowerCase();
      return brandTerms.some(term => kwLower.includes(term));
    });
    const brandedTraffic = brandedKws.reduce((sum, kw) => sum + (kw.traffic || 0), 0);
    const totalTraffic = topKw.reduce((sum, kw) => sum + (kw.traffic || 0), 0);
    brandedPct = totalTraffic > 0 ? Math.round((brandedTraffic / totalTraffic) * 100) : 0;
  }

  // Traffic trend — compare most recent month vs 3 months ago
  let trafficTrend = null;
  if (rankHistory.length >= 4) {
    const recent = rankHistory[0]?.organicTraffic || 0;
    const older = rankHistory[3]?.organicTraffic || 0;
    if (older > 0) {
      trafficTrend = Math.round(((recent - older) / older) * 100);
    }
  }

  // Keyword findings — show actual top keywords with positions
  const kwFindings = [];
  if (topKw.length > 0) {
    const top3 = topKw.slice(0, 3);
    top3.forEach(kw => kwFindings.push(`"${kw.keyword}" \u2014 position #${kw.position} (${kw.volume.toLocaleString()} monthly searches)`));
    if (trafficCost) kwFindings.push(`Organic traffic value: $${Math.round(trafficCost).toLocaleString()}/mo`);
    if (trafficTrend !== null) {
      const arrow = trafficTrend >= 0 ? "\u2191" : "\u2193";
      kwFindings.push(`Traffic trend (3mo): ${arrow} ${Math.abs(trafficTrend)}%`);
    }
  }

  // Competitor findings (auto-discovered by SEMrush)
  const compFindings = [];
  if (competitors.length > 0) {
    competitors.slice(0, 3).forEach(c => {
      if (c.commonKeywords && c.organicTraffic) {
        compFindings.push(`${c.domain} \u2014 ${c.commonKeywords.toLocaleString()} shared keywords, ${c.organicTraffic.toLocaleString()} monthly traffic`);
      }
    });
  }

  // Backlink findings
  const blFindings = [];
  if (bl) {
    if (bl.followLinks && bl.nofollowLinks) blFindings.push(`${bl.followLinks.toLocaleString()} dofollow / ${bl.nofollowLinks.toLocaleString()} nofollow links`);
    if (refDomains) blFindings.push(`${refDomains.toLocaleString()} unique referring domains`);
  }

  // Paid search findings
  const paidFindings = [];
  if (paidKw.length > 0) {
    paidKw.slice(0, 3).forEach(kw => paidFindings.push(`"${kw.keyword}" \u2014 CPC $${kw.cpc.toFixed(2)} (${kw.volume.toLocaleString()} monthly searches)`));
  }
  if (adwordsCost > 0) paidFindings.push(`Estimated PPC spend: $${Math.round(adwordsCost).toLocaleString()}/mo`);

  // PPC competitor findings
  const ppcCompFindings = [];
  if (paidComp.length > 0) {
    paidComp.slice(0, 3).forEach(c => {
      ppcCompFindings.push(`${c.domain} \u2014 ${c.commonKeywords.toLocaleString()} shared paid keywords`);
    });
  }

  const metrics = [
    {
      label: "Organic Keywords", value: kwCount !== null ? kwCount.toLocaleString() : "Not Connected",
      status: kwCount !== null ? toStatus(kwCount, 500, 200) : "warning",
      detail: kwCount !== null
        ? (traffic ? `${kwCount.toLocaleString()} keywords driving ~${traffic.toLocaleString()} monthly visits.` : `${kwCount.toLocaleString()} keywords ranking.`)
        : "SEMrush data unavailable for this domain. This may indicate a newer or very small domain.",
      impact: "high", estimated: kwCount === null, findings: kwFindings,
      why: "Every keyword you don't rank for is a buyer choosing a competitor. High-intent keywords convert at 3-5x the rate of outbound leads.",
      fix: competitors.length > 0 ? `Close the keyword gap against ${competitors[0].domain} and ${competitors.length > 1 ? competitors[1].domain : "other competitors"} to capture their traffic.` : "Identify high-value keywords your competitors rank for and build content to claim those positions.",
      expectedImpact: "Capturing high-intent keywords means more qualified prospects finding you instead of your competitors.", difficulty: "Medium",
    },
    {
      label: "Branded Traffic Share", value: brandedPct !== null ? `${brandedPct}%` : "Not Connected",
      status: brandedPct !== null ? toStatus(brandedPct, 35, 20) : "warning",
      detail: brandedPct !== null
        ? `${brandedPct}% of top keyword traffic is brand-related.`
        : "Branded traffic data requires company name and keyword data.",
      impact: "high", estimated: brandedPct === null,
      why: "When prospects Google your company name and find little, trust drops before your sales team gets a chance.",
      fix: "Invest in brand visibility \u2014 PR mentions, thought leadership, and consistent content that makes your name recognizable.",
      expectedImpact: "Strong branded search means warmer prospects and shorter sales cycles.", difficulty: "High",
    },
    {
      label: "Indexation Efficiency", value: indexation !== null ? `${indexation}%` : "Not Connected",
      status: indexation !== null ? toStatus(indexation, 90, 70) : "warning",
      detail: "Connect Search Console for exact indexation data.", impact: "high",
      estimated: indexation === null,
      why: "If Google hasn't indexed a page, it cannot appear in search results.",
      fix: "Review unindexed pages for thin content, crawl blocks, or noindex tags.",
      expectedImpact: "Indexing all quality pages could unlock additional ranking opportunities.", difficulty: "Low",
    },
    {
      label: "Domain Authority Score", value: estimatedDA !== null ? `${estimatedDA}/100` : "Not Connected",
      status: estimatedDA !== null ? toStatus(estimatedDA, 50, 30) : "warning",
      detail: rank > 0 ? `SEMrush rank: #${rank.toLocaleString()} globally.` : "SEMrush data unavailable for this domain.",
      impact: "medium", estimated: estimatedDA === null, findings: compFindings,
      why: "Higher authority means your pages outrank competitors for the same keywords \u2014 you get the click, they don't.",
      fix: "Build high-quality backlinks through guest posts, digital PR, and industry partnerships.",
      expectedImpact: "Reaching DA 45+ would significantly improve ranking potential.", difficulty: "High",
    },
    {
      label: "Backlink Profile", value: totalBacklinks !== null ? totalBacklinks.toLocaleString() : "Not Connected",
      status: totalBacklinks !== null ? toStatus(totalBacklinks, 1000, 200) : "warning",
      detail: totalBacklinks !== null
        ? (refDomains ? `${totalBacklinks.toLocaleString()} total links from ${refDomains.toLocaleString()} domains.` : `${totalBacklinks.toLocaleString()} total backlinks.`)
        : "Backlink data unavailable. SEMrush may not have data for this domain yet.",
      impact: "medium", estimated: totalBacklinks === null, findings: blFindings,
      why: "Quality backlinks are endorsements that tell Google to rank you higher. More trusted links = more traffic your competitors lose.",
      fix: "Disavow toxic links and pursue link-building campaigns targeting high-authority domains.",
      expectedImpact: "Improving link quality can lift rankings for mid-to-high difficulty keywords.", difficulty: "High",
    },
    {
      label: "Paid Search Keywords", value: adwordsKw > 0 ? adwordsKw.toLocaleString() : "Not Detected",
      status: adwordsKw > 0 ? "good" : "warning",
      detail: adwordsKw > 0
        ? `${adwordsKw.toLocaleString()} paid keywords driving ~${adwordsTraffic.toLocaleString()} monthly visits ($${Math.round(adwordsCost).toLocaleString()}/mo spend).`
        : "No active paid search campaigns detected.",
      impact: "medium", estimated: false, findings: paidFindings,
      why: "Paid search captures high-intent buyers who are actively searching for your solution right now.",
      fix: adwordsKw > 0 ? "Review keyword performance and reallocate budget to highest-converting terms." : "Consider launching paid search campaigns for high-intent buyer keywords.",
      expectedImpact: "Well-optimized PPC campaigns deliver immediate qualified traffic.", difficulty: "Medium",
    },
    {
      label: "XML Sitemap Status", value: hasSitemap ? `Found (${sitemap.totalPages} pages)` : "Not Found", status: hasSitemap ? "good" : "poor",
      detail: hasSitemap ? `Sitemap found at ${sitemap.location} with ${sitemap.totalPages} indexed pages.` : "No sitemap found.",
      impact: "foundational",
      why: "A sitemap helps search engines discover and understand the structure of your site.",
      fix: hasSitemap ? "No action needed." : "Create and submit an XML sitemap.",
      expectedImpact: "Maintains efficient crawl discovery.", difficulty: hasSitemap ? "N/A" : "Low",
    },
    {
      label: "Robots.txt Configuration", value: hasRobots ? "Yes" : "Not Found", status: hasRobots ? "good" : "warning",
      detail: hasRobots ? "Crawl directives found." : "No robots.txt found.",
      impact: "foundational",
      why: "Robots.txt controls which pages search engines can access.",
      fix: hasRobots ? "No action needed." : "Create a robots.txt file.",
      expectedImpact: "Ensures search engines can access all important pages.", difficulty: hasRobots ? "N/A" : "Low",
    },
  ];

  return { score: calcScore(metrics), metrics, rankHistory, paidKeywords: paidKw, paidCompetitors: paidComp };
}

function buildKeywords(sr) {
  if (!sr?.topKeywords?.length) return [];
  return sr.topKeywords.map(kw => ({
    keyword: kw.keyword,
    position: kw.position,
    volume: kw.volume,
    traffic: kw.traffic,
    difficulty: kw.difficulty,
  }));
}

function buildContentMetrics(cr, ps, entity, sitemap) {
  // Blog detection from sitemap provider (primary) or crawl fallback
  const blogDetected = sitemap?.blogDetected === true || cr?.blog?.detected === true;
  const blogCount = sitemap?.blogUrls || 0;

  // Content freshness from sitemap lastmod dates
  const mostRecentDate = sitemap?.mostRecentBlogDate || sitemap?.lastModified || null;
  let lastPostDays = null;
  if (mostRecentDate) {
    const d = new Date(mostRecentDate);
    if (!isNaN(d.getTime())) lastPostDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  // Blog sample titles from sitemap provider
  const blogSample = sitemap?.blogSample || [];

  // Meta description from PSI
  const metaDesc = ps?.meta?.description || null;
  const metaLen = ps?.meta?.descriptionLength || 0;
  const hasMetaDesc = !!metaDesc || ps?.meta?.hasDescription || false;
  const titleText = ps?.meta?.title || null;
  const titleLen = ps?.meta?.titleLength || 0;

  // H1 from entity provider
  const blocked = entity?.blocked === true;
  const h1Text = entity?.h1?.text || null;
  const hasH1 = entity?.h1?.hasH1 ?? null;
  const multiH1 = entity?.h1?.multipleH1 ?? false;

  // Link text quality from PSI
  const nonDescriptiveLinks = ps?.links?.nonDescriptiveLinks ?? null;

  // Blog findings
  const blogFindings = [];
  if (blogDetected && blogCount > 0) blogFindings.push(`${blogCount} blog/content URLs found in sitemap`);
  if (blogSample.length > 0) blogSample.forEach(s => blogFindings.push(`Recent post: "${s.title || s.url}"`));
  if (blogDetected && !mostRecentDate) blogFindings.push("Blog URLs found but no dates available in sitemap");

  // Meta description findings
  const metaFindings = [];
  if (metaDesc) {
    metaFindings.push(`Your meta description: "${metaDesc.length > 120 ? metaDesc.substring(0, 117) + "..." : metaDesc}"`);
    if (metaLen < 120) metaFindings.push(`Length: ${metaLen} chars \u2014 consider expanding to 150-160 chars for full SERP display`);
    else if (metaLen > 160) metaFindings.push(`Length: ${metaLen} chars \u2014 may be truncated in search results (target: 150-160)`);
    else metaFindings.push(`Length: ${metaLen} chars \u2014 good length for search results`);
  } else if (hasMetaDesc) {
    metaFindings.push("Meta description is present on the homepage");
  } else {
    metaFindings.push("No meta description found on homepage \u2014 Google will auto-generate one from page content");
  }

  // H1 findings
  const h1Findings = [];
  if (h1Text) h1Findings.push(`Your H1: "${h1Text}"`);
  if (multiH1) h1Findings.push("Multiple H1 tags detected \u2014 best practice is one H1 per page");
  if (titleText) h1Findings.push(`Page title: "${titleText.length > 80 ? titleText.substring(0, 77) + "..." : titleText}" (${titleLen} chars)`);

  // Link text findings
  const linkFindings = [];
  if (nonDescriptiveLinks !== null) {
    if (nonDescriptiveLinks === 0) linkFindings.push("All links use descriptive anchor text");
    else linkFindings.push(`${nonDescriptiveLinks} link(s) use generic text like "click here" or "read more"`);
  }

  const freshStatus = lastPostDays !== null ? (lastPostDays <= 14 ? "good" : lastPostDays <= 45 ? "warning" : "poor") : "warning";
  const metaStatus = metaDesc ? (metaLen >= 120 && metaLen <= 160 ? "good" : "warning") : (hasMetaDesc ? "good" : "poor");

  const metrics = [
    {
      label: "Blog Page Exists",
      value: sitemap ? (blogDetected ? `Yes (${blogCount} posts)` : "Not Found") : "Not Connected",
      status: sitemap ? (blogDetected ? "good" : "poor") : "warning",
      detail: blogDetected ? `${blogCount} blog/content URLs found in sitemap.` : (sitemap ? "No blog, news, or resource URLs found in sitemap." : "Sitemap data unavailable."),
      weighted: true, impact: "foundational",
      why: "A blog is the foundation for content marketing.", fix: blogDetected ? "No action needed." : "Create a blog section for ongoing content.",
      expectedImpact: "Provides infrastructure for ongoing content strategy.", difficulty: blogDetected ? "N/A" : "Medium",
    },
    {
      label: "Content Freshness",
      value: lastPostDays !== null ? `${lastPostDays} days since last update` : "Not Connected",
      status: freshStatus,
      detail: lastPostDays !== null
        ? (lastPostDays <= 14 ? "Content is being published regularly." : lastPostDays <= 45 ? "Content is aging \u2014 search engines favor active publishers." : "Stale content signals an inactive site to search engines.")
        : (blogDetected ? "Blog URLs found but no dates available in sitemap." : "No content dates available."),
      weighted: true, impact: "high", findings: blogFindings,
      why: "Stale content signals an inactive business. Prospects researching you see outdated pages and move on to competitors who look alive.",
      fix: "Publish at least 2x/month with keyword-targeted content that answers your buyers' real questions.",
      expectedImpact: "Active publishers see 20-40% more organic traffic \u2014 that's qualified leads finding you on autopilot.", difficulty: "Medium",
    },
    {
      label: "Meta Descriptions",
      value: metaDesc ? `${metaLen} chars` : (hasMetaDesc ? "Present" : "Missing"),
      status: metaStatus,
      detail: metaDesc ? "Homepage meta description found." : (hasMetaDesc ? "Meta description detected on homepage." : "No meta description on homepage \u2014 Google will auto-generate one."),
      impact: "high", findings: metaFindings,
      why: "Your meta description is your ad copy in search results. A weak one means prospects scroll past you to a competitor.",
      fix: "Write compelling meta descriptions that sell the click \u2014 prioritize high-traffic pages first.",
      expectedImpact: "Better descriptions can lift click-through rates 5-10% \u2014 more clicks from the same rankings.", difficulty: "Low",
    },
    {
      label: "H1 Tags",
      value: blocked ? "Site Blocked Analysis" : (hasH1 === true ? (multiH1 ? "Multiple Found" : "Present") : hasH1 === false ? "Missing" : "Not Connected"),
      status: blocked ? "warning" : (hasH1 ? (multiH1 ? "warning" : "good") : "poor"),
      detail: blocked ? "Site security prevented H1 analysis." : (hasH1 ? (multiH1 ? "Multiple H1 tags detected \u2014 use only one per page." : "Homepage has a single, proper H1 tag.") : "No H1 heading found on homepage."),
      impact: "foundational", findings: h1Findings,
      why: "H1 tags tell search engines the primary topic of each page.",
      fix: hasH1 ? (multiH1 ? "Consolidate to a single H1 per page." : "No action needed.") : "Add a unique H1 heading to every page.",
      expectedImpact: "Clear page topic signals for search engines.", difficulty: hasH1 && !multiH1 ? "N/A" : "Low",
    },
    {
      label: "Link Text Quality",
      value: nonDescriptiveLinks !== null ? (nonDescriptiveLinks === 0 ? "Good" : `${nonDescriptiveLinks} issue(s)`) : "Not Connected",
      status: nonDescriptiveLinks !== null ? (nonDescriptiveLinks === 0 ? "good" : nonDescriptiveLinks <= 3 ? "warning" : "poor") : "warning",
      detail: nonDescriptiveLinks !== null ? (nonDescriptiveLinks === 0 ? "All links use descriptive anchor text." : `${nonDescriptiveLinks} link(s) use non-descriptive text like "click here" or "read more".`) : "Link text analysis unavailable.",
      impact: "medium", findings: linkFindings,
      why: "Descriptive link text helps search engines understand linked pages and improves accessibility.",
      fix: nonDescriptiveLinks > 0 ? "Replace generic link text with descriptive phrases that tell users and search engines what to expect." : "No action needed.",
      expectedImpact: "Better anchor text improves crawl context and accessibility.", difficulty: "Low",
    },
    {
      label: "Avg. Time on Page", value: "Not Connected", status: "warning",
      detail: "Requires Google Analytics integration.", impact: "medium",      why: "Low time on page suggests content isn't engaging visitors.",
      fix: "Improve content depth, add visuals, and use better formatting.",
      expectedImpact: "Reaching 2m+ avg can improve engagement signals.", difficulty: "Medium",
    },
    {
      label: "Bounce Rate", value: "Not Connected", status: "warning",
      detail: "Requires Google Analytics integration.", impact: "high",      why: "A high bounce rate means you're paying to get visitors who leave without converting. That's wasted budget.",
      fix: "Speed up your site, strengthen your above-the-fold messaging, and add clear next steps on every page.",
      expectedImpact: "Cutting bounce rate below 50% means more of your existing traffic converts \u2014 without spending more.", difficulty: "Medium",
    },
    {
      label: "Readability Score", value: "Not Connected", status: "warning",
      detail: "Full readability analysis requires content parsing.", impact: "medium",      why: "Complex content limits your audience.",
      fix: "Simplify sentence structure and replace jargon with plain language.",
      expectedImpact: "Broader accessibility can increase engagement.", difficulty: "Low",
    },
    {
      label: "Duplicate Content", value: "Not Connected", status: "warning",
      detail: "Full duplicate analysis requires multi-page crawl.", impact: "high",      why: "Duplicate content confuses search engines about which page to rank.",
      fix: "Write unique content for each page and add canonical tags.",
      expectedImpact: "Resolving duplicates allows proper indexation.", difficulty: "Low",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

function buildSocialMetrics(cr, entity, sitemap, pl) {
  const blocked = entity?.blocked === true;
  const og = entity?.openGraph || cr?.openGraph || {};
  const tw = entity?.twitterCards || cr?.twitterCards || {};
  const missingOg = og.missingTags || [];
  const missingTw = tw.missingTags || [];
  const hasEntityData = !!entity && !blocked;

  // Social share buttons from sitemap blog sampling
  const share = sitemap?.socialShareButtons || {};
  const shareChecked = share.postsChecked > 0;

  // OG findings
  const ogFindings = [];
  if (missingOg.length > 0) ogFindings.push(`Missing tags: ${missingOg.join(", ")}`);
  if (og.actualTitle) ogFindings.push(`og:title is set to: "${og.actualTitle.length > 80 ? og.actualTitle.substring(0, 77) + "..." : og.actualTitle}"`);
  if (og.complete) ogFindings.push("All Open Graph tags are properly configured");

  // Twitter findings
  const twFindings = [];
  if (missingTw.length > 0) twFindings.push(`Missing tags: ${missingTw.join(", ")}`);

  // Share button findings
  const shareFindings = [];
  if (shareChecked) {
    shareFindings.push(`Checked ${share.postsChecked} blog post(s) — ${share.postsWithButtons} had share buttons`);
    if (share.platforms.length > 0) shareFindings.push(`Platforms detected: ${share.platforms.join(", ")}`);
    if (share.method) shareFindings.push(`Widget: ${share.method}`);
  }

  const noData = !hasEntityData && !cr;

  const signals = [
    {
      label: "Open Graph Tags",
      value: blocked ? "Site Blocked Analysis" : noData ? "Not Connected" : og.complete ? "Complete" : og.title || og.description ? "Partial" : "Missing",
      status: blocked ? "warning" : noData ? "warning" : og.complete ? "good" : og.title || og.description ? "warning" : "poor",
      detail: blocked ? "Site security prevented OG tag analysis." : noData ? "Open Graph data unavailable." : og.complete ? "All OG tags present \u2014 links will display rich previews when shared." : missingOg.length > 0 ? `Missing: ${missingOg.join(", ")}` : "OG tags not detected.",
      impact: "medium", findings: ogFindings,
      why: "When someone shares your link and it shows a broken preview, it kills credibility before the click happens.",
      fix: missingOg.length > 0 ? `Add ${missingOg.join(", ")} to your homepage and key pages.` : "Add og:title, og:description, and og:image tags to all pages.",
      expectedImpact: "Rich social previews can increase CTR from social shares by 2-3x.", difficulty: "Low",
    },
    {
      label: "Twitter Cards",
      value: blocked ? "Site Blocked Analysis" : noData ? "Not Connected" : tw.complete ? "Complete" : tw.card ? "Partial" : "Missing",
      status: blocked ? "warning" : noData ? "warning" : tw.complete ? "good" : tw.card ? "warning" : "poor",
      detail: blocked ? "Site security prevented Twitter Card analysis." : noData ? "Twitter Card data unavailable." : tw.complete ? "Twitter Card meta tags properly configured." : missingTw.length > 0 ? `Missing: ${missingTw.join(", ")}` : "No twitter:card meta tags found.",
      impact: "medium", findings: twFindings,
      why: "Twitter Cards create rich media previews when links are shared on X.",
      fix: missingTw.length > 0 ? `Add ${missingTw.join(", ")} meta tags.` : "Add twitter:card, twitter:title, and twitter:image meta tags.",
      expectedImpact: "Enables rich previews on X.", difficulty: "Low",
    },
    {
      label: "Social Share Buttons",
      value: shareChecked ? (share.detected ? "Detected" : "Not Detected") : "Not Connected",
      status: shareChecked ? (share.detected ? "good" : "poor") : "warning",
      detail: shareChecked
        ? (share.detected ? `Share buttons found on ${share.postsWithButtons} of ${share.postsChecked} blog posts${share.method ? ` (${share.method})` : ""}.` : `No share buttons found on ${share.postsChecked} sampled blog post(s).`)
        : (sitemap?.blogDetected ? "Blog posts could not be sampled." : "No blog posts available to check for share buttons."),
      impact: "medium", findings: shareFindings,
      why: "Without share buttons, visitors have no easy way to spread your content.",
      fix: "Add social share buttons to blog posts and key landing pages.",
      expectedImpact: "Pages with share buttons receive 7x more social engagement.", difficulty: "Low",
    },
    {
      label: "Brand Consistency", value: "Not Connected", status: "warning",
      detail: "Requires cross-platform analysis.", impact: "high",      why: "Inconsistent branding across platforms weakens brand recognition.",
      fix: "Standardize profile images, bios, and brand messaging across all platforms.",
      expectedImpact: "Consistent branding increases revenue by up to 23%.", difficulty: "Low",
    },
  ];

  // Build platforms from real data
  const placeData = pl?.data || null;
  const sameAs = entity?.schema?.sameAsLinks || [];
  const dirs = entity?.directories || [];

  // Google Business Profile from Places API
  const gbpPlatform = placeData
    ? { name: "Google Business", status: placeData.name ? "Verified" : "Listed", followers: placeData.reviewCount ? `${placeData.reviewCount} reviews` : "—", activity: placeData.rating ? `${placeData.rating} rating` : "Active", health: placeData.rating >= 4 ? "good" : placeData.rating >= 3 ? "warning" : "poor" }
    : { name: "Google Business", status: "Not Connected", followers: "—", activity: "Not found in Places API", health: "warning" };

  // LinkedIn — check entity directories, sameAs, or form input
  const linkedinDir = dirs.find(d => d.name === "LinkedIn");
  const linkedinSameAs = sameAs.find(u => u.includes("linkedin.com"));
  const linkedinPlatform = linkedinDir?.found || linkedinSameAs
    ? { name: "LinkedIn", status: "Verified", followers: "—", activity: linkedinDir?.profileUrl || linkedinSameAs || "Profile found", health: "good" }
    : { name: "LinkedIn", status: "Not Connected", followers: "—", activity: "No LinkedIn profile detected", health: "warning" };

  // Facebook — check entity directories, sameAs, or form input
  const facebookDir = dirs.find(d => d.name === "Facebook");
  const facebookSameAs = sameAs.find(u => u.includes("facebook.com"));
  const facebookPlatform = facebookDir?.found || facebookSameAs
    ? { name: "Facebook", status: "Verified", followers: "—", activity: facebookDir?.profileUrl || facebookSameAs || "Profile found", health: "good" }
    : { name: "Facebook", status: "Not Connected", followers: "—", activity: "No Facebook profile detected", health: "warning" };

  return {
    socialScore: calcScore(signals),
    signals,
    platforms: [linkedinPlatform, gbpPlatform, facebookPlatform],
  };
}

function buildAISEOMetrics(cr, entity) {
  const schema = entity?.schema || cr?.schema || {};
  const missingSchema = schema.missingTypes || [];
  const blocked = entity?.blocked === true;
  const kg = entity?.knowledgeGraph || {};

  // Schema findings
  const schemaFindings = [];
  if (schema.types?.length > 0) schemaFindings.push(`Found: ${schema.types.join(", ")}`);
  if (missingSchema.length > 0) schemaFindings.push(`Missing: ${missingSchema.join(", ")}`);

  const schemaHasData = schema.types?.length > 0;

  const metrics = [
    {
      label: "AI Search Mentions", value: "Not Connected", status: "warning", impact: "high",
      why: "AI-powered search is where your next wave of buyers will discover you. If you're not showing up, competitors are.",
      fix: "Create comprehensive, well-structured content that AI models can cite when answering buyer questions.",
      expectedImpact: "Being cited in AI search results opens a growing channel of pre-qualified prospects.", difficulty: "High",
    },
    {
      label: "Structured Data",
      value: blocked ? "Site Blocked Analysis" : schemaHasData ? `${schema.types.length} type${schema.types.length > 1 ? "s" : ""} found` : (!entity ? "Not Connected" : "None detected"),
      status: blocked ? "warning" : schemaHasData ? (schema.types.length >= 3 ? "good" : "warning") : (!entity ? "warning" : "poor"),
      detail: blocked ? "Site security prevented schema analysis." : schemaHasData ? `Detected: ${schema.types.join(", ")}` : (!entity ? "Structured data analysis unavailable." : "No structured data found on homepage."),
      impact: "high", findings: schemaFindings,
      why: "Structured data helps search engines and AI systems understand your content.",
      fix: missingSchema.length > 0 ? `Add ${missingSchema.join(", ")} schema to relevant pages.` : "Implement Organization, FAQ, Service, and LocalBusiness schema.",
      expectedImpact: "Full structured data can enable rich results and improve AI content understanding.", difficulty: "Medium",
    },
    {
      label: "Entity Recognition", value: "Not Connected", status: "warning", impact: "high",
      why: "If search engines don't recognize your brand as a distinct entity, you lose control over branded search.",
      fix: "Build entity signals through consistent NAP data, schema markup, and authoritative mentions.",
      expectedImpact: "Strong entity recognition enables Knowledge Panels.", difficulty: "High",
    },
    {
      label: "Content Depth", value: "Not Connected", status: "warning", impact: "medium",
      why: "Shallow content is unlikely to be cited by AI systems.",
      fix: "Expand key pages with comprehensive, expert-level content.",
      expectedImpact: "Deeper content increases citation likelihood.", difficulty: "Medium",
    },
    {
      label: "FAQ Schema",
      value: blocked ? "Site Blocked Analysis" : schemaHasData ? (schema.hasFAQ ? "Present" : "Not Found") : (!entity ? "Not Connected" : "Not Found"),
      status: blocked ? "warning" : schema.hasFAQ ? "good" : (!entity ? "warning" : "poor"),
      impact: "medium",
      why: "FAQ schema enables rich results and provides content AI systems can directly cite.",
      fix: "Add FAQ schema to service pages and pages addressing common questions.",
      expectedImpact: "FAQ rich results can increase page real estate in SERPs by up to 50%.", difficulty: "Low",
    },
    {
      label: "Topical Authority", value: "Not Connected", status: "warning", impact: "high",
      why: "Topical authority signals expertise \u2014 critical for ranking and AI citations.",
      fix: "Build content clusters around core topics.",
      expectedImpact: "Strong topical authority can improve rankings across content clusters.", difficulty: "High",
    },
    {
      label: "Citation Likelihood", value: "Not Connected", status: "warning", impact: "high",
      why: "Low citation likelihood means AI search tools are unlikely to reference your content.",
      fix: "Create definitive, data-rich content that serves as a primary source.",
      expectedImpact: "Increasing citation likelihood opens a growing traffic channel.", difficulty: "High",
    },
    {
      label: "Knowledge Panel",
      value: kg.found ? "Entity Detected" : (schema.hasOrganization ? "Partial (Schema only)" : (!entity ? "Not Connected" : "Not detected")),
      status: kg.found ? "good" : (schema.hasOrganization ? "warning" : (!entity ? "warning" : "poor")),
      impact: "high",
      detail: kg.found ? `Knowledge Graph entity: "${kg.name}"${kg.description ? ` \u2014 ${kg.description}` : ""}` : (schema.hasOrganization ? "Organization schema found but no Knowledge Graph entity." : "No Knowledge Panel signals detected."),
      why: "A Knowledge Panel is prime real estate on your branded search results. Without one, you look less established than competitors who have one.",
      fix: kg.found ? "Maintain entity signals and keep information current." : "Strengthen entity signals through Wikidata, consistent schema, and verified profiles.",
      expectedImpact: "A Knowledge Panel increases brand trust and CTR.", difficulty: "High",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

function buildEntityMetrics(pl, cr, entity) {
  const placeData = pl?.data || {};
  const schema = entity?.schema || cr?.schema || {};
  const hasGBP = pl?.found === true;
  const reviewCount = placeData.reviewCount ?? 0;
  const rating = placeData.rating ?? 0;
  const categories = placeData.types || placeData.categories || [];
  const businessName = placeData.name || null;
  const blocked = entity?.blocked === true;
  const kg = entity?.knowledgeGraph || {};
  const wd = entity?.wikidata || {};
  const napu = entity?.napuScore || null;
  const directories = entity?.directories || [];
  const sameAsLinks = schema.sameAsLinks || [];

  // GBP findings
  const gbpFindings = [];
  if (hasGBP && businessName) gbpFindings.push(`Business listed as: "${businessName}"`);
  if (categories.length > 0) gbpFindings.push(`Categories: ${categories.slice(0, 3).join(", ")}`);
  if (hasGBP && placeData.businessStatus) gbpFindings.push(`Status: ${placeData.businessStatus}`);

  // Review findings
  const reviewFindings = [];
  if (reviewCount > 0 && rating > 0) {
    reviewFindings.push(`${rating} star average across ${reviewCount} reviews`);
    if (rating < 4.0) reviewFindings.push("Below 4.0 average \u2014 may negatively impact click-through from local results");
    if (reviewCount < 20) reviewFindings.push("Under 20 reviews \u2014 competitors with more reviews will outrank in local pack");
  }
  // Add directory review data
  directories.filter(d => d.found && d.reviews).forEach(d => {
    reviewFindings.push(`${d.name}: ${d.rating ? d.rating + "\u2605" : ""} (${d.reviews} reviews)`);
  });

  // Schema findings for local
  const schemaHasData = schema.types?.length > 0;
  const localSchemaFindings = [];
  if (schemaHasData) localSchemaFindings.push(`Found: ${schema.types.join(", ")}`);
  if (schemaHasData && !schema.hasLocalBusiness) localSchemaFindings.push("Missing LocalBusiness schema \u2014 critical for local search visibility");
  if (schemaHasData && !schema.hasFAQ) localSchemaFindings.push("Missing FAQ schema \u2014 opportunity for rich results");

  // NAPU findings
  const napuFindings = [];
  if (directories.length > 0) {
    directories.forEach(d => {
      napuFindings.push(`${d.name}: ${d.found ? "Found" : "Not Found"}${d.profileUrl ? "" : ""}${d.noKey ? " (API key not configured)" : ""}`);
    });
  }

  // KG findings
  const kgFindings = [];
  if (kg.found) {
    if (kg.name) kgFindings.push(`Entity name: "${kg.name}"`);
    if (kg.description) kgFindings.push(`Description: ${kg.description}`);
    if (kg.types?.length) kgFindings.push(`Types: ${kg.types.join(", ")}`);
  }

  // Same-as findings
  const sameAsFindings = sameAsLinks.length > 0
    ? sameAsLinks.slice(0, 5).map(link => link)
    : [];

  // Entity description comparison
  const descriptions = [];
  if (kg.description) descriptions.push({ source: "Knowledge Graph", text: kg.description });
  if (wd.description) descriptions.push({ source: "Wikidata", text: wd.description });
  const descFindings = descriptions.map(d => `${d.source}: "${d.text}"`);

  const metrics = [
    {
      label: "NAP Consistency",
      value: napu ? `${napu.found}/${napu.total} directories` : (blocked ? "Site Blocked Analysis" : "Not Connected"),
      status: napu ? (napu.pct >= 75 ? "good" : napu.pct >= 50 ? "warning" : "poor") : "warning",
      detail: napu ? `Found in ${napu.found} of ${napu.total} directories checked (${napu.pct}% coverage).` : (blocked ? "Site security prevented HTML analysis." : "Directory audit data unavailable."),
      impact: "high", estimated: !napu, findings: napuFindings,
      why: "Inconsistent business information across directories erodes trust.",
      fix: "Audit and correct all business listings for identical Name, Address, and Phone.",
      expectedImpact: "Consistent NAP data is a top-3 local ranking factor.", difficulty: "Low",
    },
    {
      label: "Verified Google Business Profile",
      value: !pl ? "Not Connected" : hasGBP ? "Yes" : "Not Found",
      status: !pl ? "warning" : hasGBP ? "good" : "poor",
      detail: !pl ? "Google Places data unavailable." : hasGBP ? "GBP listing found and operational." : "No Google Business Profile found.",
      impact: "foundational", findings: gbpFindings,
      why: "No GBP means you're invisible in the local map pack \u2014 the first thing buyers see when searching nearby.",
      fix: hasGBP ? "No action needed." : "Claim and verify your Google Business Profile.",
      expectedImpact: "Maintains eligibility for local map pack.", difficulty: hasGBP ? "N/A" : "Low",
    },
    {
      label: "Google Reviews",
      value: !pl ? "Not Connected" : reviewCount > 0 ? `${rating}\u2605 (${reviewCount} reviews)` : "No reviews found",
      status: !pl ? "warning" : reviewCount >= 50 ? "good" : reviewCount >= 10 ? "warning" : "poor",
      detail: !pl ? "Google Places data unavailable." : reviewCount > 0 ? `${rating}-star average with ${reviewCount} total reviews.` : "No Google reviews detected.",
      impact: "foundational", findings: reviewFindings,
      why: "Reviews are social proof at the moment of decision. More reviews = more trust = more calls.",
      fix: reviewCount >= 50 ? "Continue encouraging reviews." : "Implement a review generation strategy \u2014 target 5+ new reviews per month.",
      expectedImpact: "Ongoing review growth sustains local ranking strength.", difficulty: reviewCount >= 50 ? "N/A" : "Medium",
    },
    {
      label: "Schema Markup",
      value: blocked ? "Site Blocked Analysis" : schemaHasData ? `${schema.types.length} type${schema.types.length > 1 ? "s" : ""}` : (!entity ? "Not Connected" : "None detected"),
      status: blocked ? "warning" : schemaHasData ? (schema.hasLocalBusiness ? "good" : schema.hasOrganization ? "warning" : "warning") : (!entity ? "warning" : "poor"),
      detail: blocked ? "Site security prevented schema analysis." : schemaHasData ? `Types: ${schema.types.join(", ")}` : (!entity ? "Schema data unavailable." : "No structured data detected."),
      impact: "high", findings: localSchemaFindings,
      why: "Limited schema means search engines have an incomplete understanding of your business.",
      fix: schema.hasLocalBusiness ? "Consider adding Service and FAQ schema." : "Add LocalBusiness, Service, FAQ, and Review schema.",
      expectedImpact: "Comprehensive schema enables rich results.", difficulty: "Medium",
    },
    {
      label: "Knowledge Graph",
      value: kg.found ? "Entity Found" : "Not Found",
      status: kg.found ? "good" : "warning",
      detail: kg.found ? `Recognized as: "${kg.name}"${kg.description ? ` \u2014 ${kg.description}` : ""}` : "Company not found in Google Knowledge Graph.",
      impact: "high", findings: kgFindings,
      why: "Without a Knowledge Panel, you have limited control over branded search results.",
      fix: kg.found ? "Maintain and strengthen entity signals." : "Build entity signals through Wikidata, consistent schema, and authoritative mentions.",
      expectedImpact: "A Knowledge Panel establishes brand authority.", difficulty: "High",
    },
    {
      label: "Entity Associations", value: "Not Connected", status: "warning",
      detail: "Entity association analysis requires NLP pipeline.", impact: "high",      why: "Weak entity associations mean search engines don't understand your brand's relationships.",
      fix: "Build same-as links, earn mentions on authoritative sites.",
      expectedImpact: "Stronger entity signals improve visibility.", difficulty: "High",
    },
    {
      label: "Wikidata",
      value: wd.found ? "Entry Found" : "Not Found",
      status: wd.found ? "good" : "warning",
      detail: wd.found ? `Wikidata ID: ${wd.id}${wd.description ? ` \u2014 "${wd.description}"` : ""}` : "No Wikidata entry found for this company.",
      impact: "medium",
      why: "Wikidata is a primary data source for Google's Knowledge Graph.",
      fix: wd.found ? "Keep Wikidata entry up to date." : "Create a Wikidata entry with accurate business information.",
      expectedImpact: "Can trigger Knowledge Panel eligibility.", difficulty: "Medium",
    },
    {
      label: "Same-As Links",
      value: blocked ? "Site Blocked Analysis" : sameAsLinks.length > 0 ? `${sameAsLinks.length} link${sameAsLinks.length > 1 ? "s" : ""}` : (!entity ? "Not Connected" : "Not detected"),
      status: blocked ? "warning" : sameAsLinks.length >= 3 ? "good" : sameAsLinks.length > 0 ? "warning" : (!entity ? "warning" : "poor"),
      detail: blocked ? "Site security prevented schema analysis." : sameAsLinks.length > 0 ? `${sameAsLinks.length} cross-platform identity links found in schema.` : "No sameAs links found in schema markup.",
      impact: "medium", findings: sameAsFindings,
      why: "Same-as links connect your website to your social profiles.",
      fix: sameAsLinks.length >= 3 ? "No action needed." : "Add sameAs schema properties linking to all verified social profiles.",
      expectedImpact: "Strengthens entity verification.", difficulty: "Low",
    },
    {
      label: "Entity Descriptions",
      value: descriptions.length > 0 ? `${descriptions.length} source${descriptions.length > 1 ? "s" : ""}` : "Not Connected",
      status: descriptions.length >= 2 ? "good" : descriptions.length === 1 ? "warning" : "warning",
      detail: descriptions.length > 0 ? `Entity descriptions found across ${descriptions.length} source${descriptions.length > 1 ? "s" : ""}.` : "No entity descriptions found across external sources.",
      impact: "medium", findings: descFindings,
      why: "Different descriptions across platforms confuse search engines.",
      fix: "Standardize your business description across all platforms.",
      expectedImpact: "Consistent messaging strengthens entity clarity.", difficulty: "Low",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

// Shared exports for refresh endpoint
export { buildWebPerfMetrics, buildSEOMetrics, buildKeywords, buildContentMetrics, buildSocialMetrics, buildAISEOMetrics, buildEntityMetrics, checkUrl };
