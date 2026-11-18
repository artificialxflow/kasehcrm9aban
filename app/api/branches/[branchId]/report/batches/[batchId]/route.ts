import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { requirePanelAuth } from "@/lib/panel-auth";
import { kgToGrams } from "@/lib/money";
import { updatePurchaseBatchExpectedGrams } from "@/lib/services/purchase-batch";

type RouteCtx = { params: Promise<{ branchId: string; batchId: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key, batchId } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  let body: { expectedGrams?: number; expectedKg?: number };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  let grams: number | undefined;
  if (typeof body.expectedGrams === "number" && Number.isFinite(body.expectedGrams)) {
    grams = Math.round(body.expectedGrams);
  } else if (typeof body.expectedKg === "number" && Number.isFinite(body.expectedKg)) {
    grams = kgToGrams(body.expectedKg);
  }
  if (grams == null) return errorResponse("EXPECTED_WEIGHT_REQUIRED", 400);

  try {
    const batch = await updatePurchaseBatchExpectedGrams(branch.id, batchId, grams);
    return jsonResponse({ batch });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    const status =
      msg === "NOT_FOUND" ? 404 : msg === "BELOW_ALLOCATED" || msg === "INVALID_GRAMS" ? 400 : 500;
    return errorResponse(msg, status);
  }
}