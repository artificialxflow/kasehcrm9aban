import { ScaleBusinessEventType } from "@prisma/client";
import { normalizeRawAsciiWeight } from "@/lib/scale/normalize-payload";

const SCALE_SOURCES = new Set(["USB", "RS232"]);
const EVENT_TYPES = new Set<string>(Object.values(ScaleBusinessEventType));

export type ScaleEventInput = {
  eventType: ScaleBusinessEventType;
  clientEventId?: string;
  deviceId?: string;
  agentHostname?: string;
  rawPayload: {
    barcode?: string;
    pluCode?: string;
    weightGrams?: number;
    source?: string;
    note?: string;
    [key: string]: unknown;
  };
};

function inferEventType(
  explicit: unknown,
  barcode: string,
): ScaleBusinessEventType {
  if (typeof explicit === "string" && EVENT_TYPES.has(explicit)) {
    return explicit as ScaleBusinessEventType;
  }
  if (barcode.includes("|")) return ScaleBusinessEventType.sale;
  return ScaleBusinessEventType.sale;
}

export function eventTypeLabelFa(type: string): string {
  const map: Record<string, string> = {
    sale: 'فروش',
    manual: 'دستی',
    prep_in: 'ورود پخت',
    prep_out: 'خروج پخت',
    waste: 'ضایعات',
  };
  return map[type] ?? type;
}

export function validateScaleEventBody(
  body: unknown,
  opts?: { requireClientEventId?: boolean },
):
  | { ok: true; data: ScaleEventInput }
  | { ok: false; fields: Record<string, string> } {
  if (!body || typeof body !== "object") {
    return { ok: false, fields: { body: "invalid_json" } };
  }
  const b = body as Record<string, unknown>;
  const rawPayload = b.rawPayload;
  if (!rawPayload || typeof rawPayload !== "object") {
    return { ok: false, fields: { rawPayload: "required" } };
  }
  const rp = { ...(rawPayload as Record<string, unknown>) };
  const source = rp.source;
  if (typeof source !== "string" || !SCALE_SOURCES.has(source)) {
    return { ok: false, fields: { "rawPayload.source": "must_be_USB_or_RS232" } };
  }

  let barcode = typeof rp.barcode === "string" ? rp.barcode : "";
  const pluCode = typeof rp.pluCode === "string" ? rp.pluCode.trim() : "";
  let weightGrams =
    typeof rp.weightGrams === "number" && Number.isFinite(rp.weightGrams)
      ? rp.weightGrams
      : null;

  if (barcode && !barcode.includes("|")) {
    const fromAscii = normalizeRawAsciiWeight(barcode);
    if (fromAscii != null) {
      weightGrams = weightGrams ?? fromAscii;
      barcode = "";
    }
  }

  const hasBarcode = barcode.trim().length > 0;
  const hasWeight = weightGrams != null && weightGrams > 0;

  if (!hasBarcode && !hasWeight) {
    return {
      ok: false,
      fields: { rawPayload: "barcode_or_weightGrams_required" },
    };
  }

  const eventType = inferEventType(b.eventType, hasBarcode ? barcode : "");
  const clientEventId =
    typeof b.clientEventId === "string" ? b.clientEventId.trim() : undefined;
  const deviceField =
    typeof b.deviceId === "string" ? b.deviceId.trim() : undefined;

  if (opts?.requireClientEventId && !clientEventId) {
    return { ok: false, fields: { clientEventId: "required" } };
  }

  const { barcode: _dropBarcode, ...rpRest } = rp;

  return {
    ok: true,
    data: {
      eventType,
      clientEventId: clientEventId || undefined,
      deviceId: deviceField,
      agentHostname: deviceField,
      rawPayload: {
        ...rpRest,
        source,
        ...(hasBarcode ? { barcode: barcode.trim() } : {}),
        ...(pluCode ? { pluCode } : {}),
        ...(hasWeight ? { weightGrams: weightGrams! } : {}),
      },
    },
  };
}

export function extractBarcodeForIdempotency(rawPayload: ScaleEventInput["rawPayload"]): string | null {
  if (rawPayload.barcode?.trim()) return rawPayload.barcode.trim();
  if (rawPayload.pluCode && rawPayload.weightGrams) {
    return `${rawPayload.pluCode}|${rawPayload.weightGrams}`;
  }
  if (rawPayload.weightGrams) return `w:${rawPayload.weightGrams}`;
  return null;
}
