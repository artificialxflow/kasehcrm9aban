import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { createPurchaseInvoice, listPurchaseInvoices } from "@/lib/services/purchases";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const purchases = await listPurchaseInvoices(branch.id);
  return jsonResponse({ branch, purchases });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const body = (await req.json()) as {
    invoiceNo?: string;
    supplierName?: string;
    lines: { catalogItemId: string; weightGrams: number; unitPriceRialPerKg: string }[];
  };

  if (!body.lines?.length) return errorResponse("NO_LINES");

  try {
    const purchase = await createPurchaseInvoice(branch.id, {
      invoiceNo: body.invoiceNo,
      supplierName: body.supplierName,
      lines: body.lines.map((l) => ({
        catalogItemId: l.catalogItemId,
        weightGrams: l.weightGrams,
        unitPriceRialPerKg: BigInt(l.unitPriceRialPerKg),
      })),
    });
    return jsonResponse({ purchase }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "FAILED";
    return errorResponse(msg, 400);
  }
}
