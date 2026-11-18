import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { getPilotSetupStatus } from "@/lib/services/pilot-setup";
import { requirePanelAuth } from "@/lib/panel-auth";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const setup = await getPilotSetupStatus(branch.id);
  return jsonResponse({ branch, setup });
}