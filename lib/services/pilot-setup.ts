import { CatalogItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PILOT_FILLET_YIELD } from "@/lib/services/purchase-yield";

export async function getPilotSetupStatus(branchId: string) {
  const [raw, sale, rule, batchCount, batches, stockRows] = await Promise.all([
    prisma.catalogItem.findFirst({
      where: {
        branchId,
        pluCode: PILOT_FILLET_YIELD.rawPlu,
        isActive: true,
        type: CatalogItemType.RAW,
      },
      select: { id: true, name: true, pluCode: true },
    }),
    prisma.catalogItem.findFirst({
      where: {
        branchId,
        pluCode: PILOT_FILLET_YIELD.salePlu,
        isActive: true,
        type: CatalogItemType.WEIGHED_SALE,
      },
      select: { id: true, name: true, pluCode: true, unitPriceRialPerKg: true },
    }),
    prisma.purchaseYieldRule.findFirst({
      where: { branchId, rawCatalogItem: { pluCode: PILOT_FILLET_YIELD.rawPlu } },
      select: { yieldBps: true, rawCatalogItemId: true, saleCatalogItemId: true },
    }),
    prisma.purchaseBatch.count({ where: { branchId } }),
    prisma.purchaseBatch.findMany({
      where: { branchId },
      orderBy: { purchasedAt: "desc" },
      take: 3,
      select: {
        id: true,
        purchasedAt: true,
        rawGrams: true,
        expectedSellableGrams: true,
        allocatedSoldGrams: true,
      },
    }),
    prisma.branchStock.findMany({
      where: { branchId },
      include: { catalogItem: { select: { name: true, pluCode: true, type: true } } },
    }),
  ]);

  const totals = batches.reduce(
    (acc, b) => {
      acc.rawGrams += b.rawGrams;
      acc.expectedSellableGrams += b.expectedSellableGrams;
      acc.allocatedSoldGrams += b.allocatedSoldGrams;
      return acc;
    },
    { rawGrams: 0, expectedSellableGrams: 0, allocatedSoldGrams: 0 },
  );

  return {
    yieldBpsDefault: PILOT_FILLET_YIELD.yieldBps,
    rawFillet: raw,
    saleFillet: sale,
    yieldRule: rule,
    readyForBatchTest: Boolean(raw && sale),
    readyForPurchaseBatch: Boolean(raw && sale && (rule || (raw && sale))),
    batchCount,
    recentBatches: batches.map((b) => ({
      ...b,
      purchasedAt: b.purchasedAt.toISOString(),
      remainingExpectedGrams: Math.max(0, b.expectedSellableGrams - b.allocatedSoldGrams),
    })),
    batchTotals: totals,
    stock: stockRows.map((s) => ({
      pluCode: s.catalogItem.pluCode,
      name: s.catalogItem.name,
      type: s.catalogItem.type,
      quantityGrams: s.quantityGrams,
    })),
  };
}