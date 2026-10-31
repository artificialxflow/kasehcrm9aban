import { CatalogItemType, SaleSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { lineTotalRial } from "@/lib/money";
import { applyStockMovement } from "@/lib/services/inventory";

export type SaleLineInput = {
  catalogItemId: string;
  weightGrams: number;
  unitPriceRialPerKg: bigint;
};

export async function createSaleInvoice(
  branchId: string,
  input: {
    source?: SaleSource;
    scaleInvoiceNo?: string;
    scaleLabel?: string;
    boothLabel?: string;
    reprint?: boolean;
    soldAt?: Date;
    lines: SaleLineInput[];
    scaleTicket?: {
      rawBarcode?: string;
      payload?: object;
    };
  },
) {
  if (!input.lines.length) throw new Error("NO_LINES");

  return prisma.$transaction(async (tx) => {
    let totalRial = BigInt(0);
    const lineData = input.lines.map((line) => {
      const lineTotal = lineTotalRial(line.weightGrams, line.unitPriceRialPerKg);
      totalRial += lineTotal;
      return { ...line, lineTotalRial: lineTotal };
    });

    const invoice = await tx.saleInvoice.create({
      data: {
        branchId,
        source: input.source ?? SaleSource.SCALE_RECEIPT,
        scaleInvoiceNo: input.scaleInvoiceNo,
        scaleLabel: input.scaleLabel,
        boothLabel: input.boothLabel,
        reprint: input.reprint ?? false,
        soldAt: input.soldAt ?? new Date(),
        totalRial,
        lines: {
          create: lineData.map((l) => ({
            catalogItemId: l.catalogItemId,
            weightGrams: l.weightGrams,
            unitPriceRialPerKg: l.unitPriceRialPerKg,
            lineTotalRial: l.lineTotalRial,
          })),
        },
      },
      include: { lines: true },
    });

    for (const line of invoice.lines) {
      const item = await tx.catalogItem.findUniqueOrThrow({ where: { id: line.catalogItemId } });
      if (item.type !== CatalogItemType.WEIGHED_SALE && item.type !== CatalogItemType.RAW) {
        throw new Error("INVALID_SALE_ITEM_TYPE");
      }
      await applyStockMovement(tx, {
        branchId,
        catalogItemId: line.catalogItemId,
        type: "SALE_OUT",
        quantityGrams: line.weightGrams,
        referenceKind: "sale_line",
        referenceId: line.id,
      });
    }

    if (input.scaleTicket) {
      const first = invoice.lines[0];
      await tx.scaleTicket.create({
        data: {
          branchId,
          saleInvoiceId: invoice.id,
          rawBarcode: input.scaleTicket.rawBarcode,
          parsedWeightGrams: first?.weightGrams,
          parsedUnitPriceRial: first?.unitPriceRialPerKg,
          payload: input.scaleTicket.payload ?? undefined,
        },
      });
    }

    return invoice;
  });
}

export async function listSaleInvoices(branchId: string, limit = 20) {
  return prisma.saleInvoice.findMany({
    where: { branchId },
    include: { lines: { include: { catalogItem: true } } },
    orderBy: { soldAt: "desc" },
    take: limit,
  });
}
