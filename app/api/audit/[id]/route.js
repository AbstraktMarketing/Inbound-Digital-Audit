import { kv } from "@vercel/kv";

export async function GET(request, { params }) {
  const { id } = params;

  if (!id || id.length !== 10) {
    return Response.json({ error: "Invalid audit ID" }, { status: 400 });
  }

  const raw = await kv.get(`audit:${id}`);
  if (!raw) {
    return Response.json({ error: "Audit not found" }, { status: 404 });
  }

  const audit = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Response.json(audit);
}

export async function PATCH(request, { params }) {
  const { id } = params;

  if (!id || id.length !== 10) {
    return Response.json({ error: "Invalid audit ID" }, { status: 400 });
  }

  const raw = await kv.get(`audit:${id}`);
  if (!raw) {
    return Response.json({ error: "Audit not found" }, { status: 404 });
  }

  const audit = typeof raw === "string" ? JSON.parse(raw) : raw;
  const body = await request.json();

  // Merge recap data
  if (body.recap) {
    const validTabs = ["website", "seo", "content", "social", "local"];
    const sanitized = {};
    for (const tab of validTabs) {
      if (body.recap[tab]) {
        sanitized[tab] = {
          summary: typeof body.recap[tab].summary === "string" ? body.recap[tab].summary.slice(0, 1000) : undefined,
          risks: Array.isArray(body.recap[tab].risks) ? body.recap[tab].risks.slice(0, 5).map(r => String(r).slice(0, 300)) : undefined,
          opportunity: typeof body.recap[tab].opportunity === "string" ? body.recap[tab].opportunity.slice(0, 1000) : undefined,
        };
      }
    }
    audit.recap = { ...(audit.recap || {}), ...sanitized };
  }

  await kv.set(`audit:${id}`, JSON.stringify(audit));
  return Response.json({ ok: true, recap: audit.recap });
}
