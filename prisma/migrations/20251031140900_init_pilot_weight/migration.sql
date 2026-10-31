-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BranchConcept" AS ENUM ('fried', 'burger', 'ash', 'cafe');

-- CreateEnum
CREATE TYPE "CatalogItemType" AS ENUM ('RAW', 'WEIGHED_SALE', 'PIECE');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE_IN', 'SALE_OUT', 'WASTE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "SaleSource" AS ENUM ('MANUAL', 'SCALE_RECEIPT', 'SCALE_SERIAL');

-- CreateEnum
CREATE TYPE "ScaleConnection" AS ENUM ('USB', 'RS232', 'PS2', 'BARCODE_ONLY');

-- CreateEnum
CREATE TYPE "ScaleEventStatus" AS ENUM ('pending', 'parsed', 'failed');

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "legacyId" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "concept" "BranchConcept" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "isPilot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "pluCode" TEXT,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "type" "CatalogItemType" NOT NULL,
    "unitPriceRialPerKg" BIGINT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchStock" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "quantityGrams" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BranchStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantityGrams" INTEGER NOT NULL,
    "referenceKind" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseInvoice" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "invoiceNo" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplierName" TEXT,
    "totalRial" BIGINT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLine" (
    "id" TEXT NOT NULL,
    "purchaseInvoiceId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "weightGrams" INTEGER NOT NULL,
    "unitPriceRialPerKg" BIGINT NOT NULL,
    "lineTotalRial" BIGINT NOT NULL,

    CONSTRAINT "PurchaseLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleInvoice" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "SaleSource" NOT NULL DEFAULT 'SCALE_RECEIPT',
    "scaleInvoiceNo" TEXT,
    "scaleLabel" TEXT,
    "boothLabel" TEXT,
    "totalRial" BIGINT NOT NULL,
    "reprint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleLine" (
    "id" TEXT NOT NULL,
    "saleInvoiceId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "weightGrams" INTEGER NOT NULL,
    "unitPriceRialPerKg" BIGINT NOT NULL,
    "lineTotalRial" BIGINT NOT NULL,

    CONSTRAINT "SaleLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleTicket" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "saleInvoiceId" TEXT,
    "rawBarcode" TEXT,
    "parsedWeightGrams" INTEGER,
    "parsedUnitPriceRial" BIGINT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScaleTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleDevice" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'RADIN',
    "connection" "ScaleConnection" NOT NULL DEFAULT 'BARCODE_ONLY',
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScaleDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleIntegrationEvent" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "deviceId" TEXT,
    "rawPayload" JSONB NOT NULL,
    "status" "ScaleEventStatus" NOT NULL DEFAULT 'pending',
    "saleInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScaleIntegrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_legacyId_key" ON "Branch"("legacyId");

-- CreateIndex
CREATE INDEX "CatalogItem_branchId_pluCode_idx" ON "CatalogItem"("branchId", "pluCode");

-- CreateIndex
CREATE UNIQUE INDEX "BranchStock_branchId_catalogItemId_key" ON "BranchStock"("branchId", "catalogItemId");

-- CreateIndex
CREATE INDEX "StockMovement_branchId_createdAt_idx" ON "StockMovement"("branchId", "createdAt");

-- AddForeignKey
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStock" ADD CONSTRAINT "BranchStock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStock" ADD CONSTRAINT "BranchStock_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInvoice" ADD CONSTRAINT "PurchaseInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_purchaseInvoiceId_fkey" FOREIGN KEY ("purchaseInvoiceId") REFERENCES "PurchaseInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleInvoice" ADD CONSTRAINT "SaleInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleLine" ADD CONSTRAINT "SaleLine_saleInvoiceId_fkey" FOREIGN KEY ("saleInvoiceId") REFERENCES "SaleInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleLine" ADD CONSTRAINT "SaleLine_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleTicket" ADD CONSTRAINT "ScaleTicket_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleTicket" ADD CONSTRAINT "ScaleTicket_saleInvoiceId_fkey" FOREIGN KEY ("saleInvoiceId") REFERENCES "SaleInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleDevice" ADD CONSTRAINT "ScaleDevice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleIntegrationEvent" ADD CONSTRAINT "ScaleIntegrationEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleIntegrationEvent" ADD CONSTRAINT "ScaleIntegrationEvent_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ScaleDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
