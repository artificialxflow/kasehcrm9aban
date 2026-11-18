import type { Prisma } from "@prisma/client";
import { CatalogItemType } from "@prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * تخصیص وزن فروش به بچ‌های خرید (FIFO بر اساس purchasedAt).
 */
export async function allocateSaleLineToBatches(
  tx: Tx,
  input: {
    branchId: string;
    saleLineId: string;
    catalogItemId: string;
    grams: number;
  },
) {
  const item = await tx.catalogItem.findUnique({
    where: { id: input.catalogItemId },
    select: { type: true },
  });
  if (item?.type !== CatalogItemType.WEIGHED_SALE) return;

  const rules = await tx.purchaseYieldRule.findMany({
    where: { branchId: input.branchId, saleCatalogItemId: input.catalogItemId },
    take: 1,
  });
  if (!rules.length) return;

  let remaining = input.grams;
  const openBatches = await tx.purchaseBatch.findMany({
    where: { branchId: input.branchId, saleCatalogItemId: input.catalogItemId },
    orderBy: { purchasedAt: "asc" },
  });

  const allocations: { purchaseBatchId: string; grams: number }[] = [];

  for (const batch of openBatches) {
    if (remaining <= 0) break;
    const capacity = batch.expectedSellableGrams - batch.allocatedSoldGrams;
    if (capacity <= 0) continue;

    const take = Math.min(remaining, capacity);
    await tx.saleLineBatchAllocation.create({
      data: {
        saleLineId: input.saleLineId,
        purchaseBatchId: batch.id,
        gramsAllocated: take,
      },
    });
    await tx.purchaseBatch.update({
      where: { id: batch.id },
      data: { allocatedSoldGrams: batch.allocatedSoldGrams + take },
    });
    allocations.push({ purchaseBatchId: batch.id, grams: take });
    remaining -= take;
  }

  if (allocations.length) {
    console.info("[batch-fifo] allocated", {
      saleLineId: input.saleLineId,
      requestedGrams: input.grams,
      allocations,
      unallocatedGrams: remaining,
    });
  }

  if (remaining > 0) {
    console.warn("[batch-fifo] partial_no_batch", {
      saleLineId: input.saleLineId,
      catalogItemId: input.catalogItemId,
      unallocatedGrams: remaining,
    });
  }
}