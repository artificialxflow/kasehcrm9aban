/**
 * پاکسازی دادهٔ عملیاتی پایلوت شعبه شریعتی (legacyId = 2).
 * کاتالوگ، کاربران و شعب دیگر دست نخورده می‌مانند.
 *
 * استفاده: DATABASE_URL=... npm run db:reset-pilot
 */
import { PrismaClient } from "@prisma/client";

const PILOT_LEGACY_ID = "2";

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

    return { events, tickets, sales, purchases, movements, stock, heartbeats, logs };
  });

  console.log(`پاکسازی شعبه «${branch.name}» (legacyId ${PILOT_LEGACY_ID}):`);
  console.log(`  رویداد ترازو: ${deleted.events.count}`);
  console.log(`  بلیت ترازو: ${deleted.tickets.count}`);
  console.log(`  فاکتور فروش: ${deleted.sales.count}`);
  console.log(`  فاکتور خرید: ${deleted.purchases.count}`);
  console.log(`  گردش موجودی: ${deleted.movements.count}`);
  console.log(`  ردیف موجودی: ${deleted.stock.count}`);
  console.log(`  سیگنال نماینده: ${deleted.heartbeats.count}`);
  console.log(`  آپلود لاگ: ${deleted.logs.count}`);
  console.log("پیشنهاد: npm run db:seed برای بازسازی موجودی صفر و کاتالوگ.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());