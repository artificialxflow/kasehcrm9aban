-- CreateTable
CREATE TABLE "CustomerMenuItem" (
    "id" TEXT NOT NULL,
    "concept" "BranchConcept" NOT NULL,
    "name" TEXT NOT NULL,
    "priceRial" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerMenuItem_concept_isActive_sortOrder_idx" ON "CustomerMenuItem"("concept", "isActive", "sortOrder");