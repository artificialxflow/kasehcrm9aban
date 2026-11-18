import type { Prisma, PurchaseInvoice, PurchaseLine } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findYieldRuleForRawLine } from "@/lib/services/purchase-yield";

type Tx = Prisma.TransactionClient;

export function expectedSellableGrams(rawGrams: number, yieldBps: number): number {
  return Math.floor((rawGrams * yieldBps) / 10_000);
}

export async function createBatchForPurchaseLine(
  tx: Tx,
  line: PurchaseLine,
  invoice: Pick<PurchaseInvoice, "branchId" | "purchasedAt">,
) {
  const rule = await findYieldRuleForRawLine(tx, invoice.branchId, line.catalogItemId);
  if (!rule) return null;

  const expected = expectedSellableGrams(line.weightGrams, rule.yieldBps);
  const batch = await tx.purchaseBatch.create({
    data: {
      branchId: invoice.branchId,
      purchaseLineId: line.id,
      rawCatalogItemId: line.catalogItemId,
      saleCatalogItemId: rule.saleCatalogItemId,
      purchasedAt: invoice.purchasedAt,
      rawGrams: line.weightGrams,
      expectedSellableGrams: expected,
    },
  });

  console.info("[purchase-batch] created", {
    batchId: batch.id,
    branchId: invoice.branchId,
    purchaseLineId: line.id,
    rawGrams: line.weightGrams,
    expectedSellableGrams: expected,
    yieldBps: rule.yieldBps,
  });

  return batch;
}

export type BatchListFilters = {
  from?: Date;
  to?: Date;
};

export async function listPurchaseBatches(branchId: string, filters: BatchListFilters = {}) {
  const where: Prisma.PurchaseBatchWhereInput = { branchId };
  if (filters.from || filters.to) {
    where.purchasedAt = {};
    if (filters.from) where.purchasedAt.gte = filters.from;
    if (filters.to) where.purchasedAt.lte = filters.to;
  }

  return prisma.purchaseBatch.findMany({
    where,
    orderBy: { purchasedAt: "asc" },
    include: {
      rawCatalogItem: { select: { name: true, pluCode: true } },
      saleCatalogItem: { select: { name: true, pluCode: true } },
      purchaseLine: {
        select: {
          purchaseInvoice: { select: { invoiceNo: true, supplierName: true } },
        },
      },
    },
  });
}

export async function getPurchaseBatchSummary(branchId: string, filters: BatchListFilters = {}) {
  const batches = await listPurchaseBatches(branchId, filters);
  const rawGrams = batches.reduce((s, b) => s + b.rawGrams, 0);
  const expectedSellableGrams = batches.reduce((s, b) => s + b.expectedSellableGrams, 0);
  const allocatedSoldGrams = batches.reduce((s, b) => s + b.allocatedSoldGrams, 0);
  const remainingExpectedGrams = Math.max(0, expectedSellableGrams - allocatedSoldGrams);

  return {
    batchCount: batches.length,
    rawGrams,
    expectedSellableGrams,
    allocatedSoldGrams,
    remainingExpectedGrams,
    variancePercent:
      expectedSellableGrams > 0
        ? Math.round((allocatedSoldGrams / expectedSellableGrams) * 1000) / 10
        : null,
  };
}

export async function updatePurchaseBatchExpectedGrams(
  branchId: string,
  batchId: string,
  expectedSellableGrams: number,
) {
  if (!Number.isFinite(expectedSellableGrams) || expectedSellableGrams < 1) {
    throw new Error("INVALID_GRAMS");
  }

  const batch = await prisma.purchaseBatch.findFirst({
    where: { id: batchId, branchId },
    select: { id: true, allocatedSoldGrams: true, rawGrams: true },
  });
  if (!batch) throw new Error("NOT_FOUND");
  if (expectedSellableGrams < batch.allocatedSoldGrams) {
    throw new Error("BELOW_ALLOCATED");
  }

  return prisma.purchaseBatch.update({
    where: { id: batchId },
    data: { expectedSellableGrams },
    select: {
      id: true,
      expectedSellableGrams: true,
      allocatedSoldGrams: true,
      rawGrams: true,
    },
  });
}