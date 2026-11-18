# کاسه CRM — پیگیری اجرا

مرجع: [shariati.md](shariati.md) · [CRM-WEB-HANDOFF-FA.md](CRM-WEB-HANDOFF-FA.md) · [docs/fillet-pilot-flow-fa.md](docs/fillet-pilot-flow-fa.md)

---

## شروع از اینجا

| | |
|--|--|
| **الان** | **۵أ پایلوت فیله (تست بدون ترازو)** — بعد از deploy و `PILOT_DEFAULT_SALE_PLU` |
| **مسدودکننده Bridge** | فاز **۳** — `SCALE_API_KEY` = `scaleApiKey` روی PC |
| **قدم بعدی** | [راهنمای فیله](/pilot/shariati/fillet-guide) → خرید ۱۰ kg خام → فروش ۳۰۰/۸۰۰g → [گزارش روز](/pilot/shariati/report) |
| **روزانه ترازو** | `/pilot/shariati/scale-events` |

---

## فلو اجرا

```
۲ پنل/SIM → ۳ Bridge → ۴ میدان → ۵أ فیله MVP → ۵ب BOM → ۵ج بک‌لاگ
```

1. **فاز ۱** — پلتفرم (تمام)
2. **فاز ۲** — SIM-CRM + PLU پیش‌فرض SIM-DESK
3. **فاز ۳** — Ops کلید API
4. **فاز ۴** — میدان FM1
5. **فاز ۵أ** — فیله تستی ← **پیاده‌سازی جاری**
6. **فاز ۵ب** — BOM / گزارش ماهانه
7. **فاز ۵ج** — سفارش آنلاین، lint، Bridge repo

---

## فاز ۱ — پلتفرم و پایلوت وزنی

- [x] پنل، auth، Prisma، خرید/فروش/catalog، scale-events API، UI رویداد، SIM-CRM، منوی `/app`، مستندات

---

## فاز ۲ — تست پنل و SIM-CRM

- [x] 2.1–2.5 simulate، مشاهده، ingest
- [ ] 2.6 Runflare: `migrate deploy` + `db:seed`
- [ ] 2.7 تست prod: مشاهده + فروش PLU
- [ ] 2.8 Runflare: `PILOT_DEFAULT_SALE_PLU=FILLET01` (با seed catalog)
- [x] 2.9 کد: وزن‑تنها از SIM-DESK/FM1 → PLU پیش‌فرض
- [ ] 2.10 تست: Bridge ارسال ۸۰۰g → `parsed` (بعد فاز ۳)

---

## فاز ۳ — اتصال Bridge (Ops)

- [ ] `SCALE_API_KEY` = `scaleApiKey` — [ops-scale-api-key.md](docs/ops-scale-api-key.md)
- [ ] curl / demo-post / SIM-DESK → 201
- [ ] heartbeat در کنسول

---

## فاز ۴ — میدان FM1

- [ ] COM13، go-live — [field-FM1-checklist.md](docs/field-FM1-checklist.md)

---

## فاز ۵أ — پایلوت فیله (MVP تستی، بدون BOM)

**هدف:** خرید خام → فروش تیکه‌ای شبیه‌سازی → گزارش وزن روز. منبع: [updates/03](updates/03).

- [x] 5أ.1 سند [fillet-pilot-flow-fa.md](docs/fillet-pilot-flow-fa.md)
- [x] 5أ.2 seed: RAW `RAW-FILLET` + WEIGHED `FILLET01`
- [x] 5أ.3 صفحه [fillet-guide](/pilot/shariati/fillet-guide) + لینک در PilotNav
- [x] 5أ.4 `.env.example` → `PILOT_DEFAULT_SALE_PLU`
- [x] 5أ.5 ingest fallback PLU پیش‌فرض
- [x] 5أ.6 راهنمای failed در ScaleEventList
- [ ] 5أ.7 تست دستی: خرید ۱۰kg → ۳ فروش → گزارش روز
- [ ] 5أ.8 تیک 2.7 / 2.10 پس از تست production

---

## فاز ۵ب — BOM و گزارش ماهانه (بعداً)

- [ ] فرمول آرد/روغن/مرینت per kg — داده از تلگرام
- [ ] مدل Recipe + UI `prep_in` / `prep_out`
- [ ] گزارش مصرف نظری vs واقعی

---

## فاز ۵ج — بک‌لاگ

- [ ] سفارش آنلاین (`Customer` / `Order`)
- [ ] KasehScaleBridge عملیاتی (repo جدا)
- [ ] آپلود لاگ میدان، lint

---

## پیوست — تاریخچه فازهای ۰–۵۱

جزئیات در git history.

**آخرین هم‌ترازی:** ۱۴۰۴/۰۸ — فیله MVP 5أ