// Main audit orchestration endpoint
// POST /api/audit — accepts { url, companyName, contactName, email, phone }
// Returns unified audit data matching BeaconAudit.jsx metric format

import { fetchGtmetrix } from "../providers/gtmetrix.js";
import { fetchCrawlData } from "../providers/crawl.js";
import { fetchSemrush, fetchSiteAudit } from "../providers/semrush.js";
import { fetchPlacesData } from "../providers/places.js";
import { appendAuditToSheet } from "../providers/sheets.js";
import { kv } from "@vercel/kv";

export const maxDuration = 60; // Allow up to 60s for all providers to complete

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, companyName, contactName, email, phone, semrushProjectId } = body;

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    // Run ALL providers + checks in parallel — don't let one failure kill the whole audit
    const [pageSpeed, crawl, semrush, places, sitemapCheck, robotsCheck] = await Promise.allSettled([
      fetchGtmetrix(fullUrl),
      fetchCrawlData(fullUrl),
      fetchSemrush(fullUrl),
      fetchPlacesData(companyName || "", fullUrl),
      checkUrl(`${fullUrl}/sitemap.xml`),
      checkUrl(`${fullUrl}/robots.txt`),
    ]);

    const ps = pageSpeed.status === "fulfilled" ? pageSpeed.value : null;
    const cr = crawl.status === "fulfilled" ? crawl.value : null;
    const sr = semrush.status === "fulfilled" ? semrush.value : null;
    const pl = places.status === "fulfilled" ? places.value : null;

    console.log(`[Audit] Provider results: ps=${!!ps}, cr=${!!cr}, sr=${!!sr}, pl=${!!pl}`);
    console.log(`[Audit] Provider statuses: ps=${pageSpeed.status}, cr=${crawl.status}, sr=${semrush.status}, pl=${places.status}`);
    if (pageSpeed.status === "rejected") console.error(`[Audit] PageSpeed error: ${pageSpeed.reason?.message}`);
    if (crawl.status === "rejected") console.error(`[Audit] Crawl error: ${crawl.reason?.message}`);
    if (semrush.status === "rejected") console.error(`[Audit] SEMrush error: ${semrush.reason?.message}`);
    if (places.status === "rejected") console.error(`[Audit] Places error: ${places.reason?.message}`);
    if (sr) console.log(`[Audit] SEMrush data: da=${JSON.stringify(sr.domainAuthority)}, bl=${!!sr.backlinks}, kw=${sr.topKeywords?.length}, comp=${sr.competitors?.length}`);
    if (pl) console.log(`[Audit] Places data: found=${pl.found}, hasData=${!!pl.data}, name=${pl.data?.name}`);

    const hasSitemap = sitemapCheck.status === "fulfilled" && sitemapCheck.value;
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
      meta: { url: fullUrl, companyName, contactName, email, phone, semrushProjectId: semrushProjectId || null, timestamp: new Date().toISOString() },
      webPerf: buildWebPerfMetrics(ps, cr, hasSitemap, siteAudit),
      seo: buildSEOMetrics(sr, hasSitemap, hasRobots),
      keywords: buildKeywords(sr),
      content: buildContentMetrics(cr, ps),
      socialLocal: buildSocialMetrics(cr),
      aiSeo: buildAISEOMetrics(cr),
      entity: buildEntityMetrics(pl, cr),
      places: pl?.data || null,
      errors: {
        pageSpeed: pageSpeed.status === "rejected" ? pageSpeed.reason?.message : null,
        crawl: crawl.status === "rejected" ? crawl.reason?.message : null,
        semrush: semrush.status === "rejected" ? semrush.reason?.message : null,
        places: places.status === "rejected" ? places.reason?.message : null,
      },
    };

    // Track which providers need retry (returned null/empty or rejected)
    const pending = [];
    if (!ps) pending.push("pageSpeed");
    if (!cr) pending.push("crawl");
    // SEMrush can return an object with all null properties — treat as missing
    const srHasData = sr && (sr.domainAuthority || sr.backlinks || sr.topKeywords?.length > 0);
    if (!srHasData) pending.push("semrush");
    // Places can return { found: false, data: null } — treat as missing
    const plHasData = pl && pl.found === true && pl.data;
    if (!plHasData) pending.push("places");
    if (pending.length > 0) audit.pendingProviders = pending;

    // Store in KV with unique ID
    const id = generateId();
    audit.id = id;
    await kv.set(`audit:${id}`, JSON.stringify(audit));

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
// Each returns { score, metrics[] } matching BeaconAudit.jsx format
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

