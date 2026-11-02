import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { getDailyPilotReport } from "@/lib/services/reports";
import { requirePanelAuth } from "@/lib/panel-auth";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const day = dateParam ? new Date(dateParam) : new Date();

  const report = await getDailyPilotReport(branch.id, day);
  return jsonResponse({ branch, report });
}
