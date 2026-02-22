// Main audit orchestration endpoint
// POST /api/audit — accepts { url, companyName, contactName, email, phone }
// Returns unified audit data matching BeaconAudit.jsx metric format

import { fetchPageSpeed } from "../providers/pagespeed.js";
import { fetchCrawlData } from "../providers/crawl.js";
import { fetchSemrush } from "../providers/semrush.js";
import { fetchPlacesData } from "../providers/places.js";
import { kv } from "@vercel/kv";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, companyName, contactName, email, phone } = body;

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    // Run all providers in parallel — don't let one failure kill the whole audit
    const [pageSpeed, crawl, semrush, places] = await Promise.allSettled([
      fetchPageSpeed(fullUrl),
      fetchCrawlData(fullUrl),
      fetchSemrush(fullUrl),
      fetchPlacesData(companyName || "", fullUrl),
    ]);

    const ps = pageSpeed.status === "fulfilled" ? pageSpeed.value : null;
    const cr = crawl.status === "fulfilled" ? crawl.value : null;
    const sr = semrush.status === "fulfilled" ? semrush.value : null;
    const pl = places.status === "fulfilled" ? places.value : null;

    // Also fetch sitemap and robots.txt
    const [sitemapCheck, robotsCheck] = await Promise.allSettled([
      checkUrl(`${fullUrl}/sitemap.xml`),
      checkUrl(`${fullUrl}/robots.txt`),
    ]);

    const hasSitemap = sitemapCheck.status === "fulfilled" && sitemapCheck.value;
    const hasRobots = robotsCheck.status === "fulfilled" && robotsCheck.value;

    // --- Map to metric format ---
    const audit = {
      meta: { url: fullUrl, companyName, contactName, email, phone, timestamp: new Date().toISOString() },
      webPerf: buildWebPerfMetrics(ps, cr, hasSitemap),
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

    // Store in KV with unique ID
    const id = generateId();
    audit.id = id;
    await kv.set(`audit:${id}`, JSON.stringify(audit));

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
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000), redirect: "follow" });
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
  let totalWeight = 0, totalScore = 0;
  metrics.forEach(m => {
    const w = m.weighted ? 1.25 : 1;
    totalWeight += w;
    totalScore += w * (sv[m.status] ?? 0);
  });
  return Math.round(totalScore / totalWeight);
}