function buildWebPerfMetrics(ps, cr, hasSitemap, siteAudit) {
  const perfScore = ps?.performanceScore ?? null;
  const sslValid = cr?.ssl?.valid ?? ps?.isHttps ?? null;
  const http2 = cr?.http2 ?? null;
  const mobileFriendly = ps?.mobileFriendly ?? null;
  const altPct = cr?.images?.altPct ?? null;
  const totalImages = cr?.images?.total || ps?.imageOptimization?.totalImages || 0;
  const missingAlt = cr?.images?.missingAlt || 0;
  const imgExamples = cr?.images?.missingAltExamples || [];
  const psImgExamples = ps?.imageOptimization?.examples || [];
  const largestRes = ps?.largestResources || [];
  const cwv = ps?.coreWebVitals || {};
  const blockingRes = ps?.blockingResources || [];
  const emptyLinks = cr?.content?.emptyLinks || 0;

  // Site Health: Use SEMrush Site Audit score if available
  const siteHealth = siteAudit?.score ?? null;
  const siteHealthSource = siteAudit ? "semrush" : null;

  // Build specific findings for site health
  const healthFindings = [];
  if (emptyLinks > 0) healthFindings.push(`${emptyLinks} empty or broken link${emptyLinks > 1 ? "s" : ""} found (href="#" or javascript:void)`);
  if (ps?.a11yIssues?.length > 0) ps.a11yIssues.forEach(i => healthFindings.push(`${i.issue}: ${i.count} instance${i.count > 1 ? "s" : ""}`));
  if (cr?.meta?.noindex) healthFindings.push("Homepage has a noindex tag \u2014 search engines are blocked from indexing it");

  // Speed findings
  const speedFindings = [];
  if (cwv.lcpFormatted) speedFindings.push(`Largest Contentful Paint: ${cwv.lcpFormatted} (target: under 2.5s)`);
  if (cwv.fcpFormatted) speedFindings.push(`First Contentful Paint: ${cwv.fcpFormatted}`);
  if (cwv.tbtFormatted) speedFindings.push(`Total Blocking Time: ${cwv.tbtFormatted}`);
  if (ps?.lcpElement) speedFindings.push(`LCP element: ${ps.lcpElement}`);
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
      value: siteHealth !== null ? `${siteHealth}%` : "Requires SEMrush Project",
      status: siteHealth !== null ? toStatus(siteHealth, 90, 70) : "warning",
      detail: siteHealth !== null 
        ? `SEMrush Site Audit: ${siteAudit.errors} errors, ${siteAudit.warnings} warnings across ${siteAudit.pagesCrawled} pages.`
        : "Add your SEMrush Project ID to pull live site health data from SEMrush Site Audit.",
      weighted: true, impact: "high", findings: healthFindings,
      why: "Technical issues silently drive away prospects. Every crawl error or broken page is a potential customer who never sees your offer.",
      fix: "Run a full technical audit to identify and resolve broken links, redirect chains, and crawl errors.",
      expectedImpact: "A clean site means more prospects reach your conversion pages instead of bouncing.", difficulty: "Medium",
    },
    {
     label: "GTmetrix Performance", value: perfScore !== null ? `${perfScore}%` : "Analyzing...", status: toStatus(perfScore, 90, 50),
      detail: ps ? `Desktop: ${ps.desktopScore}% | Mobile: ${ps.mobileScore}%` : "Analyzing...",
      impact: "high", findings: speedFindings,
      why: "53% of mobile visitors abandon pages that take over 3 seconds. Every second of delay costs you leads.",
      fix: "Compress images, implement lazy loading, enable browser caching, and defer non-critical JavaScript.",
      expectedImpact: "Sub-3-second loads can cut bounce rates by 20-30% \u2014 more visitors staying means more pipeline.", difficulty: "Medium",
    },
    {
      label: "Mobile Optimization", value: mobileFriendly === true ? "Yes" : mobileFriendly === false ? "No" : "Checking...",
      status: mobileFriendly === true ? "good" : mobileFriendly === false ? "poor" : "warning",
      detail: ps ? `Mobile score: ${ps.mobileScore}% | Desktop score: ${ps.desktopScore}%` : "Checking...",
      impact: "foundational",
      why: "Google uses mobile-first indexing \u2014 your mobile site IS your site for ranking purposes.",
      fix: mobileFriendly ? "No action needed." : "Implement responsive design and fix mobile usability issues.",
      expectedImpact: "Maintains eligibility for mobile search rankings (60%+ of all searches).", difficulty: mobileFriendly ? "N/A" : "Medium",
    },
    {
      label: "Security & SSL", value: sslValid ? "Valid" : "Invalid", status: sslValid ? "good" : "poor",
      detail: sslValid ? "HTTPS is active and certificate is valid." : "Site is not served over HTTPS \u2014 browsers will flag it as insecure.",
      impact: "foundational",
      why: "SSL is a ranking signal and browsers flag non-secure sites with warnings.",
      fix: sslValid ? "No action needed. Ensure certificate auto-renews." : "Install an SSL certificate immediately.",
      expectedImpact: "Maintains trust signals and prevents browser security warnings.", difficulty: sslValid ? "N/A" : "Low",
    },
    {
      label: "HTTP/2 Support", value: http2 ? "Enabled" : "Not Detected", status: http2 ? "good" : "warning",
      detail: "HTTP/2 enables multiplexed connections for faster page delivery.", impact: "foundational",
      why: "HTTP/2 reduces page load times significantly over HTTP/1.1.",
      fix: http2 ? "No action needed." : "Enable HTTP/2 on your web server.",
      expectedImpact: "Faster page delivery, especially for resource-heavy pages.", difficulty: http2 ? "N/A" : "Low",
    },
    {
      label: "Image Optimization",
      value: imgImprovePct !== null ? `${imgImprovePct}% Improvement Needed` : "Estimated",
      status: toStatus(imgImprovePct, 10, 30, true),
      detail: totalImages > 0 ? `${totalImages} images detected on homepage.` : "Image audit data.",
      impact: "high", findings: imgFindings.slice(0, 5),
      why: "Unoptimized images are the #1 cause of slow page loads.",
      fix: "Convert images to WebP, implement responsive srcset, and compress all images above 100KB.",
      expectedImpact: "Can reduce page load time by 40-60% on image-heavy pages.", difficulty: "Low",
    },
    {
      label: "Alt Tags",
      value: altPct !== null ? `${missingAlt} of ${totalImages} missing` : "Estimated",
      status: toStatus(altPct, 10, 30, true),
      detail: altPct !== null ? `${altPct}% of images are missing alt text.` : "Checking...",
      impact: "medium", findings: altFindings.slice(0, 5),
      why: "Alt tags enable image search rankings and are required for ADA/WCAG compliance.",
      fix: "Add descriptive, keyword-relevant alt text to each image.",
      expectedImpact: "Opens traffic channels through Google Image Search.", difficulty: "Low",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

function buildSEOMetrics(sr, hasSitemap, hasRobots) {
  const da = sr?.domainAuthority;
  const bl = sr?.backlinks;
  const kwCount = da?.organicKeywords ?? null;
  const traffic = da?.organicTraffic ?? null;
  const totalBacklinks = bl?.totalBacklinks ?? null;
  const refDomains = bl?.referringDomains ?? null;
  const competitors = sr?.competitors || [];
  const topKw = sr?.topKeywords || [];
  const trafficCost = da?.organicCost ?? null;

  const rank = da?.rank ?? 0;
  const estimatedDA = rank > 0 ? Math.min(100, Math.max(1, Math.round(100 - Math.log10(rank) * 15))) : null;
  const brandedPct = null;
  const indexation = null;

  // Keyword findings — show actual top keywords with positions
  const kwFindings = [];
  if (topKw.length > 0) {
    const top3 = topKw.slice(0, 3);
    top3.forEach(kw => kwFindings.push(`"${kw.keyword}" \u2014 position #${kw.position} (${kw.volume.toLocaleString()} monthly searches)`));
    if (trafficCost) kwFindings.push(`Organic traffic value: $${Math.round(trafficCost).toLocaleString()}/mo`);
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

  const metrics = [
    {
      label: "Organic Keywords", value: kwCount !== null ? kwCount.toLocaleString() : "Estimated",
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
      label: "Branded Traffic Share", value: brandedPct !== null ? `${brandedPct}%` : "Estimated",
      status: brandedPct !== null ? toStatus(brandedPct, 35, 20) : "warning",
      detail: "Connect Search Console for exact branded traffic data.", impact: "high",
      estimated: brandedPct === null,
      why: "When prospects Google your company name and find little, trust drops before your sales team gets a chance.",
      fix: "Invest in brand visibility \u2014 PR mentions, thought leadership, and consistent content that makes your name recognizable.",
      expectedImpact: "Strong branded search means warmer prospects and shorter sales cycles.", difficulty: "High",
    },
    {
      label: "Indexation Efficiency", value: indexation !== null ? `${indexation}%` : "Estimated",
      status: indexation !== null ? toStatus(indexation, 90, 70) : "warning",
      detail: "Connect Search Console for exact indexation data.", impact: "high",
      estimated: indexation === null,
      why: "If Google hasn't indexed a page, it cannot appear in search results.",
      fix: "Review unindexed pages for thin content, crawl blocks, or noindex tags.",
      expectedImpact: "Indexing all quality pages could unlock additional ranking opportunities.", difficulty: "Low",
    },
    {
      label: "Domain Authority Score", value: estimatedDA !== null ? `${estimatedDA}/100` : "Estimated",
      status: estimatedDA !== null ? toStatus(estimatedDA, 50, 30) : "warning",
      detail: rank > 0 ? `SEMrush rank: #${rank.toLocaleString()} globally.` : "SEMrush data unavailable for this domain.",
      impact: "medium", estimated: estimatedDA === null, findings: compFindings,
      why: "Higher authority means your pages outrank competitors for the same keywords \u2014 you get the click, they don't.",
      fix: "Build high-quality backlinks through guest posts, digital PR, and industry partnerships.",
      expectedImpact: "Reaching DA 45+ would significantly improve ranking potential.", difficulty: "High",
    },
    {
      label: "Backlink Profile", value: totalBacklinks !== null ? totalBacklinks.toLocaleString() : "Estimated",
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
      label: "XML Sitemap Status", value: hasSitemap ? "Found" : "Not Found", status: hasSitemap ? "good" : "poor",
      detail: hasSitemap ? "Sitemap detected at /sitemap.xml." : "No sitemap found at /sitemap.xml.",
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

  return { score: calcScore(metrics), metrics };
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

function buildContentMetrics(cr, ps) {
  const hasBlog = cr?.blog?.detected ?? null;
  const lastPostDate = cr?.blog?.lastPostDate || null;
  const lastPostDays = cr?.blog?.lastPostDaysAgo ?? null;
  const blogTitles = cr?.blog?.recentTitles || [];
  const wordCount = cr?.content?.wordCount ?? null;
  const contentRatio = cr?.content?.ratio ?? null;
  const internalLinks = cr?.content?.internalLinks ?? null;
  const metaDesc = cr?.meta?.description || null;
  const metaLen = cr?.meta?.descriptionLength || 0;
  const titleText = cr?.meta?.title || null;
  const titleLen = cr?.meta?.titleLength || 0;
  const h1Text = cr?.meta?.h1Text || null;
  const hasH1 = cr?.meta?.hasH1 ?? null;
  const multiH1 = cr?.meta?.multipleH1 ?? false;

  const blogPath = cr?.blog?.path || null;

  // Blog freshness findings
  const blogFindings = [];
  if (blogPath) blogFindings.push(`Content page found at: ${blogPath}`);
  if (lastPostDate) {
    const date = new Date(lastPostDate);
    blogFindings.push(`Last detected post date: ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (${lastPostDays} days ago)`);
  }
  if (blogTitles.length > 0) blogTitles.forEach(t => blogFindings.push(`Recent post: "${t}"`));
  if (hasBlog && !lastPostDate) blogFindings.push("Blog page detected but no post dates could be extracted \u2014 may use JavaScript rendering");

  // Meta description findings
  const metaFindings = [];
  if (metaDesc) {
    metaFindings.push(`Your meta description: "${metaDesc.length > 120 ? metaDesc.substring(0, 117) + "..." : metaDesc}"`);
    if (metaLen < 120) metaFindings.push(`Length: ${metaLen} chars \u2014 consider expanding to 150-160 chars for full SERP display`);
    else if (metaLen > 160) metaFindings.push(`Length: ${metaLen} chars \u2014 may be truncated in search results (target: 150-160)`);
    else metaFindings.push(`Length: ${metaLen} chars \u2014 good length for search results`);
  } else {
    metaFindings.push("No meta description found on homepage \u2014 Google will auto-generate one from page content");
  }

  // H1 findings
  const h1Findings = [];
  if (h1Text) h1Findings.push(`Your H1: "${h1Text}"`);
  if (multiH1) h1Findings.push("Multiple H1 tags detected \u2014 best practice is one H1 per page");
  if (titleText) h1Findings.push(`Page title: "${titleText.length > 80 ? titleText.substring(0, 77) + "..." : titleText}" (${titleLen} chars)`);

  const freshStatus = lastPostDays !== null ? (lastPostDays <= 14 ? "good" : lastPostDays <= 45 ? "warning" : "poor") : "warning";
  const metaStatus = metaDesc ? (metaLen >= 120 && metaLen <= 160 ? "good" : "warning") : "poor";

  const blogDetected = hasBlog === true;
  const metrics = [
    {
      label: "Blog Page Exists", value: blogDetected ? "Yes" : hasBlog === false ? "Not Found" : "Checking...",
      status: blogDetected ? "good" : "poor",
      detail: blogDetected ? `Content page detected at ${blogPath || "/blog"}.` : "No blog, news, or resource section found on this site.",
      weighted: true, impact: "foundational",
      why: "A blog is the foundation for content marketing.", fix: blogDetected ? "No action needed." : "Create a blog section for ongoing content.",
      expectedImpact: "Provides infrastructure for ongoing content strategy.", difficulty: blogDetected ? "N/A" : "Medium",
    },
    {
      label: "Content Freshness",
      value: lastPostDays !== null ? `${lastPostDays} days since last post` : "Estimated",
      status: freshStatus,
      detail: lastPostDays !== null
        ? (lastPostDays <= 14 ? "Content is being published regularly." : lastPostDays <= 45 ? "Content is aging \u2014 search engines favor active publishers." : "Stale content signals an inactive site to search engines.")
        : (blogDetected ? "Blog detected but no post dates could be extracted. Site may use JavaScript rendering." : "No blog page found to analyze content freshness."),
      weighted: true, impact: "high", estimated: lastPostDays === null, findings: blogFindings,
      why: "Stale content signals an inactive business. Prospects researching you see outdated pages and move on to competitors who look alive.",
      fix: "Publish at least 2x/month with keyword-targeted content that answers your buyers' real questions.",
      expectedImpact: "Active publishers see 20-40% more organic traffic \u2014 that's qualified leads finding you on autopilot.", difficulty: "Medium",
    },
    {
      label: "Meta Descriptions",
      value: metaDesc ? `${metaLen} chars` : "Missing",
      status: metaStatus,
      detail: metaDesc ? "Homepage meta description found." : "No meta description on homepage \u2014 Google will auto-generate one.",
      impact: "high", findings: metaFindings,
      why: "Your meta description is your ad copy in search results. A weak one means prospects scroll past you to a competitor.",
      fix: "Write compelling meta descriptions that sell the click \u2014 prioritize high-traffic pages first.",
      expectedImpact: "Better descriptions can lift click-through rates 5-10% \u2014 more clicks from the same rankings.", difficulty: "Low",
    },
    {
      label: "H1 Tags",
      value: hasH1 === true ? (multiH1 ? "Multiple Found" : "Present") : hasH1 === false ? "Missing" : "Checking...",
      status: hasH1 ? (multiH1 ? "warning" : "good") : "poor",
      detail: hasH1 ? (multiH1 ? "Multiple H1 tags detected \u2014 use only one per page." : "Homepage has a single, proper H1 tag.") : "No H1 heading found on homepage.",
      impact: "foundational", findings: h1Findings,
      why: "H1 tags tell search engines the primary topic of each page.",
      fix: hasH1 ? (multiH1 ? "Consolidate to a single H1 per page." : "No action needed.") : "Add a unique H1 heading to every page.",
      expectedImpact: "Clear page topic signals for search engines.", difficulty: hasH1 && !multiH1 ? "N/A" : "Low",
    },
    {
      label: "Avg. Time on Page", value: "Estimated", status: "warning",
      detail: "Requires Google Analytics integration.", impact: "medium", estimated: true,
      why: "Low time on page suggests content isn't engaging visitors.",
      fix: "Improve content depth, add visuals, and use better formatting.",
      expectedImpact: "Reaching 2m+ avg can improve engagement signals.", difficulty: "Medium",
    },
    {
      label: "Bounce Rate", value: "Estimated", status: "warning",
      detail: "Requires Google Analytics integration.", impact: "high", estimated: true,
      why: "A high bounce rate means you're paying to get visitors who leave without converting. That's wasted budget.",
      fix: "Speed up your site, strengthen your above-the-fold messaging, and add clear next steps on every page.",
      expectedImpact: "Cutting bounce rate below 50% means more of your existing traffic converts \u2014 without spending more.", difficulty: "Medium",
    },
    {
      label: "Readability Score", value: "Estimated", status: "warning",
      detail: "Full readability analysis requires content parsing.", impact: "medium", estimated: true,
      why: "Complex content limits your audience.",
      fix: "Simplify sentence structure and replace jargon with plain language.",
      expectedImpact: "Broader accessibility can increase engagement.", difficulty: "Low",
    },
    {
      label: "Word Count (top pages)", value: wordCount !== null ? `~${wordCount.toLocaleString()} words` : "Estimated",
      status: toStatus(wordCount, 1200, 600),
      detail: wordCount ? `Homepage contains approximately ${wordCount.toLocaleString()} words.` : "Word count unavailable.",
      impact: "high",
      why: "Thin pages don't convince anyone to buy. Prospects need depth and expertise before they pick up the phone.",
      fix: "Expand key landing pages to 1,200+ words with the kind of detail that builds buyer confidence.",
      expectedImpact: "In-depth pages rank higher and convert better \u2014 they do your selling before the first call.", difficulty: "Medium",
    },
    {
      label: "Internal Links / Page", value: internalLinks !== null ? `${internalLinks} found` : "Estimated",
      status: toStatus(internalLinks, 10, 3),
      detail: internalLinks !== null ? `${internalLinks} internal links detected on homepage.` : "Internal link count unavailable.",
      impact: "medium",
      why: "Internal links distribute page authority and help search engines discover content.",
      fix: "Add 3-5 contextual internal links per page, prioritizing high-value pages.",
      expectedImpact: "Better internal linking can improve crawl depth.", difficulty: "Low",
    },
    {
      label: "Content-to-Code Ratio", value: contentRatio !== null ? `${contentRatio}%` : "Estimated",
      status: toStatus(contentRatio, 25, 15),
      detail: contentRatio !== null ? `${contentRatio}% of your page is readable content (target: 25%+).` : "Ratio unavailable.",
      impact: "medium",
      why: "A low ratio means more HTML/scripts than actual content.",
      fix: "Reduce unnecessary scripts and add more substantive content.",
      expectedImpact: "Improving ratio to 25%+ signals content-rich pages.", difficulty: "Medium",
    },
    {
      label: "Duplicate Content", value: "Estimated", status: "warning",
      detail: "Full duplicate analysis requires multi-page crawl.", impact: "high", estimated: true,
      why: "Duplicate content confuses search engines about which page to rank.",
      fix: "Write unique content for each page and add canonical tags.",
      expectedImpact: "Resolving duplicates allows proper indexation.", difficulty: "Low",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

function buildSocialMetrics(cr) {
  const og = cr?.openGraph || {};
  const tw = cr?.twitterCards || {};
  const missingOg = og.missingTags || [];
  const missingTw = tw.missingTags || [];

  // OG findings
  const ogFindings = [];
  if (missingOg.length > 0) ogFindings.push(`Missing tags: ${missingOg.join(", ")}`);
  if (og.actualTitle) ogFindings.push(`og:title is set to: "${og.actualTitle.length > 80 ? og.actualTitle.substring(0, 77) + "..." : og.actualTitle}"`);
  if (og.complete) ogFindings.push("All Open Graph tags are properly configured");

  // Twitter findings
  const twFindings = [];
  if (missingTw.length > 0) twFindings.push(`Missing tags: ${missingTw.join(", ")}`);

  const signals = [
    {
      label: "Open Graph Tags", value: og.complete ? "Complete" : og.title || og.description ? "Partial" : "Missing",
      status: og.complete ? "good" : og.title || og.description ? "warning" : "poor",
      detail: og.complete ? "All OG tags present \u2014 links will display rich previews when shared." : missingOg.length > 0 ? `Missing: ${missingOg.join(", ")}` : "OG tags not detected.",
      impact: "medium", findings: ogFindings,
      why: "When someone shares your link and it shows a broken preview, it kills credibility before the click happens.",
      fix: missingOg.length > 0 ? `Add ${missingOg.join(", ")} to your homepage and key pages.` : "Add og:title, og:description, and og:image tags to all pages.",
      expectedImpact: "Rich social previews can increase CTR from social shares by 2-3x.", difficulty: "Low",
    },
    {
      label: "Twitter Cards", value: tw.complete ? "Complete" : tw.card ? "Partial" : "Missing",
      status: tw.complete ? "good" : tw.card ? "warning" : "poor",
      detail: tw.complete ? "Twitter Card meta tags properly configured." : missingTw.length > 0 ? `Missing: ${missingTw.join(", ")}` : "No twitter:card meta tags found.",
      impact: "medium", findings: twFindings,
      why: "Twitter Cards create rich media previews when links are shared on X.",
      fix: missingTw.length > 0 ? `Add ${missingTw.join(", ")} meta tags.` : "Add twitter:card, twitter:title, and twitter:image meta tags.",
      expectedImpact: "Enables rich previews on X.", difficulty: "Low",
    },
    {
      label: "Social Share Buttons", value: "Estimated", status: "warning",
      detail: "Requires deeper page analysis.", impact: "medium", estimated: true,
      why: "Without share buttons, visitors have no easy way to spread your content.",
      fix: "Add social share buttons to blog posts and key landing pages.",
      expectedImpact: "Pages with share buttons receive 7x more social engagement.", difficulty: "Low",
    },
    {
      label: "Brand Consistency", value: "Estimated", status: "warning",
      detail: "Requires cross-platform analysis.", impact: "high", estimated: true,
      why: "Inconsistent branding across platforms weakens brand recognition.",
      fix: "Standardize profile images, bios, and brand messaging across all platforms.",
      expectedImpact: "Consistent branding increases revenue by up to 23%.", difficulty: "Low",
    },
  ];

  return {
    socialScore: calcScore(signals),
    signals,
    // Platforms would need individual API checks — placeholder for now
    platforms: [
      { name: "LinkedIn", status: "Estimated", followers: "—", activity: "Requires API check", health: "warning" },
      { name: "Google Business", status: "Estimated", followers: "—", activity: "Requires API check", health: "warning" },
      { name: "Facebook", status: "Estimated", followers: "—", activity: "Requires API check", health: "warning" },
    ],
  };
}

function buildAISEOMetrics(cr) {
  const schema = cr?.schema || {};
  const missingSchema = schema.missingTypes || [];

  // Schema findings
  const schemaFindings = [];
  if (schema.types?.length > 0) schemaFindings.push(`Found: ${schema.types.join(", ")}`);
  if (missingSchema.length > 0) schemaFindings.push(`Missing: ${missingSchema.join(", ")}`);

  const metrics = [
    {
      label: "AI Search Mentions", value: "Estimated", status: "warning", impact: "high", estimated: true,
      why: "AI-powered search is where your next wave of buyers will discover you. If you're not showing up, competitors are.",
      fix: "Create comprehensive, well-structured content that AI models can cite when answering buyer questions.",
      expectedImpact: "Being cited in AI search results opens a growing channel of pre-qualified prospects.", difficulty: "High",
    },
    {
      label: "Structured Data",
      value: schema.types?.length > 0 ? `${schema.types.length} type${schema.types.length > 1 ? "s" : ""} found` : "None detected",
      status: schema.types?.length >= 3 ? "good" : schema.types?.length > 0 ? "warning" : "poor",
      detail: schema.types?.length > 0 ? `Detected: ${schema.types.join(", ")}` : "No structured data found on homepage.",
      impact: "high", findings: schemaFindings,
      why: "Structured data helps search engines and AI systems understand your content.",
      fix: missingSchema.length > 0 ? `Add ${missingSchema.join(", ")} schema to relevant pages.` : "Implement Organization, FAQ, Service, and LocalBusiness schema.",
      expectedImpact: "Full structured data can enable rich results and improve AI content understanding.", difficulty: "Medium",
    },
    {
      label: "Entity Recognition", value: "Estimated", status: "warning", impact: "high", estimated: true,
      why: "If search engines don't recognize your brand as a distinct entity, you lose control over branded search.",
      fix: "Build entity signals through consistent NAP data, schema markup, and authoritative mentions.",
      expectedImpact: "Strong entity recognition enables Knowledge Panels.", difficulty: "High",
    },
    {
      label: "Content Depth", value: "Estimated", status: "warning", impact: "medium", estimated: true,
      why: "Shallow content is unlikely to be cited by AI systems.",
      fix: "Expand key pages with comprehensive, expert-level content.",
      expectedImpact: "Deeper content increases citation likelihood.", difficulty: "Medium",
    },
    {
      label: "FAQ Schema",
      value: schema.hasFAQ ? "Present" : "Not Found",
      status: schema.hasFAQ ? "good" : "poor",
      impact: "medium",
      why: "FAQ schema enables rich results and provides content AI systems can directly cite.",
      fix: "Add FAQ schema to service pages and pages addressing common questions.",
      expectedImpact: "FAQ rich results can increase page real estate in SERPs by up to 50%.", difficulty: "Low",
    },
    {
      label: "Topical Authority", value: "Estimated", status: "warning", impact: "high", estimated: true,
      why: "Topical authority signals expertise — critical for ranking and AI citations.",
      fix: "Build content clusters around core topics.",
      expectedImpact: "Strong topical authority can improve rankings across content clusters.", difficulty: "High",
    },
    {
      label: "Citation Likelihood", value: "Estimated", status: "warning", impact: "high", estimated: true,
      why: "Low citation likelihood means AI search tools are unlikely to reference your content.",
      fix: "Create definitive, data-rich content that serves as a primary source.",
      expectedImpact: "Increasing citation likelihood opens a growing traffic channel.", difficulty: "High",
    },
    {
      label: "Knowledge Panel",
      value: schema.hasOrganization ? "Partial (Schema detected)" : "Not detected",
      status: schema.hasOrganization ? "warning" : "poor",
      impact: "high",
      why: "A Knowledge Panel is prime real estate on your branded search results. Without one, you look less established than competitors who have one.",
      fix: "Strengthen entity signals through Wikidata, consistent schema, and verified profiles.",
      expectedImpact: "A Knowledge Panel increases brand trust and CTR.", difficulty: "High",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

function buildEntityMetrics(pl, cr) {
  const placeData = pl?.data || {};
  const schema = cr?.schema || {};
  const hasGBP = pl?.found === true;
  const reviewCount = placeData.reviewCount ?? 0;
  const rating = placeData.rating ?? 0;
  const categories = placeData.types || placeData.categories || [];
  const businessName = placeData.name || null;

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

  // Schema findings for local
  const localSchemaFindings = [];
  if (schema.types?.length > 0) localSchemaFindings.push(`Found: ${schema.types.join(", ")}`);
  if (!schema.hasLocalBusiness) localSchemaFindings.push("Missing LocalBusiness schema \u2014 critical for local search visibility");
  if (!schema.hasFAQ) localSchemaFindings.push("Missing FAQ schema \u2014 opportunity for rich results");

  const metrics = [
    {
      label: "NAP Consistency", value: "Estimated", status: "warning",
      detail: "Full NAP audit requires multi-directory check.", impact: "high", estimated: true,
      why: "Inconsistent business information across directories erodes trust.",
      fix: "Audit and correct all business listings for identical Name, Address, and Phone.",
      expectedImpact: "Consistent NAP data is a top-3 local ranking factor.", difficulty: "Low",
    },
    {
      label: "Verified Google Business Profile",
      value: hasGBP ? "Yes" : "Not Found",
      status: hasGBP ? "good" : "poor",
      detail: hasGBP ? "GBP listing found and operational." : "No Google Business Profile found.",
      impact: "foundational", findings: gbpFindings,
      why: "No GBP means you're invisible in the local map pack \u2014 the first thing buyers see when searching nearby.",
      fix: hasGBP ? "No action needed." : "Claim and verify your Google Business Profile.",
      expectedImpact: "Maintains eligibility for local map pack.", difficulty: hasGBP ? "N/A" : "Low",
    },
    {
      label: "Google Reviews",
      value: reviewCount > 0 ? `${rating}\u2605 (${reviewCount} reviews)` : "No reviews found",
      status: reviewCount >= 50 ? "good" : reviewCount >= 10 ? "warning" : "poor",
      detail: reviewCount > 0 ? `${rating}-star average with ${reviewCount} total reviews.` : "No Google reviews detected.",
      impact: "foundational", findings: reviewFindings,
      why: "Reviews are social proof at the moment of decision. More reviews = more trust = more calls.",
      fix: reviewCount >= 50 ? "Continue encouraging reviews." : "Implement a review generation strategy \u2014 target 5+ new reviews per month.",
      expectedImpact: "Ongoing review growth sustains local ranking strength.", difficulty: reviewCount >= 50 ? "N/A" : "Medium",
    },
    {
      label: "Schema Markup",
      value: schema.types?.length > 0 ? `${schema.types.length} type${schema.types.length > 1 ? "s" : ""}` : "None detected",
      status: schema.hasLocalBusiness ? "good" : schema.hasOrganization ? "warning" : "poor",
      detail: schema.types?.length > 0 ? `Types: ${schema.types.join(", ")}` : "No structured data detected.",
      impact: "high", findings: localSchemaFindings,
      why: "Limited schema means search engines have an incomplete understanding of your business.",
      fix: schema.hasLocalBusiness ? "Consider adding Service and FAQ schema." : "Add LocalBusiness, Service, FAQ, and Review schema.",
      expectedImpact: "Comprehensive schema enables rich results.", difficulty: "Medium",
    },
    {
      label: "Knowledge Graph", value: "Estimated", status: "warning",
      detail: "Knowledge Panel detection requires SERP analysis.", impact: "high", estimated: true,
      why: "Without a Knowledge Panel, you have limited control over branded search results.",
      fix: "Build entity signals through Wikidata, consistent schema, and authoritative mentions.",
      expectedImpact: "A Knowledge Panel establishes brand authority.", difficulty: "High",
    },
    {
      label: "Entity Associations", value: "Estimated", status: "warning",
      detail: "Entity association analysis requires NLP pipeline.", impact: "high", estimated: true,
      why: "Weak entity associations mean search engines don't understand your brand's relationships.",
      fix: "Build same-as links, earn mentions on authoritative sites.",
      expectedImpact: "Stronger entity signals improve visibility.", difficulty: "High",
    },
    {
      label: "Brand SERP Control", value: "Estimated", status: "warning",
      detail: "Requires branded SERP analysis.", impact: "high", estimated: true,
      why: "You should control the majority of page-one results for your brand name.",
      fix: "Optimize owned properties to dominate branded search results.",
      expectedImpact: "Full brand SERP control protects reputation.", difficulty: "Medium",
    },
    {
      label: "Wikidata", value: "Estimated", status: "warning",
      detail: "Wikidata check not yet implemented.", impact: "medium", estimated: true,
      why: "Wikidata is a primary data source for Google's Knowledge Graph.",
      fix: "Create a Wikidata entry with accurate business information.",
      expectedImpact: "Can trigger Knowledge Panel eligibility.", difficulty: "Medium",
    },
    {
      label: "Same-As Links",
      value: schema.types?.includes("Organization") ? "Partial" : "Not detected",
      status: schema.types?.includes("Organization") ? "warning" : "poor",
      detail: "Cross-platform identity links in schema markup.", impact: "medium",
      why: "Same-as links connect your website to your social profiles.",
      fix: "Add sameAs schema properties linking to all verified social profiles.",
      expectedImpact: "Strengthens entity verification.", difficulty: "Low",
    },
    {
      label: "Entity Descriptions", value: "Estimated", status: "warning",
      detail: "Requires cross-platform analysis.", impact: "medium", estimated: true,
      why: "Different descriptions across platforms confuse search engines.",
      fix: "Standardize your business description across all platforms.",
      expectedImpact: "Consistent messaging strengthens entity clarity.", difficulty: "Low",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

// Shared exports for refresh endpoint
export { buildWebPerfMetrics, buildSEOMetrics, buildKeywords, buildContentMetrics, buildSocialMetrics, buildAISEOMetrics, buildEntityMetrics, checkUrl };
