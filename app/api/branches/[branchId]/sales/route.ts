import { SaleSource } from "@prisma/client";
import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { createSaleInvoice, listSaleInvoices } from "@/lib/services/sales";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const sales = await listSaleInvoices(branch.id);
  return jsonResponse({ branch, sales });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const body = (await req.json()) as {
    source?: SaleSource;
    scaleInvoiceNo?: string;
    scaleLabel?: string;
    boothLabel?: string;
    reprint?: boolean;
    rawBarcode?: string;
    lines: { catalogItemId: string; weightGrams: number; unitPriceRialPerKg: string }[];
  };

  if (!body.lines?.length) return errorResponse("NO_LINES");

  try {
    const sale = await createSaleInvoice(branch.id, {
      source: body.source ?? SaleSource.SCALE_RECEIPT,
      scaleInvoiceNo: body.scaleInvoiceNo,
      scaleLabel: body.scaleLabel,
      boothLabel: body.boothLabel,
      reprint: body.reprint,
      lines: body.lines.map((l) => ({
        catalogItemId: l.catalogItemId,
        weightGrams: l.weightGrams,
        unitPriceRialPerKg: BigInt(l.unitPriceRialPerKg),
      })),
      scaleTicket: body.rawBarcode ? { rawBarcode: body.rawBarcode } : undefined,
    });
    return jsonResponse({ sale }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "FAILED";
    const status = msg === "INSUFFICIENT_STOCK" ? 409 : 400;
    return errorResponse(msg, status);
  }
}
