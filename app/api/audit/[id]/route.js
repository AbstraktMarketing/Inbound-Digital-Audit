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
