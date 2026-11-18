/**
 * ساخت بچ برای خطوط خرید RAW موجود که هنوز PurchaseBatch ندارند (بدون تخصیص فروش گذشته).
 * npm run db:backfill-batches  — اضافه به package.json
 */
import { CatalogItemType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function expectedSellableGrams(rawGrams: number, yieldBps: number): number {
  return Math.floor((rawGrams * yieldBps) / 10_000);
}

async function main() {
  const lines = await prisma.purchaseLine.findMany({
    where: {
      purchaseBatch: null,
      catalogItem: { type: CatalogItemType.RAW },
    },
    include: {
      catalogItem: true,
      purchaseInvoice: true,
    },
  });

  let created = 0;
  let skipped = 0;

  for (const line of lines) {
    const rule = await prisma.purchaseYieldRule.findUnique({
      where: {
        branchId_rawCatalogItemId: {
          branchId: line.purchaseInvoice.branchId,
          rawCatalogItemId: line.catalogItemId,
        },
      },
    });
    if (!rule) {
      skipped++;
      continue;
    }

    await prisma.purchaseBatch.create({
      data: {
        branchId: line.purchaseInvoice.branchId,
        purchaseLineId: line.id,
        rawCatalogItemId: line.catalogItemId,
        saleCatalogItemId: rule.saleCatalogItemId,
        purchasedAt: line.purchaseInvoice.purchasedAt,
        rawGrams: line.weightGrams,
        expectedSellableGrams: expectedSellableGrams(line.weightGrams, rule.yieldBps),
        allocatedSoldGrams: 0,
      },
    });
    created++;
  }

  console.log(`backfill: created=${created} skipped_no_rule=${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());