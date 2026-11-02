import { resolveBranchId } from "@/lib/branch-resolve";
import { jsonResponse } from "@/lib/api-json";
import { verifyScaleApiKey } from "@/lib/scale-api-auth";
import { scaleError } from "@/lib/scale-api-response";
import { storeScaleAgentLogs } from "@/lib/services/scale-agent";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  if (!verifyScaleApiKey(req)) return scaleError("unauthorized", 401);

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return scaleError("not_found", 404);

  let body: { lines?: unknown[] };
  try {
    body = (await req.json()) as { lines?: unknown[] };
  } catch {
    return scaleError("validation", 422, { body: "invalid_json" });
  }

  if (!body.lines?.length) {
    return scaleError("validation", 422, { lines: "required_non_empty_array" });
  }

  if (body.lines.length > 500) {
    return scaleError("validation", 422, { lines: "max_500" });
  }

  try {
    const row = await storeScaleAgentLogs(branch.id, body.lines);
    return jsonResponse({ ok: true, id: row.id, count: body.lines.length }, { status: 201 });
  } catch {
    return scaleError("process_failed", 500);
  }
}
