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
    throw new Error("INSUFFICIENT_STOCK");
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
