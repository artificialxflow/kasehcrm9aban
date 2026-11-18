import { prisma } from "@/lib/prisma";

/** env اولویت دارد؛ وگرنه مقدار ذخیره‌شده در شعبه (پنل). */
export async function resolveDefaultSalePlu(branchId: string): Promise<string | undefined> {
  const fromEnv = process.env.PILOT_DEFAULT_SALE_PLU?.trim();
  if (fromEnv) return fromEnv;

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { pilotDefaultSalePlu: true },
  });
  const fromDb = branch?.pilotDefaultSalePlu?.trim();
  return fromDb || undefined;
}