import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { updateCatalogItem } from "@/lib/services/catalog";
import { requirePanelAuth } from "@/lib/panel-auth";

type RouteCtx = { params: Promise<{ branchId: string; catalogItemId: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key, catalogItemId } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  let body: {
    name?: string;
    pluCode?: string | null;
    barcode?: string | null;
    unitPriceRialPerKg?: string | null;
    isActive?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  const unitPrice =
    body.unitPriceRialPerKg === undefined
      ? undefined
      : body.unitPriceRialPerKg === null || body.unitPriceRialPerKg === ""
        ? null
        : BigInt(body.unitPriceRialPerKg);

  try {
    const item = await updateCatalogItem(branch.id, catalogItemId, {
      name: body.name,
      pluCode: body.pluCode,
      barcode: body.barcode,
      unitPriceRialPerKg: unitPrice,
      isActive: body.isActive,
    });
    return jsonResponse({ item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    const status = msg === "NOT_FOUND" ? 404 : msg === "PLU_DUPLICATE" ? 409 : 500;
    return errorResponse(msg, status);
  }
}
