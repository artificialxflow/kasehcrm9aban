import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { updateBranch } from "@/lib/services/branches";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  let body: { name?: string; city?: string; isOpen?: boolean };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  const updated = await updateBranch(branch.id, {
    name: body.name,
    city: body.city,
    isOpen: body.isOpen,
  });

  return jsonResponse({ branch: updated });
}
