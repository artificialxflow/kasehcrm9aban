import { resolveBranchId } from "@/lib/branch-resolve";
import { jsonResponse } from "@/lib/api-json";
import { getScaleAgentStatus, listScaleAgentHeartbeats } from "@/lib/services/scale-agent";
import { requirePanelAuth } from "@/lib/panel-auth";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return jsonResponse({ ok: false, error: "not_found" }, { status: 404 });

  const url = new URL(req.url);
  const hostname = url.searchParams.get("hostname")?.trim() || undefined;
  const listAll = url.searchParams.get("all") === "1";

  if (listAll) {
    const heartbeats = await listScaleAgentHeartbeats(branch.id);
    return jsonResponse({ ok: true, branch, heartbeats });
  }

  const heartbeat = await getScaleAgentStatus(branch.id, hostname);
  return jsonResponse({ ok: true, branch, heartbeat });
}
