import { prisma } from "@/lib/prisma";

export type HeartbeatBody = {
  agentVersion?: string;
  hostname: string;
  comPort?: string;
  baudRate?: number;
  mode?: string;
  lastSerialDataAt?: string;
  livePostEnabled?: boolean;
};

export async function upsertScaleAgentHeartbeat(branchId: string, body: HeartbeatBody) {
  const hostname = body.hostname?.trim();
  if (!hostname) throw new Error("HOSTNAME_REQUIRED");

  return prisma.scaleAgentHeartbeat.upsert({
    where: { branchId_hostname: { branchId, hostname } },
    create: {
      branchId,
      hostname,
      payload: body as object,
      lastSeenAt: new Date(),
    },
    update: {
      payload: body as object,
      lastSeenAt: new Date(),
    },
  });
}

export async function storeScaleAgentLogs(branchId: string, lines: unknown[]) {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("LINES_REQUIRED");
  }
  return prisma.scaleAgentLogUpload.create({
    data: { branchId, lines: lines as object },
  });
}

export async function getScaleAgentStatus(branchId: string, hostname?: string) {
  if (hostname) {
    return prisma.scaleAgentHeartbeat.findUnique({
      where: { branchId_hostname: { branchId, hostname } },
    });
  }
  return prisma.scaleAgentHeartbeat.findFirst({
    where: { branchId },
    orderBy: { lastSeenAt: "desc" },
  });
}

export async function listScaleAgentHeartbeats(branchId: string) {
  return prisma.scaleAgentHeartbeat.findMany({
    where: { branchId },
    orderBy: { lastSeenAt: "desc" },
  });
}
