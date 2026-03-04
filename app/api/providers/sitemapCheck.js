// Sitemap discovery, parsing, and blog sampling provider
import { USER_AGENT } from "./utils.js";

const BLOG_PATTERNS = ["/blog", "/news", "/articles", "/resources", "/insights", "/posts", "/updates"];
const TIMEOUT = 5000;

/**
 * Discover and parse sitemap, sample blog posts for share buttons + freshness.
 * Discovery: /sitemap.xml → /sitemap_index.xml → robots.txt Sitemap: directive
 */
export async function fetchSitemap(url, blogUrl) {
  const base = url.replace(/\/+$/, "");

  try {
    // Step 1: Discover sitemap
    const { xml, location } = await discoverSitemap(base);
    if (!xml) {
      console.log("[Sitemap] No sitemap found");
      return { found: false, location: null, totalPages: 0, lastModified: null, blogDetected: false, blogUrls: 0, mostRecentBlogDate: null, blogSample: [], socialShareButtons: { detected: false, platforms: [], method: null, postsChecked: 0, postsWithButtons: 0 } };
    }

    // Step 2: Parse XML for URLs + lastmod
    let urls = parseUrlsFromXml(xml);

    // If this is a sitemap index, follow up to 3 child sitemaps
    const childSitemaps = parseSitemapIndex(xml);
    if (childSitemaps.length > 0) {
      console.log(`[Sitemap] Found sitemap index with ${childSitemaps.length} children, fetching up to 3`);
      const children = childSitemaps.slice(0, 3);
      const childResults = await Promise.allSettled(children.map(u => fetchXml(u)));
      for (const r of childResults) {
        if (r.status === "fulfilled" && r.value) {
          urls = urls.concat(parseUrlsFromXml(r.value));
        }
      }
    }

    console.log(`[Sitemap] Found ${urls.length} URLs from ${location}`);

    // Step 3: Find blog URLs and most recent lastmod
    // If a custom blogUrl was provided, use its path as the primary pattern
    const blogPatterns = blogUrl
      ? [new URL(blogUrl.startsWith("http") ? blogUrl : `https://${blogUrl}`).pathname.replace(/\/+$/, ""), ...BLOG_PATTERNS]
      : BLOG_PATTERNS;
    const blogUrls = urls.filter(u => blogPatterns.some(p => u.loc.toLowerCase().includes(p.toLowerCase())));
    const allDates = urls.map(u => u.lastmod).filter(Boolean).sort().reverse();
    const blogDates = blogUrls.map(u => u.lastmod).filter(Boolean).sort().reverse();
    const mostRecentBlogDate = blogDates[0] || null;
    const lastModified = allDates[0] || null;

    // Step 4: Sample 3 most recent blog posts for share buttons + freshness
    let blogSample = [];
    let socialShareButtons = { detected: false, platforms: [], method: null, postsChecked: 0, postsWithButtons: 0 };

    if (blogUrls.length > 0) {
      // Sort by lastmod (newest first), fall back to position in sitemap
      const sorted = [...blogUrls].sort((a, b) => {
        if (a.lastmod && b.lastmod) return b.lastmod.localeCompare(a.lastmod);
        if (a.lastmod) return -1;
        if (b.lastmod) return 1;
        return 0;
      });

      const toSample = sorted.slice(0, 3);
      const sampleResults = await Promise.allSettled(
        toSample.map(u => fetchBlogPost(u.loc, u.lastmod))
      );

      const allPlatforms = new Set();
      let method = null;
      let postsWithButtons = 0;

      for (const r of sampleResults) {
        if (r.status === "fulfilled" && r.value) {
          blogSample.push({ url: r.value.url, title: r.value.title, date: r.value.date });
          if (r.value.shareButtons.detected) {
            postsWithButtons++;
            r.value.shareButtons.platforms.forEach(p => allPlatforms.add(p));
            if (r.value.shareButtons.method) method = r.value.shareButtons.method;
          }
        }
      }

      socialShareButtons = {
        detected: postsWithButtons >= 2,
        platforms: [...allPlatforms],
        method,
        postsChecked: blogSample.length,
        postsWithButtons,
      };
    }

    return {
      found: true,
      location,
      totalPages: urls.length,
      lastModified,
      blogDetected: blogUrls.length > 0,
      blogUrls: blogUrls.length,
      mostRecentBlogDate,
      blogSample,
      socialShareButtons,
    };
  } catch (err) {
    console.error(`[Sitemap] Error: ${err.message}`);
    return { found: false, location: null, totalPages: 0, lastModified: null, blogDetected: false, blogUrls: 0, mostRecentBlogDate: null, blogSample: [], socialShareButtons: { detected: false, platforms: [], method: null, postsChecked: 0, postsWithButtons: 0 } };
  }
}

