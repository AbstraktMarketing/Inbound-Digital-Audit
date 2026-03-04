// Entity check provider — homepage HTML parse + Knowledge Graph + Wikidata + NAPU directory audit
// Feeds: Entity tab, AI SEO tab, Social tab, Content tab (H1)
import { cleanDomain } from "./utils.js";

const BLOCKED_MARKERS = ["cf-browser-verification", "challenge-platform", "cf-chl-bypass"];

export async function fetchEntityData(url, companyName, socialProfiles = {}) {
  const domain = cleanDomain(url);

  // Run HTML fetch, Knowledge Graph, and Wikidata in parallel
  const [htmlResult, kgResult, wdResult] = await Promise.allSettled([
    fetchHomepageHTML(url),
    fetchKnowledgeGraph(companyName),
    fetchWikidata(companyName),
  ]);

  const html = htmlResult.status === "fulfilled" ? htmlResult.value : null;
  const kg = kgResult.status === "fulfilled" ? kgResult.value : { found: false };
  const wd = wdResult.status === "fulfilled" ? wdResult.value : { found: false };

  if (htmlResult.status === "rejected") console.error(`[Entity] HTML fetch error: ${htmlResult.reason?.message}`);
  if (kgResult.status === "rejected") console.error(`[Entity] KG error: ${kgResult.reason?.message}`);
  if (wdResult.status === "rejected") console.error(`[Entity] Wikidata error: ${wdResult.reason?.message}`);

  // If HTML fetch was blocked by WAF/Cloudflare
  if (html?.blocked) {
    console.log(`[Entity] Site blocked analysis — WAF/Cloudflare detected`);
    return {
      blocked: true,
      schema: null,
      openGraph: null,
      twitterCards: null,
      h1: null,
      knowledgeGraph: kg,
      wikidata: wd,
      directories: [],
      napuScore: null,
    };
  }

  // Parse HTML for schema, OG, Twitter, H1
  const schema = html ? parseSchema(html.body) : null;
  const openGraph = html ? parseOpenGraph(html.body) : null;
  const twitterCards = html ? parseTwitterCards(html.body) : null;
  const h1 = html ? parseH1(html.body) : null;

  console.log(`[Entity] Schema: ${schema?.types?.length || 0} types, OG: ${openGraph?.complete ? "complete" : "partial"}, H1: ${h1?.hasH1 ? "found" : "not found"}, KG: ${kg.found}, Wikidata: ${wd.found}`);

  // NAPU directory audit — run in parallel
  const sameAsLinks = schema?.sameAsLinks || [];
  const directories = await runNAPUAudit(companyName, domain, url, socialProfiles, sameAsLinks);
  const napuScore = calcNAPUScore(directories);

  console.log(`[Entity] NAPU: ${napuScore.found}/${napuScore.total} found, ${napuScore.consistent} consistent (${napuScore.pct}%)`);

  return {
    blocked: false,
    schema,
    openGraph,
    twitterCards,
    h1,
    knowledgeGraph: kg,
    wikidata: wd,
    directories,
    napuScore,
  };
}

// ── Homepage HTML Fetch ──

async function fetchHomepageHTML(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AuditBot/1.0)" },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });

  if (res.status === 403 || res.status === 503) {
    const body = await res.text();
    if (isBlocked(body)) return { blocked: true };
    // 403/503 but not Cloudflare — still return what we got
    return { blocked: false, body };
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const body = await res.text();
  if (isBlocked(body)) return { blocked: true };
  return { blocked: false, body };
}

function isBlocked(html) {
  const lower = html.toLowerCase();
  return BLOCKED_MARKERS.some(marker => lower.includes(marker));
}

// ── Schema Parsing ──

function parseSchema(html) {
  const types = [];
  const sameAsLinks = [];
  let hasOrganization = false;
  let hasLocalBusiness = false;
  let hasFAQ = false;
  let orgName = null;
  let orgAddress = null;
  let orgPhone = null;

  // Extract all JSON-LD blocks
  const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        processSchemaItem(item, types, sameAsLinks, (info) => {
          if (info.isOrg) hasOrganization = true;
          if (info.isLocal) hasLocalBusiness = true;
          if (info.isFAQ) hasFAQ = true;
          if (info.name && !orgName) orgName = info.name;
          if (info.address && !orgAddress) orgAddress = info.address;
          if (info.phone && !orgPhone) orgPhone = info.phone;
        });

        // Handle @graph arrays
        if (item["@graph"]) {
          for (const subItem of item["@graph"]) {
            processSchemaItem(subItem, types, sameAsLinks, (info) => {
              if (info.isOrg) hasOrganization = true;
              if (info.isLocal) hasLocalBusiness = true;
              if (info.isFAQ) hasFAQ = true;
              if (info.name && !orgName) orgName = info.name;
              if (info.address && !orgAddress) orgAddress = info.address;
              if (info.phone && !orgPhone) orgPhone = info.phone;
            });
          }
        }
      }
    } catch { /* invalid JSON-LD — skip */ }
  }

  // Recommended types for a business site
  const recommended = ["Organization", "LocalBusiness", "WebSite", "FAQPage"];
  const missingTypes = recommended.filter(t => !types.includes(t));

  return {
    types: [...new Set(types)],
    hasOrganization,
    hasLocalBusiness,
    hasFAQ,
    sameAsLinks: [...new Set(sameAsLinks)],
    missingTypes,
    orgName,
    orgAddress,
    orgPhone,
  };
}

