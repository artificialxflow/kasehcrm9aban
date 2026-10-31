import { resolveBranchId } from "@/lib/branch-resolve";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonResponse } from "@/lib/api-json";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const items = await prisma.catalogItem.findMany({
    where: { branchId: branch.id, isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return jsonResponse({ branch, items });
}
