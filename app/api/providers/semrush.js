// SEMrush API — domain metrics + competitor analysis

const SEMRUSH_BASE = "https://api.semrush.com";

export async function fetchSemrush(domain) {
  const apiKey = process.env.SEMRUSH_API_KEY;
  if (!apiKey) throw new Error("SEMRUSH_API_KEY not configured");

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

  const [domainRanks, organicKeywords, backlinks, topKeywords, competitors] = await Promise.allSettled([
    fetchDomainRanks(cleanDomain, apiKey),
    fetchOrganicOverview(cleanDomain, apiKey),
    fetchBacklinksOverview(cleanDomain, apiKey),
    fetchTopKeywords(cleanDomain, apiKey),
    fetchCompetitors(cleanDomain, apiKey),
  ]);

  return {
    domainAuthority: domainRanks.status === "fulfilled" ? domainRanks.value : null,
    organic: organicKeywords.status === "fulfilled" ? organicKeywords.value : null,
    backlinks: backlinks.status === "fulfilled" ? backlinks.value : null,
    topKeywords: topKeywords.status === "fulfilled" ? topKeywords.value : [],
    competitors: competitors.status === "fulfilled" ? competitors.value : [],
  };
}

async function fetchDomainRanks(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/?type=domain_ranks&key=${apiKey}&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${domain}&database=us`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  if (text.includes("ERROR")) throw new Error(`SEMrush domain_ranks: ${text}`);
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const data = parseCSV(lines);
  return {
    rank: parseInt(data["Rk"]) || 0,
    organicKeywords: parseInt(data["Or"]) || 0,
    organicTraffic: parseInt(data["Ot"]) || 0,
    organicCost: parseFloat(data["Oc"]) || 0,
    adwordsKeywords: parseInt(data["Ad"]) || 0,
    adwordsTraffic: parseInt(data["At"]) || 0,
  };
}

async function fetchOrganicOverview(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/?type=domain_organic&key=${apiKey}&export_columns=Dn,Nq,Or,Ot,Oc,Om&domain=${domain}&database=us&display_limit=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  if (text.includes("ERROR")) throw new Error(`SEMrush domain_organic: ${text}`);
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const data = parseCSV(lines);
  return {
    organicKeywords: parseInt(data["Or"]) || 0,
    organicTraffic: parseInt(data["Ot"]) || 0,
    organicCost: parseFloat(data["Oc"]) || 0,
  };
}

async function fetchBacklinksOverview(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/analytics/v1/?key=${apiKey}&type=backlinks_overview&target=${domain}&target_type=root_domain&export_columns=total,domains_num,urls_num,ips_num,follows_num,nofollows_num,texts_num,images_num`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  if (text.includes("ERROR")) throw new Error(`SEMrush backlinks: ${text}`);
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const data = parseCSV(lines);
  return {
    totalBacklinks: parseInt(data["total"]) || 0,
    referringDomains: parseInt(data["domains_num"]) || 0,
    followLinks: parseInt(data["follows_num"]) || 0,
    nofollowLinks: parseInt(data["nofollows_num"]) || 0,
  };
}

async function fetchTopKeywords(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/?type=domain_organic&key=${apiKey}&export_columns=Ph,Po,Nq,Tr,Kd&domain=${domain}&database=us&display_limit=10&display_sort=tr_desc`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  if (text.includes("ERROR")) return [];
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(";");
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i]?.trim(); });
    return {
      keyword: row["Ph"] || "",
      position: parseInt(row["Po"]) || 0,
      volume: parseInt(row["Nq"]) || 0,
      traffic: parseInt(row["Tr"]) || 0,
      difficulty: parseInt(row["Kd"]) || 0,
    };
  }).filter(kw => kw.keyword);
}

// NEW: Fetch top organic competitors
async function fetchCompetitors(domain, apiKey) {
  const url = `${SEMRUSH_BASE}/?type=domain_organic_organic&key=${apiKey}&export_columns=Dn,Np,Or,Ot,Oc,Ad&domain=${domain}&database=us&display_limit=5&display_sort=np_desc`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  if (text.includes("ERROR")) return [];
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(";");
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i]?.trim(); });
    return {
      domain: row["Dn"] || "",
      commonKeywords: parseInt(row["Np"]) || 0,
      organicKeywords: parseInt(row["Or"]) || 0,
      organicTraffic: parseInt(row["Ot"]) || 0,
      organicCost: parseFloat(row["Oc"]) || 0,
    };
  }).filter(c => c.domain);
}

function parseCSV(lines) {
  const headers = lines[0].split(";");
  const values = lines[1].split(";");
  const data = {};
  headers.forEach((h, i) => { data[h.trim()] = values[i]?.trim(); });
  return data;
}
