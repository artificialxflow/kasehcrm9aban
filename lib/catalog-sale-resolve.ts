import { CatalogItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PILOT_FILLET_YIELD } from "@/lib/services/purchase-yield";

export type WeighedSaleResolveResult =
  | { kind: "ok"; item: { id: string; pluCode: string | null; unitPriceRialPerKg: bigint } }
  | { kind: "not_found"; plu: string }
  | { kind: "wrong_type"; plu: string; type: CatalogItemType }
  | { kind: "no_price"; plu: string; catalogItemId: string };

/** کالای فروش وزنی مناسب ingest ترازو (کد + فی کیلو). */
export async function resolveWeighedSaleForPlu(
  branchId: string,
  pluCode: string,
): Promise<WeighedSaleResolveResult> {
  const plu = pluCode.trim();
  if (!plu) return { kind: "not_found", plu: pluCode };

  const byPlu = await prisma.catalogItem.findFirst({
    where: {
      branchId,
      isActive: true,
      pluCode: { equals: plu, mode: "insensitive" },
    },
    select: { id: true, pluCode: true, type: true, unitPriceRialPerKg: true },
  });

  if (
    byPlu?.type === CatalogItemType.WEIGHED_SALE &&
    byPlu.unitPriceRialPerKg != null &&
    byPlu.unitPriceRialPerKg > 0n
  ) {
    return {
      kind: "ok",
      item: {
        id: byPlu.id,
        pluCode: byPlu.pluCode,
        unitPriceRialPerKg: byPlu.unitPriceRialPerKg,
      },
    };
  }

  if (byPlu && byPlu.type !== CatalogItemType.WEIGHED_SALE) {
    return { kind: "wrong_type", plu, type: byPlu.type };
  }

  if (byPlu) {
    return { kind: "no_price", plu, catalogItemId: byPlu.id };
  }

  const rule = await prisma.purchaseYieldRule.findFirst({
    where: {
      branchId,
      saleCatalogItem: {
        isActive: true,
        pluCode: { equals: plu, mode: "insensitive" },
      },
    },
    include: {
      saleCatalogItem: {
        select: { id: true, pluCode: true, type: true, unitPriceRialPerKg: true },
      },
    },
  });

  const fromRule = rule?.saleCatalogItem;
  if (
    fromRule?.type === CatalogItemType.WEIGHED_SALE &&
    fromRule.unitPriceRialPerKg != null &&
    fromRule.unitPriceRialPerKg > 0n
  ) {
    return {
      kind: "ok",
      item: {
        id: fromRule.id,
        pluCode: fromRule.pluCode,
        unitPriceRialPerKg: fromRule.unitPriceRialPerKg,
      },
    };
  }

  if (
    plu.toUpperCase() === PILOT_FILLET_YIELD.salePlu.toUpperCase() ||
    plu.toUpperCase() === PILOT_FILLET_YIELD.rawPlu.toUpperCase()
  ) {
    const pilotRule = await prisma.purchaseYieldRule.findFirst({
      where: { branchId },
      include: {
        saleCatalogItem: {
          select: { id: true, pluCode: true, type: true, unitPriceRialPerKg: true },
        },
      },
    });
    const yieldSale = pilotRule?.saleCatalogItem;
    if (
      yieldSale?.type === CatalogItemType.WEIGHED_SALE &&
      yieldSale.unitPriceRialPerKg != null &&
      yieldSale.unitPriceRialPerKg > 0n
    ) {
      return {
        kind: "ok",
        item: {
          id: yieldSale.id,
          pluCode: yieldSale.pluCode,
          unitPriceRialPerKg: yieldSale.unitPriceRialPerKg,
        },
      };
    }
  }

  return { kind: "not_found", plu };
}

export function weighedSaleResolveToIngestCode(
  resolved: Exclude<WeighedSaleResolveResult, { kind: "ok" }>,
): "ITEM_NOT_FOUND" | "INVALID_SALE_ITEM_TYPE" | "UNIT_PRICE_REQUIRED" {
  switch (resolved.kind) {
    case "wrong_type":
      return "INVALID_SALE_ITEM_TYPE";
    case "no_price":
      return "UNIT_PRICE_REQUIRED";
    default:
      return "ITEM_NOT_FOUND";
  }
}