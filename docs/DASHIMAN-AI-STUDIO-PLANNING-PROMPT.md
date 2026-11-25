# PROJECT SPECIFICATION & PLANNING PROMPT — داش ایمان

این سند مکمل [`DASHIMAN-AI-STUDIO-HANDOFF.md`](./DASHIMAN-AI-STUDIO-HANDOFF.md) است.  
ابتدا این فایل را به AI Studio بدهید تا **فاز برنامه‌ریزی** را ارائه کند؛ پس از تأیید شما (`تأیید — شروع کد`) همراه با هندآف، کد کامل ساخته شود.

مرجع عملکردی: ریپوی **kasehcrm9aban** (پایلوت شریعتی، Prisma، ترازو، بار خرید).

---

## 1. Project Identity & Scope

- **Project Name:** داش ایمان (Dash Iman) — دامنه: `dashiman.ir` — نام مخزن/پوشه هدف: `dashiman`

- **Project Description & Core Modules:**

  سامانهٔ وب **SaaS/ERP سبک** برای مجموعهٔ غذایی **کاسه**: مدیریت **چندشعبه‌ای** انبار و فروش **وزنی**، اتصال **ترازو رادین** از طریق پل ویندوزی (فاز پس از پروتوتایپ)، و گزارش **پیش‌بینی فروش بار خرید** در برابر **فروش واقعی**.

  منطق کسب‌وکار در ریپوی مرجع: مسیر `/pilot/shariati`، سرویس‌های `lib/services/batch-fifo.ts`, `scale-integration.ts`, `purchase-batch.ts`, گزارش `PurchaseBatchReport`.

  **ماژول‌های اصلی (MVP):**

  1. **احراز هویت** — ورود با کارت (شبیه‌سازی NFC)، ورود مدیر کل، انتخاب شعبه؛ نقش‌ها: مدیر کل، مدیر شعبه، اپراتور فروش، آشپز.
  2. **پیشخوان مدیر کل** — نمای چندشعبه، فروش امروز، هشدار قطع پل ترازو، drill-down به شعبه شریعتی.
  3. **فضای شعبه** — خلاصه، موجودی گرمی، وضعیت عامل ترازو (FM1).
  4. **کالاها و قیمت** — مواد خام وزنی، کالای فروش وزنی، کد فروش، بارکد، قیمت هر کیلو.
  5. **خرید وزنی** — فاکتور، تاریخ بار، ایجاد **بار خرید**، **ضریب بازدهی** (مثال فیله: ۹۰٪).
  6. **فروش** — فاکتور از ترازو / ثبت دستی؛ **لغو فروش** با دلیل (بازگشت موجودی و تخصیص در Context).
  7. **رویداد ترازو** — فهرست موفق/ناموفق، ثبت دستی؛ بدون نمایش استریم وزن زنده.
  8. **دستگاه‌ها و پل** — دستگاه رادین، رایانهٔ شعبه، آخرین سیگنال زنده.
  9. **گزارش روز و بار خرید** — KPI و نمودار: پیش‌بینی در برابر فروش، مانده بار.
  10. **کاربران و کارت‌ها** — کاربر، نقش، شعب مجاز، کارت NFC (مدیر کل).

  **خارج از محدوده:** سفارش آنلاین، بلاگ، مشتریان CRM، وب‌اپ سفارش غذا (`/app`, `/orders` mock در ریپوی قدیمی).

  **قانون زبان:** تمام متن‌های قابل مشاهده **فارسی**؛ بدون واژهٔ انگلیسی در UI. تاریخ‌های نمایشی **شمسی**.

- **Target Audience & Language:** اپراتور فروشگاه، مدیر شعبه، مدیر کل؛ `lang="fa"`, `dir="rtl"`؛ اپلیکیشن وب سازمانی مدرن.

---

## 2. Visual Reference & Custom Color Palette

- **Layout & UX Reference (Attached Image):**

  در صورت پیوست، اسکرین‌شات را تحلیل کن. **اگر پیوست نیست**، از این مرجع‌های ریپوی kasehcrm9aban پیروی کن:

  | مرجع | مسیر |
  |------|------|
  | سایدبار و نقش‌ها | `components/Sidebar.tsx`, `components/admin/AdminShell.tsx` |
  | ناو افقی پایلوت | `components/pilot/PilotNav.tsx` |
  | ورود | `app/login/page.tsx` |
  | داشبورد دمو | `kasehcrm-main/components/Dashboard.tsx` |
  | اسکرین پرود (پیوست پیشنهادی) | `updates/02/screencapture-kasehcrm-ronakcare-ir-pilot-shariati-*.png` |

  **ساختار قابل تقلید (رنگ تصویر را کپی نکن):**

  - سایدبار ثابت **سمت راست** (~۲۵۶px)، لوگو بالا، منوی عمودی، آیتم فعال با پس‌زمینه پررنگ و سایه.
  - هدر باریک، عنوان صفحه، همبرگر در موبایل با overlay تیره.
  - محتوا: `max-w-7xl`, `p-6`, `space-y-6`.
  - تب‌های شعبه: قرص‌های `rounded-xl` افقی.
  - کارت‌ها: `rounded-3xl`, حاشیهٔ روشن، سایهٔ ملایم.
  - جداول: هدر کم‌رنگ، تراکم متوسط، `font-bold` برای اعداد.
  - **ممنوع:** اسکلتون و `setTimeout` تأخیر مصنوعی.

