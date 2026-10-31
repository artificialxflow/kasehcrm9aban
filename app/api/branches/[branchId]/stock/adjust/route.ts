import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { applyStockMovement } from "@/lib/services/inventory";
import { prisma } from "@/lib/prisma";
import { kgToGrams } from "@/lib/money";

type RouteCtx = { params: Promise<{ branchId: string }> };

/** Set absolute stock quantity (inventory count correction). */
export async function POST(req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  let body: { catalogItemId?: string; quantityKg?: number; note?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  if (!body.catalogItemId) return errorResponse("CATALOG_ITEM_REQUIRED", 400);
  if (body.quantityKg == null || Number.isNaN(body.quantityKg) || body.quantityKg < 0) {
    return errorResponse("INVALID_QUANTITY", 400);
  }

  const targetGrams = kgToGrams(body.quantityKg);

  try {
    await prisma.$transaction(async (tx) => {
      const stock = await tx.branchStock.findUnique({
        where: {
          branchId_catalogItemId: {
            branchId: branch.id,
            catalogItemId: body.catalogItemId!,
          },
        },
      });

      const current = stock?.quantityGrams ?? 0;
      const delta = targetGrams - current;
      if (delta === 0) return;

      await applyStockMovement(tx, {
        branchId: branch.id,
        catalogItemId: body.catalogItemId!,
        type: "ADJUSTMENT",
        quantityGrams: delta,
        referenceKind: "stock_adjust",
        referenceId: crypto.randomUUID(),
        note: body.note,
      });
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    return errorResponse(msg, msg === "INSUFFICIENT_STOCK" ? 400 : 500);
  }
}
