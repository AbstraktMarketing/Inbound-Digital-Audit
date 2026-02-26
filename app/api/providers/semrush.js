// SEMrush API — domain metrics + competitor analysis

const SEMRUSH_BASE = "https://api.semrush.com";

export async function fetchSemrush(domain) {
  const apiKey = process.env.SEMRUSH_API_KEY;
  if (!apiKey) throw new Error("SEMRUSH_API_KEY not configured");

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  console.log(`[SEMrush] Fetching data for domain: ${cleanDomain}`);

  const [domainRanks, backlinks, topKeywords, competitors] = await Promise.allSettled([
    fetchDomainRanks(cleanDomain, apiKey),
    fetchBacklinksOverview(cleanDomain, apiKey),
    fetchTopKeywords(cleanDomain, apiKey),
    fetchCompetitors(cleanDomain, apiKey),
  ]);

  console.log(`[SEMrush] Results for ${cleanDomain}: ranks=${domainRanks.status}, backlinks=${backlinks.status}, keywords=${topKeywords.status}, competitors=${competitors.status}`);
  if (domainRanks.status === "rejected") console.error(`[SEMrush] domainRanks error: ${domainRanks.reason?.message}`);
  if (backlinks.status === "rejected") console.error(`[SEMrush] backlinks error: ${backlinks.reason?.message}`);

  return {
    domainAuthority: domainRanks.status === "fulfilled" ? domainRanks.value : null,
    backlinks: backlinks.status === "fulfilled" ? backlinks.value : null,
    topKeywords: topKeywords.status === "fulfilled" ? topKeywords.value : [],
    competitors: competitors.status === "fulfilled" ? competitors.value : [],
  };
}

async function fetchDomainRanks(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/?type=domain_ranks&key=${apiKey}&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${domain}&database=us`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const text = await res.text();
  if (text.includes("ERROR")) throw new Error(`SEMrush domain_ranks: ${text}`);
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const data = parseCSV(lines);
  console.log(`[SEMrush] domain_ranks headers: ${Object.keys(data).join(", ")}`);
  return {
    rank: parseInt(data["Rank"] || data["Rk"]) || 0,
    organicKeywords: parseInt(data["Organic Keywords"] || data["Or"]) || 0,
    organicTraffic: parseInt(data["Organic Traffic"] || data["Ot"]) || 0,
    organicCost: parseFloat(data["Organic Cost"] || data["Oc"]) || 0,
    adwordsKeywords: parseInt(data["Adwords Keywords"] || data["Ad"]) || 0,
    adwordsTraffic: parseInt(data["Adwords Traffic"] || data["At"]) || 0,
  };
}

async function fetchBacklinksOverview(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/analytics/v1/?key=${apiKey}&type=backlinks_overview&target=${domain}&target_type=root_domain&export_columns=total,domains_num,urls_num,ips_num,follows_num,nofollows_num,texts_num,images_num`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const text = await res.text();
  if (text.includes("ERROR")) throw new Error(`SEMrush backlinks: ${text}`);
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const data = parseCSV(lines);
  console.log(`[SEMrush] backlinks headers: ${Object.keys(data).join(", ")}`);
  return {
    totalBacklinks: parseInt(data["total"] || data["Total"]) || 0,
    referringDomains: parseInt(data["domains_num"] || data["Domains"] || data["Referring Domains"]) || 0,
    followLinks: parseInt(data["follows_num"] || data["Follow"] || data["Follows"]) || 0,
    nofollowLinks: parseInt(data["nofollows_num"] || data["Nofollow"] || data["Nofollows"]) || 0,
  };
}

async function fetchTopKeywords(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/?type=domain_organic&key=${apiKey}&export_columns=Ph,Po,Nq,Tr,Kd&domain=${domain}&database=us&display_limit=10&display_sort=tr_desc`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const text = await res.text();
  if (text.includes("ERROR")) return [];
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map(h => h.trim());
  console.log(`[SEMrush] topKeywords headers: ${headers.join(", ")}`);
  return lines.slice(1).map(line => {
    const values = line.split(";");
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i]?.trim(); });
    return {
      keyword: row["Keyword"] || row["Ph"] || "",
      position: parseInt(row["Position"] || row["Po"]) || 0,
      volume: parseInt(row["Search Volume"] || row["Nq"]) || 0,
      traffic: parseInt(row["Traffic"] || row["Tr"]) || 0,
      difficulty: parseInt(row["Keyword Difficulty"] || row["Kd"]) || 0,
    };
  }).filter(kw => kw.keyword);
}

// NEW: Fetch top organic competitors
async function fetchCompetitors(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/?type=domain_organic_organic&key=${apiKey}&export_columns=Dn,Np,Or,Ot,Oc,Ad&domain=${domain}&database=us&display_limit=5&display_sort=np_desc`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const text = await res.text();
  if (text.includes("ERROR")) return [];
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map(h => h.trim());
  console.log(`[SEMrush] competitors headers: ${headers.join(", ")}`);
  return lines.slice(1).map(line => {
    const values = line.split(";");
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i]?.trim(); });
    return {
      domain: row["Domain"] || row["Dn"] || "",
      commonKeywords: parseInt(row["Common Keywords"] || row["Np"]) || 0,
      organicKeywords: parseInt(row["Organic Keywords"] || row["Or"]) || 0,
      organicTraffic: parseInt(row["Organic Traffic"] || row["Ot"]) || 0,
      organicCost: parseFloat(row["Organic Cost"] || row["Oc"]) || 0,
    };
  }).filter(c => c.domain);
}

