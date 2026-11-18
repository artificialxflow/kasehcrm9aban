import { randomUUID } from "crypto";
import { ScaleBusinessEventType } from "@prisma/client";
import { resolveBranchId } from "@/lib/branch-resolve";
import { requirePanelAuth } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";
import { scaleError, scaleOk } from "@/lib/scale-api-response";
import { resolveWeighedSaleForPlu } from "@/lib/catalog-sale-resolve";
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

  const modeRaw = String(b.eventType ?? b.mode ?? "observe").toLowerCase();
  const isObserve = modeRaw === "observe" || modeRaw === "test";
  const isSale = modeRaw === "sale";

  const pluCode = typeof b.pluCode === "string" ? b.pluCode.trim() : "";

  if (isSale && !pluCode) {
    return scaleError("validation", 422, { pluCode: "required_for_sale" });
  }

  const eventType = isObserve
    ? ScaleBusinessEventType.manual
    : ScaleBusinessEventType.sale;

  let barcode = paddedAsciiWeight(weightGrams);

  if (isSale && pluCode) {
    const resolved = await resolveWeighedSaleForPlu(branch.id, pluCode);
    if (resolved.kind !== "ok") {
      return scaleError("validation", 422, {
        pluCode: resolved.kind === "no_price" ? "no_unit_price" : "not_found_or_invalid_type",
      });
    }
    const item = resolved.item;
    barcode = `${pluCode}|${weightGrams}|${item.unitPriceRialPerKg.toString()}`;
  }

  if (isObserve) {
    barcode = paddedAsciiWeight(weightGrams);
  }

  const clientEventId =
    typeof b.clientEventId === "string" && b.clientEventId.trim()
      ? b.clientEventId.trim()
      : `SIM-CRM-${new Date().toISOString()}-${randomUUID().slice(0, 8)}`;

  const rawPayload: Record<string, unknown> = {
    source: "RS232" as const,
    weightGrams,
    barcode,
    ...(pluCode ? { pluCode } : {}),
    ...(isObserve ? { note: "SIM-CRM observe — بدون فاکتور خودکار" } : {}),
  };

  const raw = {
    eventType,
    clientEventId,
    deviceId: "SIM-CRM",
    rawPayload,
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
    return scaleError(result.code.toLowerCase(), 422, {
      ingest: result.code,
      message: result.messageFa,
    });
  }

  return scaleOk(result.eventId, {
    status: 201,
    saleId: result.kind === "ok" ? result.saleId ?? undefined : undefined,
  });
}