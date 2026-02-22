// Google Places API provider
// Uses Text Search to find business, then Place Details for full data

export async function fetchPlacesData(companyName, url) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY not configured");

  // Extract domain for better search
  const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

  // Search for business using Text Search (New)
  const searchQuery = `${companyName} ${domain}`;
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

  const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
  const searchData = await searchRes.json();

  if (!searchData.results || searchData.results.length === 0) {
    return { found: false, data: null };
  }

  const place = searchData.results[0];
  const placeId = place.place_id;

  // Get full details
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,business_status,rating,user_ratings_total,reviews,types,opening_hours,website,photos,url&key=${apiKey}`;

  const detailsRes = await fetch(detailsUrl, { signal: AbortSignal.timeout(10000) });
  const detailsData = await detailsRes.json();
  const result = detailsData.result || {};

  return {
    found: true,
    data: {
      name: result.name || companyName,
      address: result.formatted_address || null,
      phone: result.formatted_phone_number || null,
      businessStatus: result.business_status || "UNKNOWN",
      rating: result.rating || 0,
      reviewCount: result.user_ratings_total || 0,
      reviews: (result.reviews || []).slice(0, 5).map(r => ({
        author: r.author_name,
        rating: r.rating,
        timeAgo: r.relative_time_description,
        text: r.text?.substring(0, 200) || "",
      })),
      types: result.types || [],
      hasPhotos: (result.photos || []).length > 0,
      photoCount: (result.photos || []).length,
      website: result.website || null,
      mapsUrl: result.url || null,
      isVerified: result.business_status === "OPERATIONAL",
    },
  };
}
