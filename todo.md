# کاسه CRM — پیگیری اجرا

مرجع: [shariati.md](shariati.md) · [CRM-WEB-HANDOFF-FA.md](CRM-WEB-HANDOFF-FA.md) · [docs/fillet-pilot-flow-fa.md](docs/fillet-pilot-flow-fa.md) · [docs/fillet-pilot-checklist-fa.md](docs/fillet-pilot-checklist-fa.md)

---

## شروع از اینجا

| | |
|--|--|
| **الان** | **فاز ۰** (دیپلوی موفق روی Runflare) سپس **فاز ۱** (env + seed) |
| **مسدودکننده** | بدون دیپلوی جدید + `PILOT_DEFAULT_SALE_PLU` روی سرور، فروش وزن‌تنها از میز آزمایشی دفتر **ناموفق** می‌ماند |
| **قدم بعدی** | [راهنمای فیله](/pilot/shariati/fillet-guide) → پاکسازی شعبه ۲ (اختیاری) → خرید ۱۰ کیلو خام → فروش ۳۰۰/۵۰۰/۸۰۰ گرم → [گزارش روز](/pilot/shariati/report) |
| **روزانه ترازو** | [رویداد ترازو](/pilot/shariati/scale-events) |

---

## فلو اجرا

```
۰ پرود → ۱ env/DB → ۲أ پاکسازی شعبه۲ → ۲ پنل/SIM → ۳ پل ترازو → ۴ میدان → ۵أ فیله → ۵ب بچ/گزارش → ۵ج بک‌لاگ
```

---

## فاز ۰ — دیپلوی و هم‌ترازی پرود

- [ ] 0.1 Runflare: `runflare update` در صورت نیاز + دیپلوی کامل (بدون قطع آپلود)
- [ ] 0.2 پرود: UI فارسی در رویداد ترازو («جستجوی بارکد»، «کد فروش»)
- [ ] 0.3 لوکال (اختیاری): `npm run build` روی commit دیپلوی‌شده

---

## فاز ۱ — env و دیتابیس (پرود)

- [ ] 1.1 Runflare: `SCALE_API_KEY` تنظیم شده
- [ ] 1.2 Runflare: `PILOT_DEFAULT_SALE_PLU=FILLET01` + ری‌استارت/دیپلوی بعد از Save
- [ ] 1.3 کنسول پرود: `npx prisma migrate deploy`
- [ ] 1.4 کنسول پرود: `npm run db:seed` — `RAW-FILLET` + `FILLET01` با فی

---

## فاز ۲أ — پاکسازی دمو شعبه شریعتی (legacyId ۲)

- [x] 2أ.1 `npm run db:reset-pilot` — تراکنش و موجودی
- [x] 2أ.1ب `npm run db:reset-pilot:full` — + کاتالوگ و دستگاه ترازو (شروع دستی؛ **بدون seed**)
- [x] 2أ.4 seed: موجودی اولیه دمو (`POT001`) = ۰
- [ ] 2أ.3 پرود: شروع دستی → `db:reset-pilot:full` (seed نزنید)

---

## فاز ۱ (پلتفرم — تمام)

- [x] پنل، auth، Prisma، خرید/فروش/catalog، scale-events API، UI رویداد، میز آزمایشی CRM، منوی `/app`

---

## فاز ۲ — تست پنل و میز آزمایشی

- [x] 2.1–2.5 شبیه‌سازی، مشاهده، ingest
- [x] 2.9 کد: وزن‌تنها از میز آزمایشی دفتر → کد فروش پیش‌فرض
- [ ] 2.7 تست prod: مشاهده + فروش با کد فروش از پنل
- [ ] 2.10 تست prod: پل میز آزمایشی دفتر وزن‌تنها → موفق (نیاز فاز ۱.۲)

---

## فاز ۳ — اتصال پل ترازو (Ops)

- [ ] 3.1 کلید درگاه سرور = کلید در برنامهٔ پل — [ops-scale-api-key.md](docs/ops-scale-api-key.md)
- [ ] 3.2 تست دمو → ۲۰۱؛ سه فروش شبیه‌سازی از میز آزمایشی دفتر
- [ ] 3.3 سیگنال زنده در کنسول رویداد ترازو