// NEW: Fetch Site Audit health score from SEMrush project
// Flow: 1) Get latest snapshot ID  2) Get snapshot details with actual quality score
export async function fetchSiteAudit(projectId, apiKey) {
  if (!projectId) return null;
  if (!apiKey) apiKey = process.env.SEMRUSH_API_KEY;
  if (!apiKey) throw new Error("SEMRUSH_API_KEY not configured");

  // Step 1: Get list of snapshots to find the latest one
  const snapshotsUrl = `https://api.semrush.com/reports/v1/projects/${projectId}/siteaudit/snapshots?key=${apiKey}`;
  const snapRes = await fetch(snapshotsUrl, { signal: AbortSignal.timeout(10000) });
  
  if (!snapRes.ok) {
    const text = await snapRes.text();
    console.error(`[SEMrush] Site Audit snapshots failed (${snapRes.status}): ${text}`);
    return null;
  }

  const snapData = await snapRes.json();
  const snapshots = snapData.snapshots || [];
  
  if (snapshots.length === 0) {
    console.warn("[SEMrush] No site audit snapshots found — audit may not have run yet");
    return null;
  }

  // Get the most recent snapshot (last in array, or sort by finish_date)
  const latest = snapshots.sort((a, b) => (b.finish_date || 0) - (a.finish_date || 0))[0];
  console.log(`[SEMrush] Latest snapshot: ${latest.snapshot_id}, finished: ${new Date(latest.finish_date).toISOString()}`);

  // Step 2: Get snapshot details — this returns the actual quality.value score
  const detailUrl = `https://api.semrush.com/reports/v1/projects/${projectId}/siteaudit/snapshot?key=${apiKey}&snapshot_id=${latest.snapshot_id}`;
  const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10000) });

  if (!detailRes.ok) {
    const text = await detailRes.text();
    console.error(`[SEMrush] Site Audit snapshot detail failed (${detailRes.status}): ${text}`);
    return null;
  }

  const detail = await detailRes.json();
  const score = detail.quality?.value ?? null;
  const scoreDelta = detail.quality?.delta ?? 0;

  // Count errors and warnings from the detailed breakdown
  const errors = (detail.errors || []).reduce((sum, e) => sum + (e.count || 0), 0);
  const warnings = (detail.warnings || []).reduce((sum, w) => sum + (w.count || 0), 0);
  const notices = (detail.notices || []).reduce((sum, n) => sum + (n.count || 0), 0);
  const totalChecks = (detail.errors || []).reduce((sum, e) => sum + (e.checks || 0), 0)
    + (detail.warnings || []).reduce((sum, w) => sum + (w.checks || 0), 0);

  console.log(`[SEMrush] Site Audit score: ${score}% (delta: ${scoreDelta}), errors: ${errors}, warnings: ${warnings}, notices: ${notices}`);

  return {
    status: "FINISHED",
    score: score,
    scoreDelta: scoreDelta,
    errors: errors,
    warnings: warnings,
    notices: notices,
    pagesCrawled: detail.pages_crawled || snapshots.length > 0 ? detail.pages_crawled || 0 : 0,
    totalChecks: totalChecks,
    snapshotId: latest.snapshot_id,
    // Top issues with counts for the breakdown card
    topIssues: [
      ...(detail.errors || []).map(e => ({ issueId: e.id, count: e.count, type: "error" })),
      ...(detail.warnings || []).map(w => ({ issueId: w.id, count: w.count, type: "warning" })),
    ].sort((a, b) => b.count - a.count).slice(0, 10),
  };
}

function parseCSV(lines) {
  const headers = lines[0].split(";");
  const values = lines[1].split(";");
  const data = {};
  headers.forEach((h, i) => { data[h.trim()] = values[i]?.trim(); });
  return data;
}
