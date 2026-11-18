import { SaleSource, ScaleBusinessEventType, ScaleEventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseScaleBarcode } from "@/lib/scale/parse-barcode";
import { createSaleInvoice } from "@/lib/services/sales";
import { resolveScaleDeviceLink } from "@/lib/scale-device-resolve";
import {
  extractBarcodeForIdempotency,
  type ScaleEventInput,
} from "@/lib/scale-event-validate";
import {
  normalizeScaleProcessError,
  scaleIngestErrorMessageFa,
  type ScaleIngestErrorCode,
} from "@/lib/scale-ingest-errors";

export type IngestScaleEventResult =
  | {
      kind: "duplicate";
      eventId: string;
      saleInvoiceId: string | null;
    }
  | {
      kind: "ok";
      eventId: string;
      saleId: string | null;
    }
  | {
      kind: "stored";
      eventId: string;
    }
  | {
      kind: "error";
      eventId: string;
      code: ScaleIngestErrorCode;
      messageFa: string;
    };

async function markScaleEventFailed(
  eventId: string,
  input: ScaleEventInput,
  code: ScaleIngestErrorCode,
  logContext?: Record<string, unknown>,
): Promise<IngestScaleEventResult> {
  const messageFa = scaleIngestErrorMessageFa(code);
  console.error("[scale-ingest] event failed", {
    eventId,
    code,
    messageFa,
    clientEventId: input.clientEventId,
    agent: input.deviceId ?? input.agentHostname,
    ...logContext,
  });
  const basePayload =
    input.rawPayload && typeof input.rawPayload === "object"
      ? (input.rawPayload as Record<string, unknown>)
      : {};
  await prisma.scaleIntegrationEvent.update({
    where: { id: eventId },
    data: {
      status: ScaleEventStatus.failed,
      rawPayload: {
        ...basePayload,
        failureCode: code,
        failureMessageFa: messageFa,
      },
    },
  });
  return { kind: "error", eventId, code, messageFa };
}

async function findByClientEventId(branchId: string, clientEventId: string) {
  return prisma.scaleIntegrationEvent.findUnique({
    where: {
      branchId_clientEventId: { branchId, clientEventId },
    },
  });
}

