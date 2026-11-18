/**
 * پاکسازی دادهٔ پایلوت شعبه شریعتی (legacyId = 2).
 * شعب، کاربران و منوی آنلاین سراسری دست نخورده می‌مانند.
 *
 * npm run db:reset-pilot        — فقط تراکنش‌ها و موجودی
 * npm run db:reset-pilot:full   — همان + کاتالوگ کالا + دستگاه‌های ترازو شعبه
 */
import { PrismaClient } from "@prisma/client";

const PILOT_LEGACY_ID = "2";
const full = process.argv.includes("--full");

const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findFirst({ where: { legacyId: PILOT_LEGACY_ID } });
  if (!branch) {
    throw new Error(`شعبه پایلوت (legacyId=${PILOT_LEGACY_ID}) یافت نشد.`);
  }
  const branchId = branch.id;

  const deleted = await prisma.$transaction(async (tx) => {
    const events = await tx.scaleIntegrationEvent.deleteMany({ where: { branchId } });
    const tickets = await tx.scaleTicket.deleteMany({ where: { branchId } });
    const sales = await tx.saleInvoice.deleteMany({ where: { branchId } });
    const purchases = await tx.purchaseInvoice.deleteMany({ where: { branchId } });
    const movements = await tx.stockMovement.deleteMany({ where: { branchId } });
    const stock = await tx.branchStock.deleteMany({ where: { branchId } });
    const heartbeats = await tx.scaleAgentHeartbeat.deleteMany({ where: { branchId } });
    const logs = await tx.scaleAgentLogUpload.deleteMany({ where: { branchId } });

    let catalog = { count: 0 };
    let devices = { count: 0 };
    if (full) {
      devices = await tx.scaleDevice.deleteMany({ where: { branchId } });
      catalog = await tx.catalogItem.deleteMany({ where: { branchId } });
    }

    return { events, tickets, sales, purchases, movements, stock, heartbeats, logs, catalog, devices };
  });

  console.log(`پاکسازی شعبه «${branch.name}» (legacyId ${PILOT_LEGACY_ID})${full ? " — حالت کامل" : ""}:`);
  console.log(`  رویداد ترازو: ${deleted.events.count}`);
  console.log(`  بلیت ترازو: ${deleted.tickets.count}`);
  console.log(`  فاکتور فروش: ${deleted.sales.count}`);
  console.log(`  فاکتور خرید: ${deleted.purchases.count}`);
  console.log(`  گردش موجودی: ${deleted.movements.count}`);
  console.log(`  ردیف موجودی: ${deleted.stock.count}`);
  console.log(`  سیگنال نماینده: ${deleted.heartbeats.count}`);
  console.log(`  آپلود لاگ: ${deleted.logs.count}`);
  if (full) {
    console.log(`  کالاهای کاتالوگ: ${deleted.catalog.count}`);
    console.log(`  دستگاه ترازو: ${deleted.devices.count}`);
    console.log("\nکاتالوگ خالی است — از پنل «کالاها و کد فروش» دستی ثبت کنید.");
    console.log("توجه: db:seed دوباره کالاهای دمو را می‌سازد؛ برای شروع دستی seed نزنید.");
  } else {
    console.log("\nپیشنهاد: npm run db:seed برای بازسازی ردیف موجودی صفر (کاتالوگ بدون تغییر).");
    console.log("برای پاک کردن کاتالوگ هم: npm run db:reset-pilot:full");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());