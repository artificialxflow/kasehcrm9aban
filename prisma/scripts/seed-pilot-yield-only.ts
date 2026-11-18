/**
 * فقط قانون ۹۰٪ فیله — بدون کاتالوگ/کاربر/شعب.
 * بعد از reset:full و ثبت دستی RAW-FILLET + FILLET01 در پنل اجرا کنید، یا قبل از خرید اول.
 *
 * npm run db:seed-yield
 */
import { PrismaClient } from "@prisma/client";

const PILOT_LEGACY_ID = "2";
const RAW_PLU = "RAW-FILLET";
const SALE_PLU = "FILLET01";
const YIELD_BPS = 9000;

const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findFirst({ where: { legacyId: PILOT_LEGACY_ID } });
  if (!branch) throw new Error("Pilot branch not found");

  const raw = await prisma.catalogItem.findFirst({
    where: { branchId: branch.id, pluCode: RAW_PLU, isActive: true },
  });
  const sale = await prisma.catalogItem.findFirst({
    where: { branchId: branch.id, pluCode: SALE_PLU, isActive: true },
  });
  if (!raw || !sale) {
    console.log(
      "قانون ساخته نشد — در پنل هر دو کالا را بسازید: RAW-FILLET (RAW) و FILLET01 (فروش وزنی + فی کیلو).",
    );
    return;
  }

  const rule = await prisma.purchaseYieldRule.upsert({
    where: {
      branchId_rawCatalogItemId: {
        branchId: branch.id,
        rawCatalogItemId: raw.id,
      },
    },
    create: {
      branchId: branch.id,
      rawCatalogItemId: raw.id,
      saleCatalogItemId: sale.id,
      yieldBps: YIELD_BPS,
    },
    update: {
      saleCatalogItemId: sale.id,
      yieldBps: YIELD_BPS,
    },
  });

  console.log(`OK yield rule branch=${branch.name} bps=${rule.yieldBps}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());