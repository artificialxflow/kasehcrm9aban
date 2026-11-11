import { prisma } from "@/lib/prisma";

const CUID_LIKE = /^c[a-z0-9]{20,}$/i;

/** Map bridge `deviceId` (hostname or ScaleDevice cuid) to DB fields. */
export async function resolveScaleDeviceLink(
  branchId: string,
  deviceId: string | undefined,
): Promise<{ deviceId: string | null; agentHostname: string | null }> {
  if (!deviceId?.trim()) {
    return { deviceId: null, agentHostname: null };
  }
  const value = deviceId.trim();
  if (CUID_LIKE.test(value)) {
    const found = await prisma.scaleDevice.findFirst({
      where: { id: value, branchId },
      select: { id: true, label: true },
    });
    if (found) {
      return { deviceId: found.id, agentHostname: found.label };
    }
  }
  return { deviceId: null, agentHostname: value };
}