- **Custom Color Palette Override (برند داش ایمان):**

  | نقش | کد HEX | کاربرد |
  |-----|--------|--------|
  | Primary Brand Color | `#0F766E` | دکمه اصلی، منوی فعال، لینک کلیدی |
  | Secondary / Accent Color | `#D97706` | ترازو، فروش، نمودار تاکیدی |
  | Background Surface | `#F4F7F9` | پس‌زمینهٔ shell |
  | Card / Elevated Surface | `#FFFFFF` | کارت‌ها (border `#E2E8F0`) |
  | Text Primary | `#0F172A` | عناوین |
  | Text Muted | `#64748B` | توضیح و label |
  | Success / Danger | `#059669` / `#DC2626` | رویداد موفق / خطا و لغو |

  در `app/globals.css` متغیرهای `--color-primary`, `--color-accent`, `--color-surface`, `--color-card`, `--color-muted` تعریف و در `tailwind.config.ts` map شوند.

---

## 3. Custom Brand Identity (Logo & Favicon)

- **logo.svg** (`public/images/logo.svg`) + کامپوننت `<BrandLogo />` — هندسی مینیمال: شبکهٔ چهارخانه (داشبورد) + قوس پایین (ایمان/پایداری)؛ رنگ اصلی `#0F766E`، نقطهٔ accent `#D97706`.
- **favicon.svg** (`public/favicon.svg`) و **app/icon.svg** — نماد سادهٔ ۲×۲ خانه با نقطهٔ amber.
- متن کنار لوگو در shell: **داش ایمان** (نه کاسه CRM).

---

## 4. Technical Stack & Automated Offline Assets

- **Framework:** Next.js App Router + TypeScript + Tailwind محلی.
- **دیتابیس (بلوپرینت):** `prisma/schema.prisma` (PostgreSQL) هم‌تراز `src/data/types.ts`؛ فاز پروتوتایپ: **بدون** `app/api/**` و `"build": "next build"` فقط.
- **دادهٔ زندهٔ دمو:** `src/data/seed.ts` + `src/context/*` (CRUD فوری).
- **Fonts:** `scripts/setup-fonts.mjs` در `postinstall` و `prebuild` → `public/fonts/Shabnam-*.woff2`.
- **Icons:** `lucide-react` (نه Font Awesome CDN).
- **env:** مطابق بخش H در [`DASHIMAN-AI-STUDIO-HANDOFF.md`](./DASHIMAN-AI-STUDIO-HANDOFF.md).

محدودیت‌های فنی کامل (بدون CDN، Shabnam، RTL، بدون اسکلتون): بخش A همان هندآف.

---

## 5. Planning Phase Deliverable (Before Generating Full Code)

**AI Studio: ابتدا فقط این بخش را به‌صورت خوانا ارائه بده؛ منتظر تأیید کاربر بمان.**

### 5.1 تطبیق بصری و ساختاری

| عنصر مرجع kasehcrm | تطبیق داش ایمان |
|--------------------|-----------------|
| Sidebar راست + overlay موبایل | همان؛ آیتم فعال teal |
| `PilotNav` | زیرمنو در `app/(shell)/shobe/[slug]/layout.tsx` |
| کارت ورود گرد | `/vorood` — کارت NFC + ورود مدیر |
| جداول پایلوت | `DataTable`, `StatusBadge` فارسی |
| `ScaleAgentStatusWidget` | کارت وضعیت پل در خلاصه شعبه |
| `PurchaseBatchReport` | گزارش بار با ستون‌های فارسی |

### 5.2 مفهوم لوگو و فاویکون

- خطوط ۲px، گوشه‌های گرد SVG؛ بدون ایموجی و بدون تصویر غذا در آیکون.
- قابل تشخیص در ۱۶×۱۶ و ۳۲×۳۲.

### 5.3 نقشه سایت (slug انگلیسی + عنوان فارسی)

