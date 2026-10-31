import { prisma } from "@/lib/prisma";

function dayBounds(day = new Date()) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function getDashboardSummary() {
  const { start, end } = dayBounds();

  const [branches, salesToday, purchasesToday, recentSales] = await Promise.all([
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
    prisma.saleInvoice.findMany({
      where: { soldAt: { gte: start, lte: end } },
      select: { totalRial: true, branchId: true },
    }),
    prisma.purchaseInvoice.count({ where: { purchasedAt: { gte: start, lte: end } } }),
    prisma.saleInvoice.findMany({
      take: 15,
      orderBy: { soldAt: "desc" },
      include: {
        branch: true,
        lines: { include: { catalogItem: true } },
      },
    }),
  ]);

  const totalSaleRialToday = salesToday.reduce((s, x) => s + x.totalRial, BigInt(0));
  const openBranches = branches.filter((b) => b.isOpen).length;

  const branchSaleMap = new Map<string, bigint>();
  for (const s of salesToday) {
    branchSaleMap.set(s.branchId, (branchSaleMap.get(s.branchId) ?? BigInt(0)) + s.totalRial);
  }

  const branchShare = branches
    .map((b) => ({
      name: b.name,
      value: Number(branchSaleMap.get(b.id) ?? BigInt(0)) / 10,
      concept: b.concept,
    }))
    .filter((x) => x.value > 0);

  const last7Days = await getLast7DaysSales();

  return {
    totalSaleRialToday,
    saleCountToday: salesToday.length,
    purchaseCountToday: purchasesToday,
    openBranches,
    branchCount: branches.length,
    branchShare,
    salesChart: last7Days,
    recentSales,
    branches: branches.map((b) => ({
      id: b.id,
      legacyId: b.legacyId,
      name: b.name,
      city: b.city,
      concept: b.concept,
      isOpen: b.isOpen,
      isPilot: b.isPilot,
      dailySaleRial: branchSaleMap.get(b.id) ?? BigInt(0),
    })),
  };
}

async function getLast7DaysSales() {
  const days: { name: string; sales: number }[] = [];
  const faDays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const { start, end } = dayBounds(d);
    const agg = await prisma.saleInvoice.aggregate({
      where: { soldAt: { gte: start, lte: end } },
      _sum: { totalRial: true },
    });
    const rial = agg._sum.totalRial ?? BigInt(0);
    days.push({
      name: faDays[d.getDay()],
      sales: Number(rial) / 10,
    });
  }
  return days;
}