// ── Discovery ──

async function discoverSitemap(base) {
  // Try /sitemap.xml first
  const xml1 = await fetchXml(`${base}/sitemap.xml`);
  if (xml1) return { xml: xml1, location: "/sitemap.xml" };

  // Try /sitemap_index.xml
  const xml2 = await fetchXml(`${base}/sitemap_index.xml`);
  if (xml2) return { xml: xml2, location: "/sitemap_index.xml" };

  // Check robots.txt for Sitemap: directive
  try {
    const res = await fetch(`${base}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/^Sitemap:\s*(.+)/im);
      if (match) {
        const sitemapUrl = match[1].trim();
        const xml3 = await fetchXml(sitemapUrl);
        if (xml3) return { xml: xml3, location: `robots.txt → ${sitemapUrl}` };
      }
    }
  } catch { /* ignore */ }

  return { xml: null, location: null };
}

async function fetchXml(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Basic validation — must contain XML-like content
    if (!text.includes("<url") && !text.includes("<sitemap")) return null;
    return text;
  } catch { return null; }
}

// ── XML Parsing (regex-based, no dependency) ──

function parseUrlsFromXml(xml) {
  const urls = [];
  const urlBlocks = xml.match(/<url>([\s\S]*?)<\/url>/gi) || [];
  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/i);
    const lastmodMatch = block.match(/<lastmod>(.*?)<\/lastmod>/i);
    if (locMatch) {
      urls.push({
        loc: locMatch[1].trim(),
        lastmod: lastmodMatch ? lastmodMatch[1].trim() : null,
      });
    }
  }
  return urls;
}

function parseSitemapIndex(xml) {
  // Detect sitemap index by <sitemapindex> or <sitemap> tags
  if (!xml.includes("<sitemapindex") && !xml.includes("<sitemap>")) return [];
  const sitemaps = [];
  const blocks = xml.match(/<sitemap>([\s\S]*?)<\/sitemap>/gi) || [];
  for (const block of blocks) {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/i);
    if (locMatch) sitemaps.push(locMatch[1].trim());
  }
  return sitemaps;
}

// ── Blog Post Sampling ──

async function fetchBlogPost(url, sitemapDate) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(3000),
    });

    // Blocking detection
    if (res.status === 403 || res.status === 503) {
      return { url, title: null, date: sitemapDate, shareButtons: { detected: false, blocked: true, platforms: [], method: null } };
    }

    if (!res.ok) return null;
    const html = await res.text();

    // Check for WAF challenge pages
    if (html.includes("cf-browser-verification") || html.includes("challenge-platform") || html.includes("cf-chl-bypass")) {
      return { url, title: null, date: sitemapDate, shareButtons: { detected: false, blocked: true, platforms: [], method: null } };
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : null;

    // Extract date from page (look for common date patterns)
    let date = sitemapDate;
    if (!date) {
      // Try article:published_time meta
      const dateMetaMatch = html.match(/<meta[^>]*(?:property|name)=["']article:published_time["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']article:published_time["']/i);
      if (dateMetaMatch) date = dateMetaMatch[1];
    }

    // Detect social share buttons
    const shareButtons = detectShareButtons(html);

    return { url, title, date, shareButtons };
  } catch {
    return null;
  }
}

function detectShareButtons(html) {
  const platforms = new Set();
  let method = null;

  // Check for share widget scripts
  if (html.includes("addthis.com")) { method = "AddThis"; }
  else if (html.includes("sharethis.com")) { method = "ShareThis"; }
  else if (html.includes("addtoany.com")) { method = "AddToAny"; }
  else if (html.includes("sumo.com") && html.includes("share")) { method = "Sumo"; }

  // Check for share intent URLs
  if (html.includes("twitter.com/intent/tweet") || html.includes("x.com/intent/tweet")) platforms.add("twitter");
  if (html.includes("facebook.com/sharer")) platforms.add("facebook");
  if (html.includes("linkedin.com/shareArticle") || html.includes("linkedin.com/share")) platforms.add("linkedin");
  if (html.includes("pinterest.com/pin/create")) platforms.add("pinterest");
  if (html.includes("reddit.com/submit")) platforms.add("reddit");

  // Check for share-related CSS classes (rough scan)
  if (html.match(/class=["'][^"']*(?:share-button|social-share|sharing-icon|share-link)[^"']*/i)) {
    if (platforms.size === 0) method = method || "custom";
  }

  const detected = method !== null || platforms.size >= 2;
  return { detected, platforms: [...platforms], method };
}
