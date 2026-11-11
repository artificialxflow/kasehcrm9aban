import { ScaleConnection } from "@prisma/client";
import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { requirePanelAuth } from "@/lib/panel-auth";
import { createScaleDevice, listScaleDevices } from "@/lib/services/scale-devices";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  const url = new URL(req.url);
  const includeInactive = url.searchParams.get("all") === "1";
  const devices = await listScaleDevices(branch.id, includeInactive);
  return jsonResponse({ branch, devices });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  let body: { label?: string; model?: string; connection?: ScaleConnection };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  if (!body.label?.trim()) return errorResponse("LABEL_REQUIRED", 400);
  if (body.connection && !Object.values(ScaleConnection).includes(body.connection)) {
    return errorResponse("INVALID_CONNECTION", 400);
  }

  try {
    const device = await createScaleDevice(branch.id, {
      label: body.label!.trim(),
      model: body.model,
      connection: body.connection,
    });
    return jsonResponse({ device }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    const status = msg === "LABEL_DUPLICATE" ? 409 : msg === "LABEL_REQUIRED" ? 400 : 500;
    return errorResponse(msg, status);
  }
}
