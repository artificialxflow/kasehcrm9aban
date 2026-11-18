import { PrismaClient, BranchConcept, CatalogItemType, ScaleConnection, StaffRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BRANCHES: {
  legacyId: string;
  name: string;
  city: string;
  concept: BranchConcept;
  isOpen: boolean;
  isPilot: boolean;
}[] = [
  { legacyId: "1", name: "سوخاری آمل", city: "آمل", concept: "fried", isOpen: true, isPilot: false },
  {
    legacyId: "2",
    name: "سوخاری بابل (شریعتی)",
    city: "بابل",
    concept: "fried",
    isOpen: true,
    isPilot: true,
  },
  {
    legacyId: "3",
    name: "سوخاری بابلسر (الکینی)",
    city: "بابلسر",
    concept: "fried",
    isOpen: false,
    isPilot: false,
  },
  {
    legacyId: "4",
    name: "سوخاری طالقانی بابلسر",
    city: "بابلسر",
    concept: "fried",
    isOpen: true,
    isPilot: false,
  },
  { legacyId: "5", name: "مکیان برگر آمل", city: "آمل", concept: "burger", isOpen: true, isPilot: false },
  { legacyId: "6", name: "آش و حلیم بابلسر", city: "بابلسر", concept: "ash", isOpen: true, isPilot: false },
  { legacyId: "7", name: "کافه‌رستوران کاسه", city: "آمل", concept: "cafe", isOpen: false, isPilot: false },
];

async function main() {
  for (const b of BRANCHES) {
    await prisma.branch.upsert({
      where: { legacyId: b.legacyId },
      create: b,
      update: {
        name: b.name,
        city: b.city,
        concept: b.concept,
        isOpen: b.isOpen,
        isPilot: b.isPilot,
      },
    });
  }

  const pilot = await prisma.branch.findFirst({ where: { legacyId: "2" } });
  if (!pilot) throw new Error("Pilot branch not found");

  const catalogDefs = [
    {
      name: "سیب‌زمینی",
      type: CatalogItemType.WEIGHED_SALE,
      pluCode: "POT001",
      unitPriceRialPerKg: BigInt(1_289_000),
      branchId: pilot.id,
    },
    {
      name: "سوخاری کیلویی (نمونه RADIN)",
      type: CatalogItemType.WEIGHED_SALE,
      pluCode: "1001",
      barcode: "626564512",
      unitPriceRialPerKg: BigInt(420_000),
      branchId: pilot.id,
    },
    {
      name: "مرغ خام",
      type: CatalogItemType.RAW,
      pluCode: "RAW-CHICKEN",
      branchId: pilot.id,
    },
    {
      name: "روغن پخت",
      type: CatalogItemType.RAW,
      pluCode: "RAW-OIL",
      branchId: pilot.id,
    },
    {
      name: "آرد سوخاری",
      type: CatalogItemType.RAW,
      pluCode: "RAW-FLOUR",
      branchId: pilot.id,
    },
    {
      name: "فیله مرغ خام",
      type: CatalogItemType.RAW,
      pluCode: "RAW-FILLET",
      branchId: pilot.id,
    },
    {
      name: "فیله سوخاری",
      type: CatalogItemType.WEIGHED_SALE,
      pluCode: "FILLET01",
      unitPriceRialPerKg: BigInt(480_000),
      branchId: pilot.id,
    },
  ];

  for (const item of catalogDefs) {
    const existing = await prisma.catalogItem.findFirst({
      where: { branchId: item.branchId, pluCode: item.pluCode },
    });
    if (existing) {
      await prisma.catalogItem.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          type: item.type,
          unitPriceRialPerKg: item.unitPriceRialPerKg ?? null,
          barcode: "barcode" in item ? item.barcode : undefined,
        },
      });
    } else {
      await prisma.catalogItem.create({ data: item });
    }
  }

  const rawFillet = await prisma.catalogItem.findFirst({
    where: { branchId: pilot.id, pluCode: "RAW-FILLET" },
  });
  const saleFillet = await prisma.catalogItem.findFirst({
    where: { branchId: pilot.id, pluCode: "FILLET01" },
  });
  if (rawFillet && saleFillet) {
    await prisma.purchaseYieldRule.upsert({
      where: {
        branchId_rawCatalogItemId: {
          branchId: pilot.id,
          rawCatalogItemId: rawFillet.id,
        },
      },
      create: {
        branchId: pilot.id,
        rawCatalogItemId: rawFillet.id,
        saleCatalogItemId: saleFillet.id,
        yieldBps: 9000,
      },
      update: {
        saleCatalogItemId: saleFillet.id,
        yieldBps: 9000,
      },
    });
  }

  const items = await prisma.catalogItem.findMany({ where: { branchId: pilot.id } });
  for (const item of items) {
    const initialGrams = 0;
    await prisma.branchStock.upsert({
      where: {
        branchId_catalogItemId: { branchId: pilot.id, catalogItemId: item.id },
      },
      create: { branchId: pilot.id, catalogItemId: item.id, quantityGrams: initialGrams },
      update: {},
    });
  }

  for (const def of [
    { label: "ترازو ۱", connection: ScaleConnection.BARCODE_ONLY },
    { label: "FM1", connection: ScaleConnection.RS232 },
  ]) {
    const device = await prisma.scaleDevice.findFirst({
      where: { branchId: pilot.id, label: def.label },
    });
    if (!device) {
      await prisma.scaleDevice.create({
        data: {
          branchId: pilot.id,
          model: "RADIN",
          connection: def.connection,
          label: def.label,
        },
      });
    }
  }

  const customerMenu: {
    concept: BranchConcept;
    name: string;
    priceRial: number;
    sortOrder: number;
  }[] = [
    { concept: "fried", name: "بال سوخاری اسپایسی", priceRial: 120_000, sortOrder: 1 },
    { concept: "fried", name: "فیله سوخاری", priceRial: 180_000, sortOrder: 2 },
    { concept: "burger", name: "مکیان برگر دوبل", priceRial: 150_000, sortOrder: 1 },
    { concept: "burger", name: "سیب‌زمینی مخصوص", priceRial: 45_000, sortOrder: 2 },
    { concept: "ash", name: "آش رشته مخصوص", priceRial: 95_000, sortOrder: 1 },
    { concept: "ash", name: "حلیم گندم", priceRial: 85_000, sortOrder: 2 },
    { concept: "cafe", name: "لاته کاراملی", priceRial: 75_000, sortOrder: 1 },
  ];

  for (const row of customerMenu) {
    const existing = await prisma.customerMenuItem.findFirst({
      where: { concept: row.concept, name: row.name },
    });
    if (!existing) {
      await prisma.customerMenuItem.create({ data: row });
    } else {
      await prisma.customerMenuItem.update({
        where: { id: existing.id },
        data: { priceRial: row.priceRial, sortOrder: row.sortOrder, isActive: true },
      });
    }
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim() || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.staffUser.upsert({
    where: { username: "admin" },
    create: {
      username: "admin",
      passwordHash,
      role: StaffRole.owner,
    },
    update: {
      passwordHash,
      role: StaffRole.owner,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
