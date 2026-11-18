import type { BranchConcept } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listCustomerMenuByConcept(concept: BranchConcept) {
  return prisma.customerMenuItem.findMany({
    where: { concept, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}