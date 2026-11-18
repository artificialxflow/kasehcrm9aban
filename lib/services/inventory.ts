import type { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

export async function applyStockMovement(
  tx: Tx,
  input: {
    branchId: string;
    catalogItemId: string;
    type: StockMovementType;
    quantityGrams: number;
    referenceKind: string;
    referenceId: string;
    note?: string;
  },
) {
  const delta =
    input.type === "PURCHASE_IN" || input.type === "ADJUSTMENT"
      ? input.quantityGrams
      : -input.quantityGrams;

  await tx.stockMovement.create({
    data: {
      branchId: input.branchId,
      catalogItemId: input.catalogItemId,
      type: input.type,
      quantityGrams: input.quantityGrams,
      referenceKind: input.referenceKind,
      referenceId: input.referenceId,
      note: input.note,
    },
  });

  const stock = await tx.branchStock.findUnique({
    where: {
      branchId_catalogItemId: {
        branchId: input.branchId,
        catalogItemId: input.catalogItemId,
      },
    },
  });

  const nextQty = (stock?.quantityGrams ?? 0) + delta;
  if (nextQty < 0) {
    const branch = await tx.branch.findUnique({
      where: { id: input.branchId },
      select: { isPilot: true, legacyId: true },
    });
    const allowPilotNegativeSale =
      input.type === "SALE_OUT" && branch?.isPilot === true;
    if (!allowPilotNegativeSale) {
      console.error("[inventory] insufficient stock", {
        branchId: input.branchId,
        branchLegacyId: branch?.legacyId,
        catalogItemId: input.catalogItemId,
        type: input.type,
        nextQty,
        delta,
      });
      throw new Error("INSUFFICIENT_STOCK");
    }
    console.warn("[inventory] pilot SALE_OUT below zero (allowed)", {
      branchId: input.branchId,
      branchLegacyId: branch?.legacyId,
      catalogItemId: input.catalogItemId,
      nextQty,
      delta,
    });
  }

  await tx.branchStock.upsert({
    where: {
      branchId_catalogItemId: {
        branchId: input.branchId,
        catalogItemId: input.catalogItemId,
      },
    },
    create: {
      branchId: input.branchId,
      catalogItemId: input.catalogItemId,
      quantityGrams: nextQty,
    },
    update: { quantityGrams: nextQty },
  });
}

export async function getBranchStock(branchId: string) {
  return prisma.branchStock.findMany({
    where: { branchId },
    include: { catalogItem: true },
    orderBy: { catalogItem: { name: "asc" } },
  });
}
