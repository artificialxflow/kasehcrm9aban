import { randomUUID } from "crypto";
import { ScaleBusinessEventType } from "@prisma/client";
import { resolveBranchId } from "@/lib/branch-resolve";
import { requirePanelAuth } from "@/lib/panel-auth";
import { scaleError, scaleOk } from "@/lib/scale-api-response";
import { ingestScaleEvent } from "@/lib/services/scale-integration";
import { validateScaleEventBody } from "@/lib/scale-event-validate";

type RouteCtx = { params: Promise<{ branchId: string }> };

function paddedAsciiWeight(grams: number): string {
  const s = String(grams);
  const pad = Math.max(0, 5 - s.length);
  return `${" ".repeat(pad)}${s}  `;
}

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

  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const weightRaw = b.weightGrams;
  const weightGrams =
    typeof weightRaw === "number" && Number.isFinite(weightRaw) ? weightRaw : parseInt(String(weightRaw), 10);
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
    return scaleError("validation", 422, { weightGrams: "positive_number_required" });
  }

  const eventTypeRaw = b.eventType;
  const eventType =
    eventTypeRaw === "test"
      ? ScaleBusinessEventType.sale
      : eventTypeRaw === "manual"
        ? ScaleBusinessEventType.manual
        : ScaleBusinessEventType.sale;

  const pluCode = typeof b.pluCode === "string" ? b.pluCode.trim() : "";
  const barcode = pluCode
    ? `${pluCode}|${weightGrams}|0`
    : paddedAsciiWeight(weightGrams);

  const clientEventId =
    typeof b.clientEventId === "string" && b.clientEventId.trim()
      ? b.clientEventId.trim()
      : `SIM-CRM-${new Date().toISOString()}-${randomUUID().slice(0, 8)}`;

  const raw = {
    eventType,
    clientEventId,
    deviceId: "SIM-CRM",
    rawPayload: {
      source: "RS232" as const,
      weightGrams,
      barcode,
      ...(pluCode ? { pluCode } : {}),
    },
  };

  const validated = validateScaleEventBody(raw);
  if (!validated.ok) {
    return scaleError("validation", 422, validated.fields);
  }

  const result = await ingestScaleEvent(branch.id, validated.data);
  if (result.kind === "duplicate") {
    return scaleOk(result.eventId, {
      status: 200,
      duplicate: true,
      saleId: result.saleInvoiceId ?? undefined,
    });
  }
  if (result.kind === "error") {
    return scaleError(result.code.toLowerCase(), 422, { ingest: result.code });
  }

  return scaleOk(result.eventId, {
    status: 201,
    saleId: "saleId" in result ? result.saleId ?? undefined : undefined,
  });
}