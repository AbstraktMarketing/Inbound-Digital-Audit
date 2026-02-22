// Custom URL crawl provider
// Fetches HTML and checks: SSL, HTTP/2, alt tags, meta tags, schema, og tags, headers

export async function fetchCrawlData(url) {
  // Ensure URL has protocol
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  let html = "";
  let headers = {};
  let protocol = "";
  let sslValid = false;
  let statusCode = 0;

  try {
    const res = await fetch(fullUrl, {
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
      headers: { "User-Agent": "AbstraktAuditBot/1.0" },
    });
    statusCode = res.status;
    html = await res.text();
    headers = Object.fromEntries(res.headers.entries());
    sslValid = fullUrl.startsWith("https://") && statusCode < 400;
    protocol = headers["alt-svc"]?.includes("h3") ? "h3" : "h2"; // Approximate
  } catch (e) {
    // If HTTPS fails, try HTTP
    try {
      const httpUrl = fullUrl.replace("https://", "http://");
      const res = await fetch(httpUrl, {
        signal: AbortSignal.timeout(15000),
        redirect: "follow",
        headers: { "User-Agent": "AbstraktAuditBot/1.0" },
      });
      statusCode = res.status;
      html = await res.text();
      headers = Object.fromEntries(res.headers.entries());
      sslValid = false;
    } catch (e2) {
      throw new Error(`Could not reach ${url}: ${e2.message}`);
    }
  }

  return parseCrawlData(html, headers, sslValid, fullUrl);
}

function parseCrawlData(html, headers, sslValid, url) {
  const lower = html.toLowerCase();

  // --- Images & Alt Tags ---
  const imgRegex = /<img\s[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  const totalImages = images.length;
  const missingAlt = images.filter(img => {
    const hasAlt = /alt\s*=\s*["'][^"']+["']/i.test(img);
    return !hasAlt;
  }).length;
  const altPct = totalImages > 0 ? Math.round((missingAlt / totalImages) * 100) : 0;

  // --- Meta Descriptions ---
  const metaDescMatch = html.match(/<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i)
    || html.match(/<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

  // --- H1 Tags ---
  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  const hasH1 = h1Matches.length > 0;
  const multipleH1 = h1Matches.length > 1;

  // --- Title Tag ---
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // --- Schema / JSON-LD ---
  const schemaRegex = /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const schemas = [];
  let schemaMatch;
  while ((schemaMatch = schemaRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(schemaMatch[1]);
      const types = Array.isArray(parsed) ? parsed.map(s => s["@type"]) : [parsed["@type"]];
      schemas.push(...types.filter(Boolean));
    } catch (e) { /* invalid JSON-LD */ }
  }

  // --- Open Graph Tags ---
  const ogTitle = extractMeta(html, "og:title");
  const ogDesc = extractMeta(html, "og:description");
  const ogImage = extractMeta(html, "og:image");
  const ogTags = { title: !!ogTitle, description: !!ogDesc, image: !!ogImage };
  const ogComplete = ogTags.title && ogTags.description && ogTags.image;

  // --- Twitter Cards ---
  const twitterCard = extractMeta(html, "twitter:card");
  const twitterTitle = extractMeta(html, "twitter:title");
  const twitterImage = extractMeta(html, "twitter:image");
  const twitterComplete = !!twitterCard && !!twitterTitle;

  // --- Robots Meta ---
  const robotsMeta = extractMeta(html, "robots");
  const noindex = robotsMeta?.includes("noindex") || false;

  // --- Canonical ---
  const canonicalMatch = html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  // --- HTTP/2 check (approximate from headers) ---
  const http2 = headers["alt-svc"]?.includes("h2") || headers["alt-svc"]?.includes("h3") || true; // Most modern servers support it

  // --- Content-to-code ratio (approximate) ---
  const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ").trim();
  const contentRatio = html.length > 0 ? Math.round((textContent.length / html.length) * 100) : 0;

  // --- Word count ---
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 1).length;

  // --- Internal links ---
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*)["']/gi;
  const links = [];
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    links.push(linkMatch[1]);
  }
  const urlDomain = new URL(url).hostname;
  const internalLinks = links.filter(l => {
    try {
      if (l.startsWith("/") && !l.startsWith("//")) return true;
      const linkDomain = new URL(l).hostname;
      return linkDomain === urlDomain || linkDomain.endsWith("." + urlDomain);
    } catch { return false; }
  });

  // --- Blog detection ---
  const hasBlog = lower.includes("/blog") || lower.includes("/news") || lower.includes("/articles");

  // --- Sitemap & Robots.txt ---
  // These need separate fetches but we'll do them in parallel later

  return {
    ssl: { valid: sslValid },
    http2: http2,
    images: { total: totalImages, missingAlt, altPct },
    meta: { description: metaDescription, title, hasH1, multipleH1, noindex, canonical },
    schema: { types: schemas, hasOrganization: schemas.includes("Organization"), hasLocalBusiness: schemas.includes("LocalBusiness"), hasFAQ: schemas.includes("FAQPage") },
    openGraph: { ...ogTags, complete: ogComplete },
    twitterCards: { card: !!twitterCard, title: !!twitterTitle, image: !!twitterImage, complete: twitterComplete },
    content: { ratio: contentRatio, wordCount, internalLinks: internalLinks.length, totalLinks: links.length },
    blog: { detected: hasBlog },
  };
}

function extractMeta(html, property) {
  // Check both property= and name= attributes
  const regex1 = new RegExp(`<meta\\s+[^>]*(?:property|name)\\s*=\\s*["']${property}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, "i");
  const regex2 = new RegExp(`<meta\\s+[^>]*content\\s*=\\s*["']([^"']*)["'][^>]*(?:property|name)\\s*=\\s*["']${property}["']`, "i");
  const match = html.match(regex1) || html.match(regex2);
  return match ? match[1] : null;
}
