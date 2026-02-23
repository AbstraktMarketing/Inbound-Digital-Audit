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
    // Raw API test — show exactly what Google returns
    const rawUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(company)}&key=${apiKey}`;
    const rawRes = await fetch(rawUrl, { signal: AbortSignal.timeout(10000) });
    const rawData = await rawRes.json();

    // Then run through the full provider
    let providerResult = null;
    let providerError = null;
    try {
      providerResult = await fetchPlacesData(company, url);
    } catch (e) {
      providerError = e.message;
    }

    return Response.json({
      company,
      url,
      apiKeySet: true,
      apiKeyPrefix: apiKey.substring(0, 12) + "...",
      rawAPI: {
        status: rawData.status,
        errorMessage: rawData.error_message || null,
        resultCount: rawData.results?.length || 0,
        firstResult: rawData.results?.[0] ? {
          name: rawData.results[0].name,
          address: rawData.results[0].formatted_address,
          rating: rawData.results[0].rating,
          placeId: rawData.results[0].place_id,
        } : null,
      },
      provider: providerError ? { error: providerError } : providerResult,
    });
  } catch (e) {
    return Response.json({ error: e.message, company, url, apiKeySet: true }, { status: 500 });
  }
}
