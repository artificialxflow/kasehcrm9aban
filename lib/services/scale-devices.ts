import { ScaleConnection } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listScaleDevices(branchId: string, includeInactive = false) {
  return prisma.scaleDevice.findMany({
    where: {
      branchId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: { label: "asc" },
  });
}

export async function createScaleDevice(
  branchId: string,
  input: { label: string; model?: string; connection?: ScaleConnection },
) {
  const label = input.label?.trim();
  if (!label) throw new Error("LABEL_REQUIRED");

  const dup = await prisma.scaleDevice.findFirst({
    where: { branchId, label, isActive: true },
  });
  if (dup) throw new Error("LABEL_DUPLICATE");

  return prisma.scaleDevice.create({
    data: {
      branchId,
      label,
      model: input.model?.trim() || "RADIN",
      connection: input.connection ?? ScaleConnection.RS232,
    },
  });
}

export async function updateScaleDevice(
  branchId: string,
  deviceId: string,
  input: { label?: string; model?: string; connection?: ScaleConnection; isActive?: boolean },
) {
  const existing = await prisma.scaleDevice.findFirst({
    where: { id: deviceId, branchId },
  });
  if (!existing) throw new Error("NOT_FOUND");

  if (input.label !== undefined) {
    const label = input.label.trim();
    if (!label) throw new Error("LABEL_REQUIRED");
    const dup = await prisma.scaleDevice.findFirst({
      where: { branchId, label, isActive: true, NOT: { id: deviceId } },
    });
    if (dup) throw new Error("LABEL_DUPLICATE");
  }

  return prisma.scaleDevice.update({
    where: { id: deviceId },
    data: {
      ...(input.label !== undefined ? { label: input.label.trim() } : {}),
      ...(input.model !== undefined ? { model: input.model.trim() || "RADIN" } : {}),
      ...(input.connection !== undefined ? { connection: input.connection } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
}