| مسیر | عنوان فارسی | نقش |
|------|-------------|-----|
| `/` | شروع | ریدایرکت |
| `/vorood` | ورود | همه |
| `/entekhab-shobe` | انتخاب شعبه | چندشعبه‌ای |
| `/modir` | پیشخوان مدیر کل | مدیر کل |
| `/karbaran` | کاربران و کارت‌ها | مدیر کل |
| `/shobe/shariati/khulashe` | خلاصه شعبه | بر اساس نقش |
| `/shobe/shariati/kalaha` | کالاها و قیمت | مدیر کل، مدیر شعبه |
| `/shobe/shariati/kharid` | خرید وزنی | مدیر کل، مدیر شعبه |
| `/shobe/shariati/forush` | فروش و اصلاح | مدیر کل، مدیر شعبه |
| `/shobe/shariati/roydad-tarazu` | رویداد ترازو | + اپراتور |
| `/shobe/shariati/dastgah-ha` | دستگاه و پل | مدیر کل، مدیر شعبه |
| `/shobe/shariati/gozaresh` | گزارش روز و بار خرید | مدیر کل، مدیر شعبه |
| `/shobe/shariati/rahnama` | راهنمای عملیات | مدیر شعبه |

شعب seed: `shariati` (پایلوت), `amol`, `babolsar`.

### 5.4 سلسلهٔ کامپوننت، مدل داده، env

```
app/layout.tsx → AppProviders
  (auth)/vorood
  (shell)/layout → Sidebar + TopBar
    modir/, karbaran/
    shobe/[slug]/ → khulashe, kalaha, kharid, forush, roydad-tarazu, dastgah-ha, gozaresh, rahnama

components/ BrandLogo, Shell, DataTable, StatCard, forms/*, reports/*
src/context/ AuthContext, BranchContext, DataContext
src/data/ types.ts, seed.ts, labels-fa.ts
prisma/schema.prisma
```

**مدل‌ها:** Branch, StaffUser, StaffUserBranch, NfcCard, CatalogItem, BranchStock, PurchaseInvoice, PurchaseLine, PurchaseYieldRule, PurchaseBatch, SaleInvoice (+ وضعیت لغو), SaleLine, SaleLineBatchAllocation, ScaleDevice, ScaleIntegrationEvent, ScaleAgentHeartbeat, AuditLog.

**سناریوی seed اجباری:** خرید ۱۰٬۰۰۰ g خام → پیش‌بینی ۹٬۰۰۰ g؛ فروش ۳۰۰+۵۰۰+۸۰۰ g → تخصیص ۱٬۶۰۰ g؛ مانده ۷٬۴۰۰ g.

**env کلیدی:** `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `AUTH_SESSION_*`, `SCALE_API_KEY`, `PILOT_DEFAULT_SALE_CODE=FILLET01`.

### 5.5 پیش‌نمای `LOCAL_ASSETS_GUIDE.md`

| فایل | منبع |
|------|------|
| `public/fonts/Shabnam-Regular.woff2` | setup-fonts.mjs |
| `public/fonts/Shabnam-Medium.woff2` | setup-fonts.mjs |
| `public/fonts/Shabnam-Bold.woff2` | setup-fonts.mjs |
| `public/images/logo.svg` | تولید پروژه |
| `public/favicon.svg` | تولید پروژه |
| `app/icon.svg` | = favicon |
| `public/images/branch-placeholder.svg` | SVG داخلی |
| `lucide-react` | npm محلی |

در runtime هیچ `https://` برای فونت، CSS، JS، یا `<img>` نباشد.

---

## دستور برای AI Studio

```text
STEP 1 — PLANNING ONLY:
Read sections 1–5 of this document and section A–I of DASHIMAN-AI-STUDIO-HANDOFF.md.
If an image is attached, merge its layout analysis into section 5.1.
Output a polished Architectural & Implementation Plan (5.1–5.5).
Do NOT generate project files yet.

STEP 2 — AFTER USER SAYS "تأیید — شروع کد":
Generate the full dashiman Next.js prototype per both documents.
```

---

## چک‌لیست پذیرش پلن (برای شما قبل از STEP 2)

- [ ] پالت teal/amber در پلن تأیید شده
- [ ] همه مسیرهای MVP فهرست شده
- [ ] seed فیله با اعداد ۹۰۰۰ / ۱۶۰۰ / ۷۴۰۰ ذکر شده
- [ ] قید «بدون انگلیسی در UI» تکرار شده
- [ ] LOCAL_ASSETS و Shabnam پوشش داده شده

---

*نسخه: ۱۴۰۴/۰۹/۰۵ — همراه با DASHIMAN-AI-STUDIO-HANDOFF.md*