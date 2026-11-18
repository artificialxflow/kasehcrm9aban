# کاسه CRM — پیگیری اجرا

مرجع فنی: [shariati.md](shariati.md) · [CRM-WEB-HANDOFF-FA.md](CRM-WEB-HANDOFF-FA.md) · [docs/field-FM1-checklist.md](docs/field-FM1-checklist.md)

---

## شروع از اینجا

| | |
|--|--|
| **مسدودکنندهٔ کد (قبل از میدان)** | SIM-CRM: رفع `parse_failed` و حالت «مشاهده وزن» — **فاز ۲** |
| **مسدودکنندهٔ ops** | هم‌ترازی `SCALE_API_KEY` / `scaleApiKey` — **فاز ۳** |
| **قدم بعدی شما** | پنل → [رویداد ترازو](/pilot/shariati/scale-events) → SIM-CRM «مشاهده» ۲۲۵g → ردیف در لیست |
| **صفحهٔ روزانه** | `/pilot/shariati/scale-events` |

---

## فلو اجرا (به ترتیب)

1. **فاز ۱** — پلتفرم و پایلوت وزنی (تمام شده؛ فقط regression)
2. **فاز ۲** — تست پنل و SIM-CRM ← **الان**
3. **فاز ۳** — Bridge، کلید API، demo-post
4. **فاز ۴** — میدان FM1 (COM13، go-live)
5. **فاز ۵** — BOM فیله، سفارش آنلاین، Bridge repo

```
فاز ۲ (کد+DB) → فاز ۳ (Ops) → فاز ۴ (مغازه) → فاز ۵ (محصول)
```

---

## فاز ۱ — پلتفرم و پایلوت وزنی

**هدف:** CRM شعبه ۲ برای انبار، فروش وزنی، و API ترازو آماده است.

- [x] Next.js RTL، پنل مدیریت، auth، Prisma و migrations پایلوت
- [x] خرید/فروش وزنی، catalog، گزارش، scale-events API (POST/GET)، idempotency
- [x] UI: لیست رویداد، manual، کنسول، مانیتور agent، آپلود لاگ پنل
- [x] SIM-CRM: `POST .../scale-events/simulate` + `ScaleSimulateForm`
- [x] منوی مشتری `/app` از DB (`CustomerMenuItem` + `GET /api/app/menu`)
- [x] مستندات HANDOFF، shariati، operator-scale-day

---

## فاز ۲ — تست پنل و SIM-CRM (اولویت کد)

**هدف:** یک کلیک → ردیف در لیست؛ حالت «مشاهده» بدون فاکتور؛ «فروش» با PLU → `parsed` + `saleId`.

- [x] 2.1 Endpoint simulate + UI
- [x] 2.2 رفع `PARSE_FAILED` با PLU (فی از catalog در بارکد pipe؛ ingest fallback)
- [x] 2.3 حالت «مشاهده» (`observe`) — `manual`، فقط وزن در لیست
- [x] 2.4 توضیح UI: مشاهده vs فروش
- [x] 2.5 بهبود ingest برای بارکد pipe با price=0
- [ ] 2.6 Runflare: `npx prisma migrate deploy` + `db:seed` (migration `20251118100000_customer_menu`، PLU `1001`)
- [ ] 2.7 تست روی production: 225g مشاهده → لیست؛ 225g + PLU 1001 فروش → `parsed`

---

## فاز ۳ — اتصال Bridge و امنیت (Ops)

**هدف:** بدون 401؛ heartbeat در کنسول.

- [ ] تولید و ست `SCALE_API_KEY` = `scaleApiKey` — [docs/ops-scale-api-key.md](docs/ops-scale-api-key.md)
- [ ] curl preflight → 201
- [ ] `KasehScaleBridge.exe --demo-post` و SIM-DESK از GUI → 201
- [ ] heartbeat FM1 در `ScaleOpsBanner`

---

## فاز ۴ — میدان FM1

**هدف:** وزن زنده؛ فقط رویداد تأییدشده به CRM. چک‌لیست کامل: [field-FM1-checklist.md](docs/field-FM1-checklist.md)

- [ ] 4.1 COM13 @ 19200، listen-only، `serial_data` در لاگ
- [ ] 4.2 `livePostEnabled: false` اول؛ دکمه «ثبت فروش» Bridge
- [ ] 4.3 یک فروش واقعی → فاکتور CRM
- [ ] 4.4 قطع اینترنت (صف) و manual از پنل
- [ ] 4.5 تیک نهایی field-FM1-checklist

---

## فاز ۵ — محصول و بک‌لاگ (بعد از میدان)

- [ ] فرمول مواد / فیله / گزارش ماهانه — [updates/03/01.txt](updates/03/01.txt)
- [ ] سفارش آنلاین واقعی (`Customer` / `Order` در Prisma)
- [ ] KasehScaleBridge عملیاتی (repo جدا): queue، stable weight، FM1
- [ ] تست آپلود JSONL لاگ در میدان (UI آماده)
- [ ] `npm run lint` بدون خطای باقی‌مانده (Branches، ScaleEventList)

---

## پیوست — خلاصهٔ تاریخچه (فازهای قدیمی ۰–۵۱)

جزئیات در git history. نگاشت: فاز ۰–۸ مهاجرت Next؛ ۹–۱۷ پایلوت وزنی؛ ۱۸–۴۱ ترازو/RADIN/UX اپراتور؛ بخش ۴۲–۵۱ به فاز ۲–۵ بالا منتقل شد.

---

**آخرین هم‌ترازی todo:** ۱۴۰۴/۰۸ — ساختار ۵ فاز