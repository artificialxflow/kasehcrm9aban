import { randomUUID } from "crypto";
import { ScaleBusinessEventType } from "@prisma/client";
import { resolveBranchId } from "@/lib/branch-resolve";
import { requirePanelAuth } from "@/lib/panel-auth";
import { scaleError, scaleOk } from "@/lib/scale-api-response";
import { ingestScaleEvent } from "@/lib/services/scale-integration";
import { validateScaleEventBody } from "@/lib/scale-event-validate";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return scaleError("not_found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return scaleError("validation", 422, { body: "invalid_json" });
  }

  const raw =
    body && typeof body === "object"
      ? {
          ...(body as object),
          eventType: ScaleBusinessEventType.manual,
          clientEventId:
            typeof (body as { clientEventId?: string }).clientEventId === "string"
              ? (body as { clientEventId: string }).clientEventId
              : `manual-panel-${randomUUID()}`,
        }
      : body;

  const validated = validateScaleEventBody(raw);
  if (!validated.ok) {
    return scaleError("validation", 422, validated.fields);
  }

  const input = {
    ...validated.data,
    eventType: ScaleBusinessEventType.manual,
  };

  const result = await ingestScaleEvent(branch.id, input);
  if (result.kind === "duplicate") {
    return scaleOk(result.eventId, { status: 200, duplicate: true });
  }
  if (result.kind === "error") {
    return scaleError(result.code.toLowerCase(), 422, {
      ingest: result.code,
      message: result.messageFa,
    });
  }

  return scaleOk(result.eventId, {
    status: 201,
    saleId: "saleId" in result ? result.saleId ?? undefined : undefined,
  });
}
