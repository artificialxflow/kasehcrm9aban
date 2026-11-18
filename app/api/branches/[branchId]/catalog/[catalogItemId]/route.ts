import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { deleteCatalogItem, updateCatalogItem } from "@/lib/services/catalog";
import { CatalogItemType } from "@prisma/client";
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
    type?: CatalogItemType;
    pluCode?: string | null;
    barcode?: string | null;
    unitPriceRialPerKg?: string | null;
    unitPriceTomanPerKg?: string | null;
    isActive?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  let unitPrice: bigint | null | undefined = undefined;
  if (
    body.unitPriceTomanPerKg !== undefined &&
    body.unitPriceTomanPerKg !== null &&
    body.unitPriceTomanPerKg !== ""
  ) {
    const t = parseFloat(body.unitPriceTomanPerKg);
    if (!Number.isFinite(t) || t <= 0) return errorResponse("INVALID_TOMAN", 400);
    unitPrice = BigInt(Math.round(t * 10));
  } else if (body.unitPriceRialPerKg !== undefined) {
    unitPrice =
      body.unitPriceRialPerKg === null || body.unitPriceRialPerKg === ""
        ? null
        : BigInt(body.unitPriceRialPerKg);
  }

  if (body.type && !Object.values(CatalogItemType).includes(body.type)) {
    return errorResponse("INVALID_TYPE", 400);
  }

  try {
    const item = await updateCatalogItem(branch.id, catalogItemId, {
      name: body.name,
      type: body.type,
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

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key, catalogItemId } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  try {
    const result = await deleteCatalogItem(branch.id, catalogItemId);
    return jsonResponse(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    return errorResponse(msg, msg === "NOT_FOUND" ? 404 : 400);
  }
}
