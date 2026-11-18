import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { getPurchaseBatchReport } from "@/lib/services/reports";
import { requirePanelAuth } from "@/lib/panel-auth";

type RouteCtx = { params: Promise<{ branchId: string }> };

function parseDayRange(url: URL): { from?: Date; to?: Date } {
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const filters: { from?: Date; to?: Date } = {};
  if (fromParam) {
    const from = new Date(fromParam);
    if (!Number.isNaN(from.getTime())) filters.from = from;
  }
  if (toParam) {
    const to = new Date(toParam);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      filters.to = to;
    }
  }
  return filters;
}

export async function GET(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const url = new URL(req.url);
  const filters = parseDayRange(url);
  const report = await getPurchaseBatchReport(branch.id, filters);

  return jsonResponse({
    branch,
    report,
    filters: {
      from: filters.from?.toISOString() ?? null,
      to: filters.to?.toISOString() ?? null,
    },
  });
}