import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { verifyScaleApiKey } from "@/lib/scale-api-auth";
import { ingestScaleEvent } from "@/lib/services/scale-integration";
import { prisma } from "@/lib/prisma";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const events = await prisma.scaleIntegrationEvent.findMany({
    where: { branchId: branch.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return jsonResponse({ branch, events });
}

export async function POST(req: Request, ctx: RouteCtx) {
  if (!verifyScaleApiKey(req)) return errorResponse("UNAUTHORIZED", 401);

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const body = (await req.json()) as { deviceId?: string; rawPayload: object };
  if (!body.rawPayload) return errorResponse("NO_PAYLOAD");

  const result = await ingestScaleEvent(branch.id, body);
  const status = result.error ? 422 : 201;
  return jsonResponse(result, { status });
}
