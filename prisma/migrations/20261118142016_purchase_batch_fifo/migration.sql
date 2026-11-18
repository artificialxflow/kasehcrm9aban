-- CreateTable
CREATE TABLE "PurchaseYieldRule" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "rawCatalogItemId" TEXT NOT NULL,
    "saleCatalogItemId" TEXT NOT NULL,
    "yieldBps" INTEGER NOT NULL,

    CONSTRAINT "PurchaseYieldRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseBatch" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "purchaseLineId" TEXT NOT NULL,
    "rawCatalogItemId" TEXT NOT NULL,
    "saleCatalogItemId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "rawGrams" INTEGER NOT NULL,
    "expectedSellableGrams" INTEGER NOT NULL,
    "allocatedSoldGrams" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleLineBatchAllocation" (
    "id" TEXT NOT NULL,
    "saleLineId" TEXT NOT NULL,
    "purchaseBatchId" TEXT NOT NULL,
    "gramsAllocated" INTEGER NOT NULL,

    CONSTRAINT "SaleLineBatchAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseYieldRule_branchId_rawCatalogItemId_key" ON "PurchaseYieldRule"("branchId", "rawCatalogItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseBatch_purchaseLineId_key" ON "PurchaseBatch"("purchaseLineId");

-- CreateIndex
CREATE INDEX "PurchaseBatch_branchId_purchasedAt_idx" ON "PurchaseBatch"("branchId", "purchasedAt");

-- CreateIndex
CREATE INDEX "SaleLineBatchAllocation_purchaseBatchId_idx" ON "SaleLineBatchAllocation"("purchaseBatchId");

-- CreateIndex
CREATE INDEX "SaleLineBatchAllocation_saleLineId_idx" ON "SaleLineBatchAllocation"("saleLineId");

-- AddForeignKey
ALTER TABLE "PurchaseYieldRule" ADD CONSTRAINT "PurchaseYieldRule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseYieldRule" ADD CONSTRAINT "PurchaseYieldRule_rawCatalogItemId_fkey" FOREIGN KEY ("rawCatalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseYieldRule" ADD CONSTRAINT "PurchaseYieldRule_saleCatalogItemId_fkey" FOREIGN KEY ("saleCatalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBatch" ADD CONSTRAINT "PurchaseBatch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBatch" ADD CONSTRAINT "PurchaseBatch_purchaseLineId_fkey" FOREIGN KEY ("purchaseLineId") REFERENCES "PurchaseLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBatch" ADD CONSTRAINT "PurchaseBatch_rawCatalogItemId_fkey" FOREIGN KEY ("rawCatalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBatch" ADD CONSTRAINT "PurchaseBatch_saleCatalogItemId_fkey" FOREIGN KEY ("saleCatalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleLineBatchAllocation" ADD CONSTRAINT "SaleLineBatchAllocation_saleLineId_fkey" FOREIGN KEY ("saleLineId") REFERENCES "SaleLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleLineBatchAllocation" ADD CONSTRAINT "SaleLineBatchAllocation_purchaseBatchId_fkey" FOREIGN KEY ("purchaseBatchId") REFERENCES "PurchaseBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
