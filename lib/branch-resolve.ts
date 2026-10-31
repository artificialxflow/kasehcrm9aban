import { prisma } from "@/lib/prisma";

/** Resolve branch by internal cuid or legacy mock id (e.g. "2" for شریعتی). */
export async function resolveBranchId(branchIdOrLegacy: string) {
  const byId = await prisma.branch.findUnique({ where: { id: branchIdOrLegacy } });
  if (byId) return byId;

  const byLegacy = await prisma.branch.findFirst({ where: { legacyId: branchIdOrLegacy } });
  if (byLegacy) return byLegacy;

  return null;
}

export async function getPilotBranch() {
  return prisma.branch.findFirst({ where: { isPilot: true } });
}
