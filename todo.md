# مهاجرت کاسه CRM به Next.js

پیگیری پیاده‌سازی طرح [kasehcrm-main](kasehcrm-main) در پروژه Next.js ریشه.

---

## فاز ۰ — راه‌اندازی پیگیری
- [x] ایجاد `todo.md` در ریشه با فازها و زیرآیتم‌ها
- [x] هم‌تراز با اهداف UI موجود در kasehcrm-main

## فاز ۱ — پاکسازی قالب Next
- [x] حذف صفحه و assetهای دمو Create Next App
- [x] نصب `recharts`
- [x] تنظیم `images.remotePatterns` در next.config

## فاز ۲ — RTL، تایپوگرافی، استایل پایه
- [x] `lang="fa"` و `dir="rtl"` در layout ریشه
- [x] فونت Vazirmatn محلی از `public/fonts`
- [x] globals.css (تم، scrollbar)
- [x] Font Awesome 6 (CDN در layout)

## فاز ۳ — لایه مشترک و Layout پنل
- [x] `lib/types.ts` و `lib/constants.tsx`
- [x] AdminShell + Sidebar + Header + Footer
- [x] `app/(panel)/layout.tsx` و refactor navigation

## فاز ۴ — صفحات پنل مدیریت
- [x] `/` — داشبورد
- [x] `/branches` — شعب
- [x] `/orders` — سفارشات
- [x] `/customers` — مشتریان
- [x] `/reports` — گزارشات
- [x] `/roles` — کاربران و نقش‌ها

## فاز ۵ — بلاگ
- [x] `/blog` — لیست
- [x] `/blog/[slug]` — جزئیات + metadata

## فاز ۶ — وب‌اپ مشتری
- [x] CartProvider در `app/app/layout.tsx`
- [x] `/app` — انتخاب کانسپت
- [x] `/app/[concept]` — منو
- [x] `/app/cart` — سبد
- [x] `/app/checkout` — خلاصه سفارش

## فاز ۷ — Favicon و متادیتا
- [x] آیکون برند کاسه (`app/icon.tsx`)
- [x] metadata فارسی سایت

## فاز ۸ — تأیید نهایی
- [x] `npm run lint`
- [x] `npm run build`
- [x] تیک نهایی این فایل

---

# پایلوت انبار و فروش وزنی ([updates/01](updates/01))

## فاز ۹ — Prisma و اسکیما
- [x] نصب `prisma` + `@prisma/client`
- [x] ایجاد `prisma/schema.prisma`
- [x] اسکریپت‌های `package.json`: `db:generate`, `db:migrate`, `db:seed`, `postinstall`
- [x] تکمیل `.env.example`
- [x] migration `20251031140900_init_pilot_weight` (فایل SQL در repo)
- [x] اعمال روی DB: `npx prisma migrate deploy` (production)
- [x] `npx prisma db seed` / `npm run db:seed` (بعد از migrate)
- [x] حذف باکس «نسخه مدیریت» از Sidebar
- [x] `tsx` در dependencies برای seed روی Runflare

## فاز ۱۰ — لایه داده و API
- [x] `lib/prisma.ts`
- [x] سرویس‌های inventory / purchase / sale
- [x] Route Handlers (`/api/branches/[branchId]/...`)

## فاز ۱۱ — UI خرید وزنی (شریعتی)
- [x] `/pilot/shariati/purchases`
- [x] ثبت فاکتور خرید RAW + به‌روزرسانی موجودی

## فاز ۱۲ — UI فروش وزنی فاز ۱ (ترازو RADIN)
- [x] `/pilot/shariati/sales`
- [x] بارکد stub + `ScaleTicket`
- [x] کسر خودکار موجودی

## فاز ۱۳ — گزارش پایلوت
- [x] `/pilot/shariati/report`
- [x] تطبیق وزنی MVP

## فاز ۱۴ — یکپارچه‌سازی سخت‌افزار (فاز ۲)
- [x] [docs/scale-radin-integration.md](docs/scale-radin-integration.md)
- [x] API `POST /api/branches/2/scale-events`
- [x] stub bridge [scripts/scale-bridge/README.md](scripts/scale-bridge/README.md)

## فاز ۱۵ — چندشعبه و تأیید
- [x] resolve شعبه با `legacyId` یا cuid در API
- [x] `isPilot` در seed برای شعب بعدی
- [x] منوی «پایلوت شریعتی» در Sidebar
- [x] `npm run build` + lint

## فاز ۱۶ — مدیریت کatalog پایلوت
- [x] API: `POST /api/branches/{id}/catalog`, `PATCH .../catalog/{itemId}`
- [x] `/pilot/shariati/catalog` — افزودن RAW / فروش وزنی، PLU، فی، فعال/غیرفعال
- [x] تعدیل موجودی: `POST .../stock/adjust` + فرم در خلاصه پایلوت
- [ ] bridge واقعی USB/RS-232 — فاز ۲ عملیاتی

