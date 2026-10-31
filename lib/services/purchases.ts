import { CatalogItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { lineTotalRial } from "@/lib/money";
import { applyStockMovement } from "@/lib/services/inventory";

export type PurchaseLineInput = {
  catalogItemId: string;
  weightGrams: number;
  unitPriceRialPerKg: bigint;
};

export async function createPurchaseInvoice(
  branchId: string,
  input: {
    invoiceNo?: string;
    supplierName?: string;
    purchasedAt?: Date;
    lines: PurchaseLineInput[];
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

    const invoice = await tx.purchaseInvoice.create({
      data: {
        branchId,
        invoiceNo: input.invoiceNo,
        supplierName: input.supplierName,
        purchasedAt: input.purchasedAt ?? new Date(),
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
      if (item.type !== CatalogItemType.RAW) {
        throw new Error("PURCHASE_MUST_BE_RAW");
      }
      await applyStockMovement(tx, {
        branchId,
        catalogItemId: line.catalogItemId,
        type: "PURCHASE_IN",
        quantityGrams: line.weightGrams,
        referenceKind: "purchase_line",
        referenceId: line.id,
      });
    }

    return invoice;
  });
}

export async function listPurchaseInvoices(branchId: string, limit = 20) {
  return prisma.purchaseInvoice.findMany({
    where: { branchId },
    include: { lines: { include: { catalogItem: true } } },
    orderBy: { purchasedAt: "desc" },
    take: limit,
  });
}
