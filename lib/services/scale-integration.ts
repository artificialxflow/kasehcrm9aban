import { SaleSource, ScaleEventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseScaleBarcode } from "@/lib/scale/parse-barcode";
import { createSaleInvoice } from "@/lib/services/sales";
import {
  extractBarcodeForIdempotency,
  type ScaleEventInput,
} from "@/lib/scale-event-validate";

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
      kind: "error";
      eventId: string;
      code: "PARSE_FAILED" | "ITEM_NOT_FOUND" | "PROCESS_FAILED";
    };

async function findIdempotentEvent(branchId: string, idempotencyKey: string) {
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

export async function ingestScaleEvent(
  branchId: string,
  input: ScaleEventInput,
): Promise<IngestScaleEventResult> {
  const idempotencyKey = extractBarcodeForIdempotency(input.rawPayload);
  if (idempotencyKey) {
    const existing = await findIdempotentEvent(branchId, idempotencyKey);
    if (existing) {
      return {
        kind: "duplicate",
        eventId: existing.id,
        saleInvoiceId: existing.saleInvoiceId,
      };
    }
  }

  const event = await prisma.scaleIntegrationEvent.create({
    data: {
      branchId,
      deviceId: input.deviceId,
      rawPayload: input.rawPayload as object,
      status: ScaleEventStatus.pending,
    },
  });

  try {
    const payload = input.rawPayload;
    let parsed = payload.barcode ? parseScaleBarcode(payload.barcode) : null;

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

    if (!parsed) {
      await prisma.scaleIntegrationEvent.update({
        where: { id: event.id },
        data: { status: ScaleEventStatus.failed },
      });
      return { kind: "error", eventId: event.id, code: "PARSE_FAILED" };
    }

    const catalogItem = await prisma.catalogItem.findFirst({
      where: { branchId, pluCode: parsed.pluCode },
    });
    if (!catalogItem) {
      await prisma.scaleIntegrationEvent.update({
        where: { id: event.id },
        data: { status: ScaleEventStatus.failed },
      });
      return { kind: "error", eventId: event.id, code: "ITEM_NOT_FOUND" };
    }

    const sale = await createSaleInvoice(branchId, {
      source: SaleSource.SCALE_SERIAL,
      lines: [
        {
          catalogItemId: catalogItem.id,
          weightGrams: parsed.weightGrams,
          unitPriceRialPerKg: parsed.unitPriceRialPerKg,
        },
      ],
      scaleTicket: { rawBarcode: payload.barcode, payload: input.rawPayload },
    });

    await prisma.scaleIntegrationEvent.update({
      where: { id: event.id },
      data: { status: ScaleEventStatus.parsed, saleInvoiceId: sale.id },
    });

    return { kind: "ok", eventId: event.id, saleId: sale.id };
  } catch {
    await prisma.scaleIntegrationEvent.update({
      where: { id: event.id },
      data: { status: ScaleEventStatus.failed },
    });
    return { kind: "error", eventId: event.id, code: "PROCESS_FAILED" };
  }
}
