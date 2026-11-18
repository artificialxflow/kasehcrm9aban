import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

/** پیش‌فرض پایلوت فیله — بدون نیاز به seed کامل */
export const PILOT_FILLET_YIELD = {
  rawPlu: "RAW-FILLET",
  salePlu: "FILLET01",
  yieldBps: 9000,
} as const;

export async function ensureFilletYieldRule(
  branchId: string,
  client: Tx | typeof prisma = prisma,
) {
  const raw = await client.catalogItem.findFirst({
    where: { branchId, pluCode: PILOT_FILLET_YIELD.rawPlu, isActive: true },
  });
  const sale = await client.catalogItem.findFirst({
    where: { branchId, pluCode: PILOT_FILLET_YIELD.salePlu, isActive: true },
  });
  if (!raw || !sale) return null;

  return client.purchaseYieldRule.upsert({
    where: {
      branchId_rawCatalogItemId: {
        branchId,
        rawCatalogItemId: raw.id,
      },
    },
    create: {
      branchId,
      rawCatalogItemId: raw.id,
      saleCatalogItemId: sale.id,
      yieldBps: PILOT_FILLET_YIELD.yieldBps,
    },
    update: {
      saleCatalogItemId: sale.id,
      yieldBps: PILOT_FILLET_YIELD.yieldBps,
    },
  });
}

/** هنگام خرید: اگر rule نبود ولی PLU فیله هست، rule را می‌سازد */
export async function findYieldRuleForRawLine(
  tx: Tx,
  branchId: string,
  rawCatalogItemId: string,
) {
  let rule = await tx.purchaseYieldRule.findUnique({
    where: {
      branchId_rawCatalogItemId: { branchId, rawCatalogItemId },
    },
  });
  if (rule) return rule;

  const raw = await tx.catalogItem.findUnique({
    where: { id: rawCatalogItemId },
    select: { pluCode: true, branchId: true },
  });
  if (!raw || raw.pluCode !== PILOT_FILLET_YIELD.rawPlu) return null;

  const sale = await tx.catalogItem.findFirst({
    where: {
      branchId,
      pluCode: PILOT_FILLET_YIELD.salePlu,
      isActive: true,
    },
  });
  if (!sale) return null;

  rule = await tx.purchaseYieldRule.create({
    data: {
      branchId,
      rawCatalogItemId,
      saleCatalogItemId: sale.id,
      yieldBps: PILOT_FILLET_YIELD.yieldBps,
    },
  });
  console.info("[purchase-yield] auto rule", {
    branchId,
    rawCatalogItemId,
    saleCatalogItemId: sale.id,
    yieldBps: PILOT_FILLET_YIELD.yieldBps,
  });
  return rule;
}