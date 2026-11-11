import { ScaleConnection } from "@prisma/client";
import { resolveBranchId } from "@/lib/branch-resolve";
import { errorResponse, jsonResponse } from "@/lib/api-json";
import { requirePanelAuth } from "@/lib/panel-auth";
import { updateScaleDevice } from "@/lib/services/scale-devices";

type RouteCtx = { params: Promise<{ branchId: string; deviceId: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key, deviceId } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return errorResponse("BRANCH_NOT_FOUND", 404);

  let body: {
    label?: string;
    model?: string;
    connection?: ScaleConnection;
    isActive?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  if (body.connection && !Object.values(ScaleConnection).includes(body.connection)) {
    return errorResponse("INVALID_CONNECTION", 400);
  }

  try {
    const device = await updateScaleDevice(branch.id, deviceId, body);
    return jsonResponse({ device });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    const status =
      msg === "NOT_FOUND" ? 404 : msg === "LABEL_DUPLICATE" ? 409 : msg === "LABEL_REQUIRED" ? 400 : 500;
    return errorResponse(msg, status);
  }
}
