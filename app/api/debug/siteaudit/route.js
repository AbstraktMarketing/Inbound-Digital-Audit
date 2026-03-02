// Debug endpoint to see raw SEMrush Site Audit API response
// GET /api/debug/siteaudit?projectId=YOUR_PROJECT_ID
// Protected by DEBUG_API_SECRET bearer token

export async function GET(request) {
  const secret = process.env.DEBUG_API_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const apiKey = process.env.SEMRUSH_API_KEY;

  if (!projectId) return Response.json({ error: "projectId required" });
  if (!apiKey) return Response.json({ error: "SEMRUSH_API_KEY not set" });

  try {
    // Step 1: Get snapshots
    const snapUrl = `https://api.semrush.com/reports/v1/projects/${projectId}/siteaudit/snapshots?key=${apiKey}`;
    const snapRes = await fetch(snapUrl);
    const snapData = await snapRes.json();
    const snapshots = snapData.snapshots || [];
    
    if (snapshots.length === 0) {
      return Response.json({ error: "No snapshots found", snapData });
    }

    const latest = snapshots.sort((a, b) => (b.finish_date || 0) - (a.finish_date || 0))[0];

    // Step 2: Get snapshot detail
    const detailUrl = `https://api.semrush.com/reports/v1/projects/${projectId}/siteaudit/snapshot?key=${apiKey}&snapshot_id=${latest.snapshot_id}`;
    const detailRes = await fetch(detailUrl);
    const detail = await detailRes.json();

    // Step 3: Also get the /info endpoint for comparison
    const infoUrl = `https://api.semrush.com/reports/v1/projects/${projectId}/siteaudit/info?key=${apiKey}`;
    const infoRes = await fetch(infoUrl);
    const info = await infoRes.json();

    return Response.json({
      latestSnapshot: latest,
      snapshotDetail: {
        quality: detail.quality,
        errorCount: (detail.errors || []).reduce((s, e) => s + (e.count || 0), 0),
        warningCount: (detail.warnings || []).reduce((s, w) => s + (w.count || 0), 0),
        noticeCount: (detail.notices || []).reduce((s, n) => s + (n.count || 0), 0),
        pagesCrawled: detail.pages_crawled,
        rawKeys: Object.keys(detail),
      },
      infoEndpoint: info,
      totalSnapshots: snapshots.length,
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
}
