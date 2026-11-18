import { CatalogItemType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureFilletYieldRule } from "@/lib/services/purchase-yield";

export async function listCatalogItems(branchId: string, includeInactive = false) {
  return prisma.catalogItem.findMany({
    where: {
      branchId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function createCatalogItem(
  branchId: string,
  input: {
    name: string;
    type: CatalogItemType;
    pluCode?: string | null;
    barcode?: string | null;
    unitPriceRialPerKg?: bigint | null;
  },
) {
  if (input.type === CatalogItemType.WEIGHED_SALE) {
    if (!input.pluCode?.trim()) throw new Error("PLU_REQUIRED");
    if (input.unitPriceRialPerKg == null || input.unitPriceRialPerKg <= 0n) {
      throw new Error("UNIT_PRICE_REQUIRED");
    }
  }

  const plu = input.pluCode?.trim() || null;
  if (plu) {
    const dup = await prisma.catalogItem.findFirst({
      where: { branchId, pluCode: plu, isActive: true },
    });
    if (dup) throw new Error("PLU_DUPLICATE");
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.catalogItem.create({
      data: {
        branchId,
        name: input.name.trim(),
        type: input.type,
        pluCode: plu,
        barcode: input.barcode?.trim() || null,
        unitPriceRialPerKg: input.unitPriceRialPerKg ?? null,
      },
    });

    await tx.branchStock.create({
      data: {
        branchId,
        catalogItemId: item.id,
        quantityGrams: 0,
      },
    });

    return item;
  }).then(async (item) => {
    await ensureFilletYieldRule(branchId);
    return item;
  });
}

export async function updateCatalogItem(
  branchId: string,
  catalogItemId: string,
  input: {
    name?: string;
    pluCode?: string | null;
    barcode?: string | null;
    unitPriceRialPerKg?: bigint | null;
    isActive?: boolean;
  },
) {
  const existing = await prisma.catalogItem.findFirst({
    where: { id: catalogItemId, branchId },
  });
  if (!existing) throw new Error("NOT_FOUND");

  const plu =
    input.pluCode !== undefined ? input.pluCode?.trim() || null : existing.pluCode;
  if (plu && plu !== existing.pluCode) {
    const dup = await prisma.catalogItem.findFirst({
      where: { branchId, pluCode: plu, isActive: true, NOT: { id: catalogItemId } },
    });
    if (dup) throw new Error("PLU_DUPLICATE");
  }

  const data: Prisma.CatalogItemUpdateInput = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.pluCode !== undefined) data.pluCode = plu;
  if (input.unitPriceRialPerKg !== undefined) data.unitPriceRialPerKg = input.unitPriceRialPerKg;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.barcode !== undefined) data.barcode = input.barcode?.trim() || null;

  const item = await prisma.catalogItem.update({
    where: { id: catalogItemId },
    data,
  });
  await ensureFilletYieldRule(branchId);
  return item;
}
