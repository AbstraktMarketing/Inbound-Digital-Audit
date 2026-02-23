// Google Sheets API — append audit data to spreadsheet
// Uses service account JWT auth (no npm dependencies needed)

import crypto from "crypto";

const SPREADSHEET_ID = "1re1Nu4n7JfKhZEFikvcq_0k8AnhNQE9Xim9Qxip8m_I";
const SHEET_NAME = "Inbound Digital Audit";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
let sheetVerified = false;

/**
 * Append a row of audit data to the Google Sheet.
 * Requires env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY
 */
export async function appendAuditToSheet(audit) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email || !privateKey) {
    console.warn("Google Sheets integration skipped — GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY not set");
    return null;
  }

  try {
    const token = await getAccessToken(email, privateKey);
    const row = buildRow(audit);
    await appendRow(token, row);
    console.log(`Audit ${audit.id} logged to Google Sheets`);
    return true;
  } catch (err) {
    console.error("Google Sheets append failed:", err.message);
    return null;
  }
}

/**
 * Ensure the "Inbound Digital Audit" tab exists with headers.
 * Called once on first append — creates tab + header row if missing.
 */
async function ensureSheet(token) {
  if (sheetVerified) return;

  // Check if tab exists
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`;
  const metaRes = await fetch(metaUrl, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
  if (!metaRes.ok) throw new Error(`Sheets metadata failed: ${metaRes.status}`);
  const meta = await metaRes.json();
  const tabExists = meta.sheets?.some(s => s.properties?.title === SHEET_NAME);

  if (!tabExists) {
    // Create the tab
    const addUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`;
    const addRes = await fetch(addUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!addRes.ok) throw new Error(`Create tab failed: ${addRes.status}`);

    // Add header row
    const headers = getHeaders();
    await rawAppend(token, headers);
  }

  sheetVerified = true;
}

function getHeaders() {
  return [
    "Timestamp",
    "Audit ID",
    "Audit Link",
    "Company Name",
    "Website URL",
    "Contact Name",
    "Email",
    "Phone",
    "Website Performance Score",
    "Search Visibility Score",
    "Local Search Score",
    "Content Performance Score",
    "Social & AI Score",
    "Overall Score",
    "Organic Keywords",
    "Domain Authority",
    "Backlinks",
    "Page Speed (Desktop)",
    "Page Speed (Mobile)",
    "Google Reviews",
    "Pending Providers",
  ];
}

function buildRow(audit) {
  const meta = audit.meta || {};
  const webPerf = audit.webPerf || {};
  const seo = audit.seo || {};
  const entity = audit.entity || {};
  const content = audit.content || {};
  const aiSeo = audit.aiSeo || {};
  const socialLocal = audit.socialLocal || {};

  // Extract key metric values
  const findMetric = (section, label) => {
    const m = (section.metrics || []).find(m => m.label === label);
    return m?.value || "";
  };

  const webPerfScore = webPerf.score || "";
  const seoScore = seo.score || "";
  const entityScore = entity.score || "";
  const contentScore = content.score || "";
  const socialAiScore = aiSeo.score ? Math.round(((aiSeo.score || 0) + (socialLocal.socialScore || 45)) / 2) : "";
  const overallScore = [webPerfScore, seoScore, entityScore, contentScore, socialAiScore]
    .filter(s => typeof s === "number")
    .reduce((a, b, _, arr) => a + b / arr.length, 0);

  // Build the audit link
  const auditLink = audit.id ? `https://inbound-digital-audit.vercel.app/results/${audit.id}` : "";

  return [
    meta.timestamp || new Date().toISOString(),
    audit.id || "",
    auditLink,
    meta.companyName || "",
    meta.url || "",
    meta.contactName || "",
    meta.email || "",
    meta.phone || "",
    webPerfScore,
    seoScore,
    entityScore,
    contentScore,
    socialAiScore,
    overallScore ? Math.round(overallScore) : "",
    findMetric(seo, "Organic Keywords"),
    findMetric(seo, "Domain Authority Score"),
    findMetric(seo, "Backlink Profile"),
    findMetric(webPerf, "Page Speed & Performance"),
    findMetric(webPerf, "Mobile Optimization"),
    findMetric(entity, "Google Reviews"),
    (audit.pendingProviders || []).join(", "),
  ];
}

async function appendRow(token, row) {
  // Ensure tab exists on first call
  await ensureSheet(token);
  await rawAppend(token, row);
}

async function rawAppend(token, row) {
  const range = encodeURIComponent(`${SHEET_NAME}!A:U`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sheets append failed (${res.status}): ${errText}`);
  }
}

// --- JWT Auth (no npm deps) ---

async function getAccessToken(email, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: SCOPES,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const segments = [
    base64url(JSON.stringify(header)),
    base64url(JSON.stringify(payload)),
  ];

  // Decode the private key — handle escaped newlines from env vars
  const cleanKey = privateKeyPem.replace(/\\n/g, "\n");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(segments.join("."));
  const signature = sign.sign(cleanKey, "base64url");

  const jwt = `${segments.join(".")}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    signal: AbortSignal.timeout(10000),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Token exchange failed (${tokenRes.status}): ${errText}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

function base64url(str) {
  return Buffer.from(str).toString("base64url");
}