---

## فاز ۴ — میدان FM1

- [ ] COM13، راه‌اندازی — [field-FM1-checklist.md](docs/field-FM1-checklist.md)

---

## فاز ۵أ — پایلوت فیله (MVP تستی)

**کد/مستند:**

- [x] 5أ.1 [fillet-pilot-flow-fa.md](docs/fillet-pilot-flow-fa.md)
- [x] 5أ.2 seed فیله
- [x] 5أ.3 [fillet-guide](/pilot/shariati/fillet-guide)
- [x] 5أ.4–5أ.6 env، ingest، راهنمای ناموفق، UI فارسی
- [x] 5أ.چک [fillet-pilot-checklist-fa.md](docs/fillet-pilot-checklist-fa.md)

**پذیرش (ops):**

- [ ] 5أ.7 خرید **۱۰ کیلوگرم** خام `RAW-FILLET`
- [ ] 5أ.7ب سه فروش: **۳۰۰ + ۵۰۰ + ۸۰۰** گرم `FILLET01` (پنل یا پل)
- [ ] 5أ.7ج گزارش روز: خروج فروش ≈ **۱۶۰۰ گرم**؛ موجودی فیله فروش کم شده
- [ ] 5أ.8 تیک 2.7 + 2.10

**پلن ب:** اگر پل گیر کرد → همان وزن‌ها از میز آزمایشی پنل با کد `FILLET01`.

---

## فاز ۶ — مستندات اپراتور (فارسی)

- [x] 6.1 [operator-scale-day-fa.md](docs/operator-scale-day-fa.md)
- [x] 6.2 [field-FM1-checklist.md](docs/field-FM1-checklist.md)
- [x] 6.3 [runflare-deploy.md](docs/runflare-deploy.md)
- [x] 6.4 [fillet-pilot-checklist-fa.md](docs/fillet-pilot-checklist-fa.md)

---

## فاز ۵ب — بچ خرید و گزارش فیله (MVP)

### ۵ب.۰ اسکیما

- [x] 5ب.0.1 مدل‌های PurchaseYieldRule, PurchaseBatch, SaleLineBatchAllocation + migrate
- [x] 5ب.0.2 seed yield ۹۰٪ RAW-FILLET → FILLET01
- [x] 5ب.0.3 reset-pilot + `npm run db:backfill-batches`

### ۵ب.۱ بک‌اند

- [x] 5ب.1.1 createBatch در خرید + purchasedAt API
- [x] 5ب.1.2 FIFO در createSaleInvoice
- [x] 5ب.1.3 getPurchaseBatchReport + لاگ‌ها

### ۵ب.۲ API

- [x] 5ب.2.1 GET report/batches
- [x] 5ب.2.2 POST purchases با purchasedAt

### ۵ب.۳ فرانت

- [x] 5ب.3.1 تقویم خرید در PurchaseForm
- [x] 5ب.3.2 PurchaseBatchReport در صفحه گزارش
- [x] 5ب.3.3 PilotNav / راهنما

### ۵ب.۴ پذیرش ops

- [ ] 5ب.4.1 migrate deploy پرود
- [ ] 5ب.4.2 خرید ۱۰ کیلو با تاریخ مشخص → پیش‌بینی ۹۰۰۰ گرم
- [ ] 5ب.4.3 سه فروش → allocated روی یک بچ (یا FIFO اگر دو خرید)
- [ ] 5ب.4.4 گزارش: جمع خرید / پیش‌بینی / واقعی

### ۵ب.۵ BOM کامل (بعداً — خارج از MVP)

- [ ] فرمول مصرف per kg از تلگرام، Recipe، پخت، گزارش ماهانه مواد

---

## فاز ۵ج — بک‌لاگ

- [ ] سفارش آنلاین، repo پل ترازو، آپلود لاگ میدان، lint

---

## پیوست

جزئیات تاریخی در git history.

**آخرین هم‌ترازی:** ۱۴۰۴/۰۸ — فاز ۵ب بچ خرید/FIFO + گزارش یکپارچه (کد)؛ پذیرش ops در 5ب.4