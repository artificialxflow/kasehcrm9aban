import { SaleSource, ScaleEventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseScaleBarcode } from "@/lib/scale/parse-barcode";
import { createSaleInvoice } from "@/lib/services/sales";

export async function ingestScaleEvent(
  branchId: string,
  input: { deviceId?: string; rawPayload: object },
) {
  const event = await prisma.scaleIntegrationEvent.create({
    data: {
      branchId,
      deviceId: input.deviceId,
      rawPayload: input.rawPayload as object,
      status: ScaleEventStatus.pending,
    },
  });

  try {
    const payload = input.rawPayload as { barcode?: string; pluCode?: string; weightGrams?: number };
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
      return { event, sale: null, error: "PARSE_FAILED" as const };
    }

    const catalogItem = await prisma.catalogItem.findFirst({
      where: { branchId, pluCode: parsed.pluCode },
    });
    if (!catalogItem) {
      await prisma.scaleIntegrationEvent.update({
        where: { id: event.id },
        data: { status: ScaleEventStatus.failed },
      });
      return { event, sale: null, error: "ITEM_NOT_FOUND" as const };
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

    return { event, sale, error: null };
  } catch {
    await prisma.scaleIntegrationEvent.update({
      where: { id: event.id },
      data: { status: ScaleEventStatus.failed },
    });
    return { event, sale: null, error: "PROCESS_FAILED" as const };
  }
}
