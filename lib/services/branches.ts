import { prisma } from "@/lib/prisma";

function dayBounds(day = new Date()) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function listBranchesWithStats(day = new Date()) {
  const { start, end } = dayBounds(day);
  const branches = await prisma.branch.findMany({
    orderBy: [{ legacyId: "asc" }, { name: "asc" }],
  });

  const salesToday = await prisma.saleInvoice.groupBy({
    by: ["branchId"],
    where: { soldAt: { gte: start, lte: end } },
    _sum: { totalRial: true },
  });

  const saleMap = new Map(salesToday.map((s) => [s.branchId, s._sum.totalRial ?? BigInt(0)]));

  return branches.map((b) => ({
    ...b,
    dailySaleRial: saleMap.get(b.id) ?? BigInt(0),
  }));
}

export async function updateBranch(
  branchId: string,
  data: {
    name?: string;
    city?: string;
    isOpen?: boolean;
    pilotDefaultSalePlu?: string | null;
  },
) {
  const patch: { name?: string; city?: string; isOpen?: boolean; pilotDefaultSalePlu?: string | null } =
    { ...data };
  if (data.pilotDefaultSalePlu !== undefined) {
    patch.pilotDefaultSalePlu = data.pilotDefaultSalePlu?.trim() || null;
  }
  return prisma.branch.update({
    where: { id: branchId },
    data: patch,
  });
}
