const SCALE_SOURCES = new Set(["USB", "RS232"]);

export type ScaleEventInput = {
  deviceId?: string;
  rawPayload: {
    barcode?: string;
    pluCode?: string;
    weightGrams?: number;
    source?: string;
    [key: string]: unknown;
  };
};

export function validateScaleEventBody(
  body: unknown,
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
  const rp = rawPayload as Record<string, unknown>;
  const source = rp.source;
  if (typeof source !== "string" || !SCALE_SOURCES.has(source)) {
    return { ok: false, fields: { "rawPayload.source": "must_be_USB_or_RS232" } };
  }

  const barcode = typeof rp.barcode === "string" ? rp.barcode.trim() : "";
  const pluCode = typeof rp.pluCode === "string" ? rp.pluCode.trim() : "";
  const weightGrams =
    typeof rp.weightGrams === "number" && Number.isFinite(rp.weightGrams)
      ? rp.weightGrams
      : null;

  if (!barcode && !(pluCode && weightGrams && weightGrams > 0)) {
    return {
      ok: false,
      fields: { rawPayload: "barcode_or_pluCode_weightGrams_required" },
    };
  }

  return {
    ok: true,
    data: {
      deviceId: typeof b.deviceId === "string" ? b.deviceId : undefined,
      rawPayload: {
        ...rp,
        source,
        ...(barcode ? { barcode } : {}),
        ...(pluCode ? { pluCode } : {}),
        ...(weightGrams ? { weightGrams } : {}),
      },
    },
  };
}

export function extractBarcodeForIdempotency(rawPayload: ScaleEventInput["rawPayload"]): string | null {
  if (rawPayload.barcode?.trim()) return rawPayload.barcode.trim();
  if (rawPayload.pluCode && rawPayload.weightGrams) {
    return `${rawPayload.pluCode}|${rawPayload.weightGrams}`;
  }
  return null;
}
