import { prisma } from "@/lib/prisma";
import {
  getPurchaseBatchSummary,
  listPurchaseBatches,
  type BatchListFilters,
} from "@/lib/services/purchase-batch";

export async function getDailyPilotReport(branchId: string, day = new Date()) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  const [purchases, sales, stock] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      where: { branchId, purchasedAt: { gte: start, lte: end } },
      select: { totalRial: true },
    }),
    prisma.saleInvoice.findMany({
      where: { branchId, soldAt: { gte: start, lte: end } },
      select: { totalRial: true },
    }),
    prisma.branchStock.findMany({
      where: { branchId },
      include: { catalogItem: true },
    }),
  ]);

  const purchaseTotalRial = purchases.reduce((s, p) => s + p.totalRial, BigInt(0));
  const saleTotalRial = sales.reduce((s, p) => s + p.totalRial, BigInt(0));

  const rawInGrams = await prisma.stockMovement.aggregate({
    where: {
      branchId,
      type: "PURCHASE_IN",
      createdAt: { gte: start, lte: end },
      catalogItem: { type: "RAW" },
    },
    _sum: { quantityGrams: true },
  });

  const saleOutGrams = await prisma.stockMovement.aggregate({
    where: {
      branchId,
      type: "SALE_OUT",
      createdAt: { gte: start, lte: end },
    },
    _sum: { quantityGrams: true },
  });

  return {
    date: start.toISOString(),
    purchaseCount: purchases.length,
    saleCount: sales.length,
    purchaseTotalRial,
    saleTotalRial,
    rawPurchaseInGrams: rawInGrams._sum.quantityGrams ?? 0,
    saleOutGrams: saleOutGrams._sum.quantityGrams ?? 0,
    stock,
  };
}

export async function getPurchaseBatchReport(branchId: string, filters: BatchListFilters = {}) {
  const batches = await listPurchaseBatches(branchId, filters);
  const summary = await getPurchaseBatchSummary(branchId, filters);

  const rows = batches.map((b) => {
    const remainingExpected = Math.max(0, b.expectedSellableGrams - b.allocatedSoldGrams);
    const variancePercent =
      b.expectedSellableGrams > 0
        ? Math.round((b.allocatedSoldGrams / b.expectedSellableGrams) * 1000) / 10
        : null;
    return {
      id: b.id,
      purchasedAt: b.purchasedAt.toISOString(),
      invoiceNo: b.purchaseLine.purchaseInvoice.invoiceNo,
      supplierName: b.purchaseLine.purchaseInvoice.supplierName,
      rawName: b.rawCatalogItem.name,
      rawPluCode: b.rawCatalogItem.pluCode,
      saleName: b.saleCatalogItem.name,
      salePluCode: b.saleCatalogItem.pluCode,
      rawGrams: b.rawGrams,
      expectedSellableGrams: b.expectedSellableGrams,
      allocatedSoldGrams: b.allocatedSoldGrams,
      remainingExpectedGrams: remainingExpected,
      variancePercent,
    };
  });

  return { summary, rows };
}