## فاز ۱۷ — پنل بدون mock (عملیاتی)
- [x] `GET /api/branches`, `PATCH /api/branches/{id}`, `GET /api/dashboard`
- [x] داشبورد، گزارشات، سفارشات، شعب از PostgreSQL
- [x] مشتریان: placeholder صادق (بدون mock)
- [x] لیست فاکتور خرید/فروش پایلوت + polling فروش
- [x] `SCALE_API_KEY` اختیاری برای scale-events
- [x] Auth پنل: StaffUser + login + middleware (Customer/Order آنلاین — بعداً)
- [ ] وب‌اپ مشتری `/app` از DB

---

# هم‌ترازی پایلوت شریعتی ([shariati.md](shariati.md))

## فاز ۱۸ — قرارداد API scale-events (shariati §3–6)
- [x] Helper پاسخ `{ ok, id?, error?, fields? }` (`lib/scale-api-response.ts`)
- [x] Validation `rawPayload` + `source` ∈ USB|RS232؛ 401/404/422
- [x] Idempotency `(branchId, barcode, دقیقه)` — duplicate → 200
- [x] POST موفق → 201 + `{ ok, id, saleId? }`
- [x] GET با query `barcode`, `from`, `to`
- [x] `.env.example` — یادداشت SCALE_API_KEY prod

## فاز ۱۹ — UI رویداد ترازو (shariati §7)
- [x] `/pilot/shariati/scale-events` + `ScaleEventList.tsx`
- [x] `PilotNav` + `PilotHome` + `Sidebar` PATH_ACCESS

## فاز ۲۰ — Catalog RADIN (shariati §11)
- [x] seed PLU `1001` + قیمت 420000؛ نگه‌داشتن POT001
- [x] به‌روز `docs/scale-radin-integration.md`

## فاز ۲۱ — Agent heartbeat + logs (shariati §8)
- [x] Prisma: `ScaleAgentHeartbeat`, `ScaleAgentLogUpload`
- [x] POST heartbeat/logs + GET status (scale API key / panel)
- [x] ویجت «آخرین سیگنال agent» در پایلوت

## فاز ۲۲ — Auth پنل
- [x] Prisma `StaffUser` + seed admin
- [x] login/logout + `panel-session` + middleware
- [x] `requirePanelAuth` روی API شعبه؛ `AdminShell` role از session

## فاز ۲۳ — مستندات shariati §13
- [x] چک‌لیست printable در `shariati.md` + curl/پاسخ جدید در docs

## فاز ۲۴ — تأیید
- [x] `npm run lint` + `npm run build`

---

# پایلوت میدان FM1 — ترازو RADIN ([CRM-WEB-HANDOFF-FA.md](CRM-WEB-HANDOFF-FA.md))

## فاز ۲۵ — Ops و رفع 401 (قبل از میدان)
- [x] مستند [docs/ops-scale-api-key.md](docs/ops-scale-api-key.md)
- [ ] کلید `SCALE_API_KEY` در Runflare + `scaleApiKey` در config شعبه (عملیاتی توسط شما)
- [ ] `npx prisma migrate deploy` روی production
- [ ] curl / `--demo-post` موفق از بیرون

## فاز ۲۶ — قرارداد API (eventType, clientEventId, agentHostname)
- [x] migration `20251111120000_scale_event_handoff`
- [x] validate handoff + normalize وزن ASCII
- [x] idempotency `clientEventId` + fallback barcode/دقیقه
- [x] ingest بر اساس `eventType`؛ `FM1` → `agentHostname`
- [x] rate limit اختیاری `SCALE_EVENTS_RATE_LIMIT_PER_MIN`
- [x] docs به‌روز در `scale-radin-integration.md`

## فاز ۲۷ — UI ثبت دستی و لیست غنی
- [x] `POST .../scale-events/manual` + `ScaleManualEntryForm`
- [x] ستون‌های eventType / دستگاه / وزن / clientEventId
- [x] فیلتر تاریخ + آمار ۲۴h

## فاز ۲۸ — چک‌لیست میدان FM1
- [x] [docs/field-FM1-checklist.md](docs/field-FM1-checklist.md)
- [ ] اجرای چک‌لیست در فروشگاه (COM13 / 19200 / demo-post / live)

## فاز ۲۹ — کیفیت داده و گزارش
- [x] شمارنده رویداد ۲۴h در UI
- [x] فیلتر `from`/`to` در UI
- [ ] دکمه «ثبت مجدد دستی» از روی ردیف failed (اختیاری بعدی)

## فاز ۳۰ — rate limit و امنیت
- [x] `lib/scale-rate-limit.ts` روی POST agent

## فاز ۳۱ — رویدادهای عملیاتی
- [x] enum `prep_in` / `prep_out` / `waste` — ذخیره بدون فاکتور

## فاز ۳۲ — مانیتورینگ Agent
- [x] `GET scale-agent/status?all=1` + `ScaleAgentMonitor`
- [ ] UI آپلود لاگ agent (endpoint موجود — بعدی)

## فاز ۳۳ — تأیید FM1
- [x] `npm run lint` + `npm run build` پس از این فازها
- [ ] تیک نهایی میدان در [field-FM1-checklist.md](docs/field-FM1-checklist.md)
