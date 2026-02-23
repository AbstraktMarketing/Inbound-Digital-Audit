// Diagnostic endpoint — test Google Places API
// GET /api/debug/places?company=Abstrakt+Marketing+Group&url=abstraktmg.com

import { fetchPlacesData } from "../../providers/places.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company") || "Abstrakt Marketing Group";
  const url = searchParams.get("url") || "abstraktmg.com";

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GOOGLE_API_KEY not set in environment", hint: "Check Vercel Environment Variables" }, { status: 500 });
  }

  try {
    console.log(`[Places Debug] Testing: company="${company}", url="${url}"`);
    const result = await fetchPlacesData(company, url);
    return Response.json({
      company, url, apiKeySet: true,
      apiKeyPrefix: apiKey.substring(0, 12) + "...",
      result,
    });
  } catch (e) {
    return Response.json({ error: e.message, company, url, apiKeySet: true }, { status: 500 });
  }
}