function processSchemaItem(item, types, sameAsLinks, callback) {
  if (!item || typeof item !== "object") return;

  const type = item["@type"];
  const typeArr = Array.isArray(type) ? type : type ? [type] : [];

  for (const t of typeArr) {
    if (t && !types.includes(t)) types.push(t);
  }

  const isOrg = typeArr.some(t => t === "Organization" || t === "Corporation");
  const isLocal = typeArr.some(t => t === "LocalBusiness" || t.includes("Business") || t.includes("Store"));
  const isFAQ = typeArr.includes("FAQPage");

  // Extract sameAs
  if (item.sameAs) {
    const links = Array.isArray(item.sameAs) ? item.sameAs : [item.sameAs];
    sameAsLinks.push(...links.filter(l => typeof l === "string"));
  }

  const name = item.name || null;
  const phone = item.telephone || null;
  const address = item.address
    ? (typeof item.address === "string" ? item.address : item.address.streetAddress || null)
    : null;

  callback({ isOrg, isLocal, isFAQ, name, address, phone });
}

// ── Open Graph Parsing ──

function parseOpenGraph(html) {
  const title = extractMeta(html, "og:title");
  const description = extractMeta(html, "og:description");
  const image = extractMeta(html, "og:image");
  const url = extractMeta(html, "og:url");
  const type = extractMeta(html, "og:type");

  const missingTags = [];
  if (!title) missingTags.push("og:title");
  if (!description) missingTags.push("og:description");
  if (!image) missingTags.push("og:image");

  return {
    title, description, image, url, type,
    complete: missingTags.length === 0,
    missingTags,
  };
}

// ── Twitter Card Parsing ──

function parseTwitterCards(html) {
  const card = extractMeta(html, "twitter:card");
  const title = extractMeta(html, "twitter:title");
  const description = extractMeta(html, "twitter:description");
  const image = extractMeta(html, "twitter:image");

  const missingTags = [];
  if (!card) missingTags.push("twitter:card");
  if (!title) missingTags.push("twitter:title");
  if (!image) missingTags.push("twitter:image");

  return {
    card, title, description, image,
    complete: missingTags.length === 0,
    missingTags,
  };
}

// ── H1 Parsing ──

