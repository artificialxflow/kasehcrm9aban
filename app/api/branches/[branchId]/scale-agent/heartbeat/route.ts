import { resolveBranchId } from "@/lib/branch-resolve";
import { jsonResponse } from "@/lib/api-json";
import { verifyScaleApiKey } from "@/lib/scale-api-auth";
import { scaleError } from "@/lib/scale-api-response";
import { upsertScaleAgentHeartbeat, type HeartbeatBody } from "@/lib/services/scale-agent";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  if (!verifyScaleApiKey(req)) return scaleError("unauthorized", 401);

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return scaleError("not_found", 404);

  let body: HeartbeatBody;
  try {
    body = (await req.json()) as HeartbeatBody;
  } catch {
    return scaleError("validation", 422, { body: "invalid_json" });
  }

  if (!body.hostname?.trim()) {
    return scaleError("validation", 422, { hostname: "required" });
  }

  try {
    const row = await upsertScaleAgentHeartbeat(branch.id, body);
    return jsonResponse({ ok: true, id: row.id, lastSeenAt: row.lastSeenAt }, { status: 201 });
  } catch {
    return scaleError("process_failed", 500);
  }
}
