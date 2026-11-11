-- CreateEnum
CREATE TYPE "ScaleBusinessEventType" AS ENUM ('sale', 'manual', 'prep_in', 'prep_out', 'waste');

-- AlterTable
ALTER TABLE "ScaleIntegrationEvent" ADD COLUMN "agentHostname" TEXT,
ADD COLUMN "eventType" "ScaleBusinessEventType" NOT NULL DEFAULT 'sale',
ADD COLUMN "clientEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ScaleIntegrationEvent_branchId_clientEventId_key" ON "ScaleIntegrationEvent"("branchId", "clientEventId");

-- CreateIndex
CREATE INDEX "ScaleIntegrationEvent_branchId_createdAt_idx" ON "ScaleIntegrationEvent"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "ScaleIntegrationEvent_branchId_eventType_idx" ON "ScaleIntegrationEvent"("branchId", "eventType");