function buildWebPerfMetrics(ps, cr) {
  const perfScore = ps?.performanceScore ?? null;
  const sslValid = cr?.ssl?.valid ?? ps?.isHttps ?? null;
  const http2 = cr?.http2 ?? null;
  const imgData = cr?.images || ps?.imageOptimization || {};
  const altPct = cr?.images?.altPct ?? null;
  const mobileFriendly = ps?.mobileFriendly ?? null;
  const totalImages = imgData.totalImages || imgData.total || 0;
  const unoptCount = imgData.unoptimizedCount || imgData.missingAlt || 0;
  const imgImprovePct = ps?.imageOptimization?.improvementPct ?? (totalImages > 0 ? Math.round((unoptCount / totalImages) * 100) : null);

  // Approximate site health from performance + accessibility + SEO scores
  const siteHealth = ps ? Math.round((ps.performanceScore + (ps.seoScore || 70) + (ps.accessibilityScore || 70)) / 3) : null;

  const metrics = [
    {
      label: "Site Health", value: siteHealth !== null ? `${siteHealth}%` : "Analyzing...", status: toStatus(siteHealth, 90, 70),
      detail: "Measures crawlability, technical errors, and optimization issues. Best-in-class sites score 90%+.", weighted: true, impact: "high",
      why: "Site health directly influences how effectively search engines crawl and index your pages. A low score means critical pages may never appear in search results.",
      fix: "Run a full technical audit to identify and resolve broken links, redirect chains, and crawl errors systematically.",
      expectedImpact: "Improving site health to 90%+ can increase indexed pages by 15-25% and improve crawl efficiency.", difficulty: "Medium",
    },
    {
      label: "Page Speed & Performance", value: perfScore !== null ? `${perfScore}%` : "Analyzing...", status: toStatus(perfScore, 90, 50),
      detail: "Evaluates load speed, performance efficiency, and user experience impact. Target: 90%+.", impact: "high",
      why: "Page speed is a confirmed Google ranking factor. Slow sites lose visitors — 53% of mobile users abandon pages that take over 3 seconds to load.",
      fix: "Compress images, implement lazy loading, enable browser caching, and defer non-critical JavaScript.",
      expectedImpact: "Reaching 90%+ performance can reduce bounce rates by 20-30% and improve conversion rates.", difficulty: "Medium",
    },
    {
      label: "Mobile Optimization", value: mobileFriendly === true ? "Yes" : mobileFriendly === false ? "No" : "Checking...",
      status: mobileFriendly === true ? "good" : mobileFriendly === false ? "poor" : "warning",
      detail: "Confirms your site is optimized for mobile users and Google's mobile-first indexing.", impact: "foundational",
      why: "Google uses mobile-first indexing — your mobile site IS your site for ranking purposes.",
      fix: mobileFriendly ? "No action needed. Continue testing across devices when making site changes." : "Implement responsive design and fix mobile usability issues.",
      expectedImpact: "Maintains eligibility for mobile search rankings, which represent 60%+ of all searches.", difficulty: mobileFriendly ? "N/A" : "Medium",
    },
    {
      label: "Security & SSL", value: sslValid ? "Valid" : "Invalid", status: sslValid ? "good" : "poor",
      detail: "Status ensures encrypted data protection and trust signals for users and search engines.", impact: "foundational",
      why: "SSL is a ranking signal and browsers flag non-secure sites with warnings, reducing visitor trust.",
      fix: sslValid ? "No action needed. Ensure certificate auto-renews before expiration." : "Install an SSL certificate immediately — your site is flagged as insecure.",
      expectedImpact: "Maintains trust signals and prevents browser security warnings.", difficulty: sslValid ? "N/A" : "Low",
    },
    {
      label: "HTTP/2 Support", value: http2 ? "Enabled" : "Not Detected", status: http2 ? "good" : "warning",
      detail: "Improves load performance through faster resource delivery.", impact: "foundational",
      why: "HTTP/2 enables multiplexed connections, reducing page load times significantly over HTTP/1.1.",
      fix: http2 ? "No action needed. HTTP/2 is properly configured." : "Enable HTTP/2 on your web server for faster resource delivery.",
      expectedImpact: "Supports faster page delivery — particularly beneficial for resource-heavy pages.", difficulty: http2 ? "N/A" : "Low",
    },
    {
      label: "Image Optimization",
      value: imgImprovePct !== null ? `${imgImprovePct}% Improvement Needed` : "Estimated",
      status: toStatus(imgImprovePct, 10, 30, true),
      detail: totalImages > 0 ? `${unoptCount} of ${totalImages} images may need optimization.` : "Image audit data.",
      impact: "high",
      why: "Unoptimized images are the #1 cause of slow page loads. They increase bandwidth costs and hurt Core Web Vitals scores.",
      fix: "Convert images to WebP format, implement responsive srcset attributes, and compress all images above 100KB.",
      expectedImpact: "Can reduce page load time by 40-60% on image-heavy pages.", difficulty: "Low",
    },
    {
      label: "Alt Tags",
      value: altPct !== null ? `${altPct}% Incomplete` : "Estimated",
      status: toStatus(altPct, 10, 30, true),
      detail: "Missing alt text limits accessibility and weakens image search visibility.", impact: "medium",
      why: "Alt tags enable image search rankings and are required for accessibility compliance (ADA/WCAG).",
      fix: "Audit all images and add descriptive, keyword-relevant alt text to each one.",
      expectedImpact: "Can open new traffic channels through Google Image Search and improve accessibility compliance.", difficulty: "Low",
    },
  ];

  return { score: calcScore(metrics), metrics };
}

