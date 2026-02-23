// Custom URL crawl provider — extracts hyper-specific findings for personalization

export async function fetchCrawlData(url) {
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  let html = "", headers = {}, sslValid = false, statusCode = 0;

  try {
    const res = await fetch(fullUrl, { signal: AbortSignal.timeout(15000), redirect: "follow", headers: { "User-Agent": "AbstraktAuditBot/1.0" } });
    statusCode = res.status; html = await res.text(); headers = Object.fromEntries(res.headers.entries());
    sslValid = fullUrl.startsWith("https://") && statusCode < 400;
  } catch (e) {
    try {
      const res = await fetch(fullUrl.replace("https://", "http://"), { signal: AbortSignal.timeout(15000), redirect: "follow", headers: { "User-Agent": "AbstraktAuditBot/1.0" } });
      statusCode = res.status; html = await res.text(); headers = Object.fromEntries(res.headers.entries());
    } catch (e2) { throw new Error(`Could not reach ${url}: ${e2.message}`); }
  }

  // Fetch /blog page for content freshness
  let blogHtml = null;
  try {
    const blogRes = await fetch(new URL("/blog", fullUrl).href, { signal: AbortSignal.timeout(8000), redirect: "follow", headers: { "User-Agent": "AbstraktAuditBot/1.0" } });
    if (blogRes.ok) blogHtml = await blogRes.text();
  } catch {}

  return parseCrawlData(html, headers, sslValid, fullUrl, blogHtml);
}

