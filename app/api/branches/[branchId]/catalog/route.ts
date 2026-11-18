import { CatalogItemType } from "@prisma/client";
import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { createCatalogItem, listCatalogItems } from "@/lib/services/catalog";
import { requirePanelAuth } from "@/lib/panel-auth";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const url = new URL(req.url);
  const includeInactive = url.searchParams.get("all") === "1";

  const items = await listCatalogItems(branch.id, includeInactive);
  return jsonResponse({ branch, items });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  let body: {
    name?: string;
    type?: CatalogItemType;
    pluCode?: string;
    barcode?: string;
    unitPriceRialPerKg?: string;
    unitPriceTomanPerKg?: string;
  };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  if (!body.name?.trim()) return errorResponse("NAME_REQUIRED", 400);
  if (!body.type || !Object.values(CatalogItemType).includes(body.type)) {
    return errorResponse("INVALID_TYPE", 400);
  }

  let unitPrice: bigint | null = null;
  if (body.unitPriceTomanPerKg != null && body.unitPriceTomanPerKg !== "") {
    const t = parseFloat(body.unitPriceTomanPerKg);
    if (!Number.isFinite(t) || t <= 0) return errorResponse("INVALID_TOMAN", 400);
    unitPrice = BigInt(Math.round(t * 10));
  } else if (body.unitPriceRialPerKg != null && body.unitPriceRialPerKg !== "") {
    unitPrice = BigInt(body.unitPriceRialPerKg);
  }

  try {
    const item = await createCatalogItem(branch.id, {
      name: body.name,
      type: body.type,
      pluCode: body.pluCode,
      barcode: body.barcode,
      unitPriceRialPerKg: unitPrice,
    });
    return jsonResponse({ item }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    const status =
      msg === "PLU_DUPLICATE" ? 409 : msg === "PLU_REQUIRED" || msg === "UNIT_PRICE_REQUIRED" ? 400 : 500;
    return errorResponse(msg, status);
  }
}