function buildSEOMetrics(sr, hasSitemap, hasRobots) {
  const da = sr?.domainAuthority;
  const organic = sr?.organic || sr?.domainAuthority;
  const bl = sr?.backlinks;
  const kwCount = organic?.organicKeywords || da?.organicKeywords || null;
  const traffic = organic?.organicTraffic || da?.organicTraffic || null;
  const totalBacklinks = bl?.totalBacklinks || null;
  const refDomains = bl?.referringDomains || null;

  // Estimate DA from rank (SEMrush doesn't directly give DA, but we can estimate)
  const rank = da?.rank || 0;
  const estimatedDA = rank > 0 ? Math.min(100, Math.max(1, Math.round(100 - Math.log10(rank) * 15))) : null;

  // Estimate branded traffic (not directly available — placeholder)
  const brandedPct = null; // Would need Search Console for this

  // Estimate indexation (not directly available)
  const indexation = null;

  const metrics = [
    {
      label: "Organic Keywords", value: kwCount !== null ? kwCount.toLocaleString() : "Estimated",
      status: toStatus(kwCount, 500, 200), detail: `${kwCount || "N/A"} keywords currently ranking in search results.`,
      impact: "high", why: "Keyword rankings determine how often your site appears in search results. More rankings = more potential traffic.",
      fix: "Conduct keyword gap analysis to identify high-value terms competitors rank for that you don't.",
      expectedImpact: "Expanding keyword coverage could increase organic traffic by 30-50%.", difficulty: "Medium",
    },
    {
      label: "Branded Traffic Share", value: brandedPct !== null ? `${brandedPct}%` : "Estimated",
      status: brandedPct !== null ? toStatus(brandedPct, 35, 20) : "warning",
      detail: "Estimated branded search traffic share. Connect Search Console for exact data.", impact: "high",
      estimated: brandedPct === null,
      why: "Low branded search volume means fewer people are actively looking for your company.",
      fix: "Invest in brand visibility campaigns, PR mentions, and thought leadership content.",
      expectedImpact: "Increasing branded traffic to 40%+ signals stronger brand recognition.", difficulty: "High",
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
      status: toStatus(estimatedDA, 50, 30), detail: "Indicates backlink strength and competitive positioning.",
      impact: "medium",
      why: "Domain authority reflects your site's competitive strength. Higher authority means easier rankings.",
      fix: "Build high-quality backlinks through guest posts, digital PR, and industry partnerships.",
      expectedImpact: "Reaching DA 45+ would significantly improve ranking potential.", difficulty: "High",
    },
    {
      label: "Backlink Profile", value: totalBacklinks !== null ? totalBacklinks.toLocaleString() : "Estimated",
      status: toStatus(totalBacklinks, 1000, 200), detail: refDomains ? `${refDomains} referring domains` : "Backlink data.",
      impact: "medium",
      why: "Backlinks remain one of the strongest ranking signals.",
      fix: "Disavow toxic links and pursue link-building campaigns targeting high-authority domains.",
      expectedImpact: "Improving link quality can lift rankings for mid-to-high difficulty keywords.", difficulty: "High",
    },
    {
      label: "XML Sitemap Status", value: hasSitemap ? "Found" : "Not Found", status: hasSitemap ? "good" : "poor",
      detail: hasSitemap ? "Sitemap detected and accessible." : "No sitemap found at /sitemap.xml.",
      impact: "foundational",
      why: "A sitemap helps search engines discover and understand the structure of your site.",
      fix: hasSitemap ? "No action needed." : "Create and submit an XML sitemap to search engines.",
      expectedImpact: "Maintains efficient crawl discovery for new and updated content.", difficulty: hasSitemap ? "N/A" : "Low",
    },
    {
      label: "Robots.txt Configuration", value: hasRobots ? "Yes" : "Not Found", status: hasRobots ? "good" : "warning",
      detail: hasRobots ? "Crawl directives are properly structured." : "No robots.txt found.",
      impact: "foundational",
      why: "Robots.txt controls which pages search engines can access.",
      fix: hasRobots ? "No action needed." : "Create a robots.txt file with proper crawl directives.",
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
  const wordCount = cr?.content?.wordCount ?? null;
  const contentRatio = cr?.content?.ratio ?? null;
  const internalLinks = cr?.content?.internalLinks ?? null;
  const hasMeta = cr?.meta?.description ? true : false;
  const hasH1 = cr?.meta?.hasH1 ?? null;

  const metrics = [
    {
      label: "Blog Page Exists", value: hasBlog === true ? "Yes" : hasBlog === false ? "Not Found" : "Checking...",
      status: hasBlog ? "good" : "poor", detail: hasBlog ? "A dedicated blog/news page was detected." : "No blog section detected.",
      weighted: true, impact: "foundational",
      why: "A blog page is the foundation for content marketing.", fix: hasBlog ? "No action needed." : "Create a blog section for ongoing content.",
      expectedImpact: "Provides the infrastructure for ongoing content strategy.", difficulty: hasBlog ? "N/A" : "Medium",
    },
    {
      label: "Content Freshness", value: "Estimated", status: "warning",
      detail: "Full freshness analysis requires sitemap crawl.", weighted: true, impact: "high", estimated: true,
      why: "Search engines favor sites that publish fresh content regularly.",
      fix: "Establish a minimum 2x/month publishing cadence.",
      expectedImpact: "Regular publishing can increase organic traffic by 20-40% within 6 months.", difficulty: "Medium",
    },
    {
      label: "Meta Descriptions", value: hasMeta ? "Present" : "Missing",
      status: hasMeta ? "warning" : "poor", detail: "Checked homepage meta description. Full audit requires multi-page crawl.",
      impact: "high",
      why: "Meta descriptions control how your pages appear in search results.",
      fix: "Write unique, compelling meta descriptions for all pages.",
      expectedImpact: "Optimized descriptions can improve CTR by 5-10%.", difficulty: "Low",
    },
    {
      label: "H1 Tags", value: hasH1 === true ? "Present" : hasH1 === false ? "Missing" : "Checking...",
      status: hasH1 ? "good" : "poor", detail: "Checked homepage H1 tag.", impact: "foundational",
      why: "H1 tags tell search engines the primary topic of each page.",
      fix: hasH1 ? "No action needed." : "Add a unique H1 heading to every page.",
      expectedImpact: "Maintains clear page topic signals.", difficulty: hasH1 ? "N/A" : "Low",
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
      why: "A high bounce rate means visitors leave without interacting.",
      fix: "Improve page load speed, strengthen above-the-fold content, and add clear calls to action.",
      expectedImpact: "Reducing bounce rate below 50% can significantly improve conversion rates.", difficulty: "Medium",
    },
    {
      label: "Readability Score", value: "Estimated", status: "warning",
      detail: "Full readability analysis requires content parsing.", impact: "medium", estimated: true,
      why: "Complex content limits your audience.",
      fix: "Simplify sentence structure and replace jargon with plain language.",
      expectedImpact: "Broader accessibility can increase engagement.", difficulty: "Low",
    },
    {
      label: "Word Count (top pages)", value: wordCount !== null ? `~${wordCount} words` : "Estimated",
      status: toStatus(wordCount, 1200, 600), detail: "Word count of the homepage.",
      impact: "high",
      why: "Thin content struggles to rank for competitive keywords.",
      fix: "Expand top landing pages to 1,200+ words.",
      expectedImpact: "Pages with 1,200+ words rank significantly higher.", difficulty: "Medium",
    },
    {
      label: "Internal Links / Page", value: internalLinks !== null ? `${internalLinks} found` : "Estimated",
      status: toStatus(internalLinks, 10, 3), detail: "Internal links on homepage.",
      impact: "medium",
      why: "Internal links distribute page authority and help search engines discover content.",
      fix: "Add 3-5 contextual internal links per page.",
      expectedImpact: "Better internal linking can improve crawl depth.", difficulty: "Low",
    },
    {
      label: "Content-to-Code Ratio", value: contentRatio !== null ? `${contentRatio}%` : "Estimated",
      status: toStatus(contentRatio, 25, 15), detail: "Aim for 25%+.", impact: "medium",
      why: "A low content-to-code ratio means more HTML/scripts than actual content.",
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

  const signals = [
    {
      label: "Open Graph Tags", value: og.complete ? "Complete" : og.title || og.description ? "Partial" : "Missing",
      status: og.complete ? "good" : og.title || og.description ? "warning" : "poor",
      detail: og.complete ? "All OG tags present." : "Some OG tags missing.",
      impact: "medium",
      why: "Open Graph tags control how your pages appear when shared on social media.",
      fix: "Add og:title, og:description, and og:image tags to all pages.",
      expectedImpact: "Rich social previews can increase CTR from social shares by 2-3x.", difficulty: "Low",
    },
    {
      label: "Twitter Cards", value: tw.complete ? "Complete" : tw.card ? "Partial" : "Missing",
      status: tw.complete ? "good" : tw.card ? "warning" : "poor",
      detail: tw.complete ? "Twitter Card meta tags present." : "Missing twitter:card meta tags.",
      impact: "medium",
      why: "Twitter Cards create rich media previews when links are shared.",
      fix: "Add twitter:card, twitter:title, twitter:description, and twitter:image meta tags.",
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

  const metrics = [
    {
      label: "AI Search Mentions", value: "Estimated", status: "warning", impact: "high", estimated: true,
      why: "AI search engines are becoming primary discovery channels.",
      fix: "Create comprehensive, well-structured content that AI models can easily cite.",
      expectedImpact: "Being cited in AI results can drive significant referral traffic.", difficulty: "High",
    },
    {
      label: "Structured Data",
      value: schema.types?.length > 0 ? `${schema.types.length} types found` : "None detected",
      status: schema.types?.length >= 3 ? "good" : schema.types?.length > 0 ? "warning" : "poor",
      impact: "high",
      why: "Structured data helps search engines and AI systems understand your content.",
      fix: "Implement Organization, FAQ, Service, and LocalBusiness schema.",
      expectedImpact: "Full structured data can enable rich results.", difficulty: "Medium",
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
      why: "A Knowledge Panel establishes brand authority in Google search results.",
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
  const reviewCount = placeData.reviewCount || 0;
  const rating = placeData.rating || 0;

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
      detail: hasGBP ? "GBP listing found and operational." : "No Google Business Profile found for this business.",
      impact: "foundational",
      why: "A verified GBP is required to appear in Google's local map pack.",
      fix: hasGBP ? "No action needed." : "Claim and verify your Google Business Profile.",
      expectedImpact: "Maintains eligibility for local map pack.", difficulty: hasGBP ? "N/A" : "Low",
    },
    {
      label: "Google Reviews",
      value: reviewCount > 0 ? `${rating}★ (${reviewCount} reviews)` : "No reviews found",
      status: reviewCount >= 50 ? "good" : reviewCount >= 10 ? "warning" : "poor",
      detail: reviewCount > 0 ? "Review volume and rating." : "No Google reviews detected.",
      impact: "foundational",
      why: "Review quantity and quality are direct local ranking factors.",
      fix: reviewCount >= 50 ? "Continue encouraging reviews." : "Implement a review generation strategy.",
      expectedImpact: "Ongoing review growth sustains local ranking strength.", difficulty: reviewCount >= 50 ? "N/A" : "Medium",
    },
    {
      label: "Schema Markup",
      value: schema.types?.length > 0 ? schema.types.join(", ") : "None detected",
      status: schema.hasLocalBusiness ? "good" : schema.hasOrganization ? "warning" : "poor",
      detail: "Structured data types found on the site.", impact: "high",
      why: "Limited schema means search engines have an incomplete understanding of your business.",
      fix: "Add LocalBusiness, Service, FAQ, and Review schema.",
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
      expectedImpact: "Stronger entity signals improve visibility in both traditional and AI search.", difficulty: "High",
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
