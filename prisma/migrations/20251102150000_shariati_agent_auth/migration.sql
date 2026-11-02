-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('owner', 'branchManager', 'cashier', 'chef');

-- CreateTable
CREATE TABLE "ScaleAgentHeartbeat" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "ScaleAgentHeartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleAgentLogUpload" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lines" JSONB NOT NULL,

    CONSTRAINT "ScaleAgentLogUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'branchManager',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScaleAgentHeartbeat_branchId_hostname_key" ON "ScaleAgentHeartbeat"("branchId", "hostname");

-- CreateIndex
CREATE INDEX "ScaleAgentHeartbeat_branchId_lastSeenAt_idx" ON "ScaleAgentHeartbeat"("branchId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "ScaleAgentLogUpload_branchId_receivedAt_idx" ON "ScaleAgentLogUpload"("branchId", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_username_key" ON "StaffUser"("username");

-- AddForeignKey
ALTER TABLE "ScaleAgentHeartbeat" ADD CONSTRAINT "ScaleAgentHeartbeat_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleAgentLogUpload" ADD CONSTRAINT "ScaleAgentLogUpload_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