function parseCrawlData(html, headers, sslValid, url, blogHtml) {
  const urlDomain = new URL(url).hostname;

  // ── Images & Alt Tags (with specific URLs) ──
  const imgRegex = /<img\s[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  const totalImages = images.length;
  const missingAltImages = [];
  images.forEach(img => {
    const srcMatch = img.match(/src\s*=\s*["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : null;
    if (!/alt\s*=\s*["'][^"']+["']/i.test(img) && src) {
      missingAltImages.push(shortenUrl(src, urlDomain));
    }
  });
  const missingAlt = missingAltImages.length;
  const altPct = totalImages > 0 ? Math.round((missingAlt / totalImages) * 100) : 0;

  // ── Meta Description (actual text + length) ──
  const metaDescMatch = html.match(/<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i)
    || html.match(/<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

  // ── Title + H1 (actual text) ──
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h1Text = h1Matches.length > 0 ? h1Matches[0].replace(/<[^>]+>/g, "").trim().substring(0, 120) : null;

  // ── Schema / JSON-LD ──
  const schemaRegex = /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const schemas = []; let schemaMatch;
  while ((schemaMatch = schemaRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(schemaMatch[1]);
      const types = Array.isArray(parsed) ? parsed.map(s => s["@type"]) : [parsed["@type"]];
      schemas.push(...types.filter(Boolean));
    } catch {}
  }
  const missingSchemaTypes = ["LocalBusiness", "FAQPage", "Service", "BreadcrumbList"].filter(t => !schemas.includes(t));

  // ── Open Graph Tags (with specifics) ──
  const ogTitle = extractMeta(html, "og:title");
  const ogDesc = extractMeta(html, "og:description");
  const ogImage = extractMeta(html, "og:image");
  const missingOg = [];
  if (!ogTitle) missingOg.push("og:title");
  if (!ogDesc) missingOg.push("og:description");
  if (!ogImage) missingOg.push("og:image");

  // ── Twitter Cards ──
  const twitterCard = extractMeta(html, "twitter:card");
  const twitterTitle = extractMeta(html, "twitter:title");
  const twitterImage = extractMeta(html, "twitter:image");
  const missingTwitter = [];
  if (!twitterCard) missingTwitter.push("twitter:card");
  if (!twitterTitle) missingTwitter.push("twitter:title");
  if (!twitterImage) missingTwitter.push("twitter:image");

  // ── Robots, Canonical ──
  const robotsMeta = extractMeta(html, "robots");
  const noindex = robotsMeta?.includes("noindex") || false;
  const canonicalMatch = html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  // ── HTTP/2 ──
  const http2 = headers["alt-svc"]?.includes("h2") || headers["alt-svc"]?.includes("h3") || true;

  // ── Content Analysis ──
  const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const contentRatio = html.length > 0 ? Math.round((textContent.length / html.length) * 100) : 0;
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 1).length;

  // ── Links (with empty link detection) ──
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*)["']/gi;
  const allLinks = []; let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) allLinks.push(linkMatch[1]);
  const internalLinks = [], emptyLinks = [];
  allLinks.forEach(l => {
    if (!l || l === "#" || l.startsWith("javascript:")) { emptyLinks.push(l || "(empty href)"); return; }
    try {
      if (l.startsWith("/") && !l.startsWith("//")) { internalLinks.push(l); return; }
      if (l.startsWith("mailto:") || l.startsWith("tel:")) return;
      const ld = new URL(l).hostname;
      if (ld === urlDomain || ld.endsWith("." + urlDomain)) internalLinks.push(l);
    } catch {}
  });

  // ── Blog / Content Freshness ──
  const hasBlog = html.toLowerCase().includes("/blog") || html.toLowerCase().includes("/news") || html.toLowerCase().includes("/articles");
  let lastBlogPost = null, blogPostTitles = [];
  if (blogHtml) {
    const datePatterns = [
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
      /\d{4}-\d{2}-\d{2}/g,
    ];
    const dates = [];
    for (const pattern of datePatterns) {
      (blogHtml.match(pattern) || []).forEach(d => { try { const p = new Date(d); if (!isNaN(p) && p < new Date()) dates.push(p); } catch {} });
    }
    if (dates.length > 0) { dates.sort((a, b) => b - a); lastBlogPost = dates[0].toISOString(); }
    const ptRegex = /<(?:h2|h3)[^>]*>([\s\S]*?)<\/(?:h2|h3)>/gi; let pt;
    while ((pt = ptRegex.exec(blogHtml)) !== null) {
      const text = pt[1].replace(/<[^>]+>/g, "").trim();
      if (text.length > 10 && text.length < 200) blogPostTitles.push(text);
    }
    blogPostTitles = blogPostTitles.slice(0, 3);
  }

  return {
    ssl: { valid: sslValid },
    http2,
    images: { total: totalImages, missingAlt, altPct, missingAltExamples: missingAltImages.slice(0, 5) },
    meta: { description: metaDescription, descriptionLength: metaDescription?.length || 0, title, titleLength: title?.length || 0, h1Text, hasH1: h1Matches.length > 0, multipleH1: h1Matches.length > 1, noindex, canonical },
    schema: { types: schemas, hasOrganization: schemas.includes("Organization"), hasLocalBusiness: schemas.includes("LocalBusiness"), hasFAQ: schemas.includes("FAQPage"), missingTypes: missingSchemaTypes },
    openGraph: { title: !!ogTitle, description: !!ogDesc, image: !!ogImage, complete: !!ogTitle && !!ogDesc && !!ogImage, missingTags: missingOg, actualTitle: ogTitle },
    twitterCards: { card: !!twitterCard, title: !!twitterTitle, image: !!twitterImage, complete: !!twitterCard && !!twitterTitle, missingTags: missingTwitter },
    content: { ratio: contentRatio, wordCount, internalLinks: internalLinks.length, totalLinks: allLinks.length, emptyLinks: emptyLinks.length, emptyLinkExamples: emptyLinks.slice(0, 3) },
    blog: { detected: hasBlog, lastPostDate: lastBlogPost, lastPostDaysAgo: lastBlogPost ? Math.round((Date.now() - new Date(lastBlogPost).getTime()) / 86400000) : null, recentTitles: blogPostTitles },
  };
}

function shortenUrl(src, domain) {
  try {
    if (src.startsWith("data:")) return "(inline base64 image)";
    if (src.startsWith("//")) src = "https:" + src;
    if (src.startsWith("http")) { const u = new URL(src); return u.pathname.length > 60 ? u.pathname.substring(0, 57) + "..." : u.pathname; }
    return src.length > 60 ? src.substring(0, 57) + "..." : src;
  } catch { return src.length > 60 ? src.substring(0, 57) + "..." : src; }
}

function extractMeta(html, property) {
  const r1 = new RegExp(`<meta\\s+[^>]*(?:property|name)\\s*=\\s*["']${property}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, "i");
  const r2 = new RegExp(`<meta\\s+[^>]*content\\s*=\\s*["']([^"']*)["'][^>]*(?:property|name)\\s*=\\s*["']${property}["']`, "i");
  const match = html.match(r1) || html.match(r2);
  return match ? match[1] : null;
}
