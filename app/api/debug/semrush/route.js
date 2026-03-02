// Diagnostic endpoint — test SEMrush API connectivity
// GET /api/debug/semrush?domain=abstraktmg.com
// Protected by DEBUG_API_SECRET bearer token

import { fetchSemrush } from "../../providers/semrush.js";

export async function GET(request) {
  const secret = process.env.DEBUG_API_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || "abstraktmg.com";

  // Check API key existence
  const apiKey = process.env.SEMRUSH_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "SEMRUSH_API_KEY not set in environment", hint: "Check Vercel Environment Variables" }, { status: 500 });
  }

  // Quick direct test of domain_ranks endpoint
  const testUrl = `https://api.semrush.com/?type=domain_ranks&key=${apiKey}&export_columns=Dn,Rk,Or,Ot,Oc&domain=${domain}&database=us`;
  
  try {
    console.log(`[SEMrush Debug] Testing domain: ${domain}`);
    const directRes = await fetch(testUrl, { signal: AbortSignal.timeout(15000) });
    const directText = await directRes.text();
    console.log(`[SEMrush Debug] Direct response status: ${directRes.status}`);
    console.log(`[SEMrush Debug] Direct response body: ${directText.substring(0, 500)}`);

    // Also run through the full provider
    let providerResult = null;
    let providerError = null;
    try {
      providerResult = await fetchSemrush(domain);
    } catch (e) {
      providerError = e.message;
    }

    return Response.json({
      domain,
      apiKeySet: true,
      apiKeySet: true,
      directAPI: {
        status: directRes.status,
        body: directText.substring(0, 1000),
        hasError: directText.includes("ERROR"),
        lineCount: directText.trim().split("\n").length,
      },
      provider: providerError ? { error: providerError } : {
        domainAuthority: providerResult?.domainAuthority,
        backlinks: providerResult?.backlinks,
        topKeywordsCount: providerResult?.topKeywords?.length || 0,
        competitorsCount: providerResult?.competitors?.length || 0,
      },
    });
  } catch (e) {
    return Response.json({ 
      error: e.message, 
      domain, 
      apiKeySet: !!apiKey,
      hint: "SEMrush API request failed — check network or API key validity"
    }, { status: 500 });
  }
}