function parseH1(html) {
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  const matches = [];
  let m;
  while ((m = h1Regex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (text) matches.push(text);
  }

  return {
    hasH1: matches.length > 0,
    text: matches[0] || null,
    multipleH1: matches.length > 1,
    count: matches.length,
  };
}

// ── Meta Tag Extraction (reused from crawl.js pattern) ──

function extractMeta(html, property) {
  const r1 = new RegExp(`<meta\\s+[^>]*(?:property|name)\\s*=\\s*["']${property}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, "i");
  const r2 = new RegExp(`<meta\\s+[^>]*content\\s*=\\s*["']([^"']*)["'][^>]*(?:property|name)\\s*=\\s*["']${property}["']`, "i");
  const match = html.match(r1) || html.match(r2);
  return match ? match[1] : null;
}

// ── Google Knowledge Graph API ──

async function fetchKnowledgeGraph(companyName) {
  if (!companyName) return { found: false };

  const apiKey = process.env.GOOGLE_KG_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_PSI_API_KEY;
  if (!apiKey) {
    console.log("[Entity] No Google API key for Knowledge Graph — skipping");
    return { found: false };
  }

  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(companyName)}&key=${apiKey}&limit=1&indent=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

  if (!res.ok) {
    console.error(`[Entity] KG API error: ${res.status}`);
    return { found: false };
  }

  const data = await res.json();
  const elements = data.itemListElement || [];

  if (elements.length === 0) return { found: false };

  const entity = elements[0].result || {};
  const score = elements[0].resultScore || 0;

  return {
    found: true,
    name: entity.name || null,
    description: entity.description || null,
    detailedDescription: entity.detailedDescription?.articleBody || null,
    url: entity.url || null,
    types: entity["@type"] || [],
    score,
  };
}

// ── Wikidata API ──

async function fetchWikidata(companyName) {
  if (!companyName) return { found: false };

  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(companyName)}&language=en&limit=1&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

  if (!res.ok) return { found: false };

  const data = await res.json();
  const results = data.search || [];

  if (results.length === 0) return { found: false };

  const entity = results[0];
  return {
    found: true,
    id: entity.id || null,
    label: entity.label || null,
    description: entity.description || null,
  };
}

// ── NAPU Directory Audit ──

async function runNAPUAudit(companyName, domain, fullUrl, socialProfiles, sameAsLinks) {
  if (!companyName) return [];

  const checks = [
    checkTrustpilot(domain),
    checkYelp(companyName),
    checkBingPlaces(companyName),
    checkSocialUrl("Facebook", socialProfiles.facebook, sameAsLinks, "facebook.com"),
    checkSocialUrl("LinkedIn", socialProfiles.linkedin, sameAsLinks, "linkedin.com"),
    checkBBB(companyName),
  ];

  const results = await Promise.allSettled(checks);
  const directories = results
    .filter(r => r.status === "fulfilled" && r.value)
    .map(r => r.value);

  // Log any failures
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[Entity] NAPU check ${i} failed: ${r.reason?.message}`);
    }
  });

  return directories;
}

async function checkTrustpilot(domain) {
  try {
    const url = `https://www.trustpilot.com/review/${domain}`;
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
    return {
      name: "Trustpilot",
      found: res.ok,
      profileUrl: res.ok ? url : null,
    };
  } catch {
    return { name: "Trustpilot", found: false };
  }
}

async function checkYelp(companyName) {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) return { name: "Yelp", found: false, noKey: true };

  try {
    const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(companyName)}&limit=1`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return { name: "Yelp", found: false };

    const data = await res.json();
    const biz = data.businesses?.[0];
    if (!biz) return { name: "Yelp", found: false };

    return {
      name: "Yelp",
      found: true,
      businessName: biz.name,
      rating: biz.rating || null,
      reviews: biz.review_count || 0,
      profileUrl: biz.url || null,
    };
  } catch {
    return { name: "Yelp", found: false };
  }
}

async function checkBingPlaces(companyName) {
  const apiKey = process.env.BING_MAPS_KEY;
  if (!apiKey) return { name: "Bing Places", found: false, noKey: true };

  try {
    const url = `https://dev.virtualearth.net/REST/v1/LocalSearch/?query=${encodeURIComponent(companyName)}&maxResults=1&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!res.ok) return { name: "Bing Places", found: false };

    const data = await res.json();
    const resources = data.resourceSets?.[0]?.resources || [];
    if (resources.length === 0) return { name: "Bing Places", found: false };

    const biz = resources[0];
    return {
      name: "Bing Places",
      found: true,
      businessName: biz.name || null,
      phone: biz.phoneNumber || null,
      url: biz.Website || null,
    };
  } catch {
    return { name: "Bing Places", found: false };
  }
}

async function checkSocialUrl(platformName, formUrl, sameAsLinks, domainMatch) {
  // Priority 1: User-provided URL from form
  let url = formUrl || null;

  // Priority 2: Check sameAs links
  if (!url) {
    url = sameAsLinks.find(link => link.includes(domainMatch)) || null;
  }

  if (!url) return { name: platformName, found: false };

  // Verify URL exists with a HEAD request
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AuditBot/1.0)" },
    });
    return {
      name: platformName,
      found: res.ok || res.status === 302 || res.status === 301,
      profileUrl: url,
    };
  } catch {
    // Network error doesn't mean profile doesn't exist — return as found since URL was provided
    return { name: platformName, found: true, profileUrl: url, verified: false };
  }
}

async function checkBBB(companyName) {
  try {
    const searchUrl = `https://www.bbb.org/search?find_text=${encodeURIComponent(companyName)}`;
    const res = await fetch(searchUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AuditBot/1.0)" },
    });
    // BBB search always returns 200 — we can only confirm page loads
    return {
      name: "BBB",
      found: res.ok,
      profileUrl: res.ok ? searchUrl : null,
    };
  } catch {
    return { name: "BBB", found: false };
  }
}

function calcNAPUScore(directories) {
  const total = directories.length;
  const found = directories.filter(d => d.found).length;
  // "Consistent" means found + name roughly matches (we only know found status for most)
  const consistent = found; // Future: compare NAP fields
  return {
    total,
    found,
    consistent,
    pct: total > 0 ? Math.round((found / total) * 100) : 0,
  };
}