async function findIdempotentEventByBarcode(branchId: string, idempotencyKey: string) {
  const minuteStart = new Date();
  minuteStart.setSeconds(0, 0);
  minuteStart.setMilliseconds(0);
  const minuteEnd = new Date(minuteStart.getTime() + 60_000);

  const events = await prisma.scaleIntegrationEvent.findMany({
    where: {
      branchId,
      createdAt: { gte: minuteStart, lt: minuteEnd },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  for (const e of events) {
    const rp = e.rawPayload as ScaleEventInput["rawPayload"];
    if (extractBarcodeForIdempotency(rp) === idempotencyKey) return e;
  }
  return null;
}

async function processSale(
  branchId: string,
  eventId: string,
  input: ScaleEventInput,
): Promise<IngestScaleEventResult> {
  const payload = input.rawPayload;
  let parsed = payload.barcode ? parseScaleBarcode(payload.barcode) : null;

  if (
    !parsed &&
    payload.barcode?.includes("|") &&
    payload.pluCode &&
    payload.weightGrams
  ) {
    const item = await prisma.catalogItem.findFirst({
      where: { branchId, pluCode: payload.pluCode },
    });
    if (item?.unitPriceRialPerKg) {
      parsed = {
        pluCode: payload.pluCode,
        weightGrams: payload.weightGrams,
        unitPriceRialPerKg: item.unitPriceRialPerKg,
      };
    }
  }

  if (
    !parsed &&
    payload.barcode?.includes("|") &&
    !payload.pluCode &&
    payload.weightGrams
  ) {
    const parts = payload.barcode.trim().split("|").map((p) => p.trim());
    const plu = parts[0];
    const w = parseInt(parts[1] ?? "", 10);
    if (plu && Number.isFinite(w) && w > 0) {
      const item = await prisma.catalogItem.findFirst({
        where: { branchId, pluCode: plu },
      });
      if (item?.unitPriceRialPerKg) {
        parsed = {
          pluCode: plu,
          weightGrams: w,
          unitPriceRialPerKg: item.unitPriceRialPerKg,
        };
      }
    }
  }

  if (!parsed && payload.pluCode && payload.weightGrams) {
    const item = await prisma.catalogItem.findFirst({
      where: { branchId, pluCode: payload.pluCode },
    });
    if (item?.unitPriceRialPerKg) {
      parsed = {
        pluCode: payload.pluCode,
        weightGrams: payload.weightGrams,
        unitPriceRialPerKg: item.unitPriceRialPerKg,
      };
    }
  }

  const defaultPlu = process.env.PILOT_DEFAULT_SALE_PLU?.trim();
  const agent = (input.deviceId ?? input.agentHostname ?? "").trim();
  const weightOnlyPilotDevice = agent === "SIM-DESK" || agent === "FM1";
  if (
    !parsed &&
    defaultPlu &&
    weightOnlyPilotDevice &&
    payload.weightGrams &&
    payload.weightGrams > 0
  ) {
    const item = await prisma.catalogItem.findFirst({
      where: { branchId, pluCode: defaultPlu },
    });
    if (item?.unitPriceRialPerKg) {
      parsed = {
        pluCode: defaultPlu,
        weightGrams: payload.weightGrams,
        unitPriceRialPerKg: item.unitPriceRialPerKg,
      };
    }
  }

  if (!parsed) {
    return markScaleEventFailed(eventId, input, "PARSE_FAILED", {
      barcode: payload.barcode,
      weightGrams: payload.weightGrams,
      pluCode: payload.pluCode,
      defaultPlu: process.env.PILOT_DEFAULT_SALE_PLU?.trim() || null,
    });
  }

  const catalogItem = await prisma.catalogItem.findFirst({
    where: { branchId, pluCode: parsed.pluCode },
  });
  if (!catalogItem) {
    return markScaleEventFailed(eventId, input, "ITEM_NOT_FOUND", {
      pluCode: parsed.pluCode,
    });
  }

  try {
    const sale = await createSaleInvoice(branchId, {
      source: SaleSource.SCALE_SERIAL,
      lines: [
        {
          catalogItemId: catalogItem.id,
          weightGrams: parsed.weightGrams,
          unitPriceRialPerKg: parsed.unitPriceRialPerKg,
        },
      ],
      scaleTicket: {
        rawBarcode: payload.barcode,
        payload: {
          ...input.rawPayload,
          clientEventId: input.clientEventId,
        },
      },
    });

    await prisma.scaleIntegrationEvent.update({
      where: { id: eventId },
      data: { status: ScaleEventStatus.parsed, saleInvoiceId: sale.id },
    });

    console.info("[scale-ingest] sale created", {
      eventId,
      saleId: sale.id,
      pluCode: parsed.pluCode,
      weightGrams: parsed.weightGrams,
      clientEventId: input.clientEventId,
    });
    return { kind: "ok", eventId, saleId: sale.id };
  } catch (err) {
    const code = normalizeScaleProcessError(err);
    return markScaleEventFailed(eventId, input, code, {
      pluCode: parsed.pluCode,
      weightGrams: parsed.weightGrams,
      catalogItemId: catalogItem.id,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function ingestScaleEvent(
  branchId: string,
  input: ScaleEventInput,
): Promise<IngestScaleEventResult> {
  if (input.clientEventId) {
    const existing = await findByClientEventId(branchId, input.clientEventId);
    if (existing) {
      return {
        kind: "duplicate",
        eventId: existing.id,
        saleInvoiceId: existing.saleInvoiceId,
      };
    }
  } else {
    const idempotencyKey = extractBarcodeForIdempotency(input.rawPayload);
    if (idempotencyKey) {
      const existing = await findIdempotentEventByBarcode(branchId, idempotencyKey);
      if (existing) {
        return {
          kind: "duplicate",
          eventId: existing.id,
          saleInvoiceId: existing.saleInvoiceId,
        };
      }
    }
  }

  const deviceLink = await resolveScaleDeviceLink(
    branchId,
    input.deviceId ?? input.agentHostname,
  );

  const event = await prisma.scaleIntegrationEvent.create({
    data: {
      branchId,
      deviceId: deviceLink.deviceId,
      agentHostname: deviceLink.agentHostname ?? input.agentHostname,
      eventType: input.eventType,
      clientEventId: input.clientEventId ?? null,
      rawPayload: input.rawPayload as object,
      status: ScaleEventStatus.pending,
    },
  });

  if (input.eventType === ScaleBusinessEventType.manual) {
    await prisma.scaleIntegrationEvent.update({
      where: { id: event.id },
      data: { status: ScaleEventStatus.parsed },
    });
    return { kind: "stored", eventId: event.id };
  }

  if (
    input.eventType === ScaleBusinessEventType.prep_in ||
    input.eventType === ScaleBusinessEventType.prep_out ||
    input.eventType === ScaleBusinessEventType.waste
  ) {
    await prisma.scaleIntegrationEvent.update({
      where: { id: event.id },
      data: { status: ScaleEventStatus.parsed },
    });
    return { kind: "stored", eventId: event.id };
  }

  return processSale(branchId, event.id, input);
}

export async function countScaleEventsSince(branchId: string, since: Date) {
  return prisma.scaleIntegrationEvent.count({
    where: { branchId, createdAt: { gte: since } },
  });
}
