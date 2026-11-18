/**
 * فقط قانون ۹۰٪ فیله — بدون کاتالوگ/کاربر/شعب.
 * بعد از reset:full و ثبت دستی RAW-FILLET + FILLET01 در پنل اجرا کنید، یا قبل از خرید اول.
 *
 * npm run db:seed-yield
 */
import { PrismaClient } from "@prisma/client";
import { ensureFilletYieldRule } from "../../lib/services/purchase-yield";

const PILOT_LEGACY_ID = "2";
const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findFirst({ where: { legacyId: PILOT_LEGACY_ID } });
  if (!branch) throw new Error("Pilot branch not found");

  const rule = await ensureFilletYieldRule(branch.id, prisma);
  if (!rule) {
    console.log(
      "قانون ساخته نشد — در پنل هر دو کالا را بسازید: RAW-FILLET (RAW) و FILLET01 (فروش وزنی + فی کیلو).",
    );
    return;
  }
  console.log(`OK yield rule branch=${branch.name} bps=${rule.yieldBps}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());