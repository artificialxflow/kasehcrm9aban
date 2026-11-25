# داش ایمان (dashiman.ir) — سند هندآف Google AI Studio

این سند **یک‌جا** برای ساخت پروتوتایپ تعاملی Next.js است. مرجع عملکردی سیستم فعلی: ریپوی **kasehcrm9aban** (پایلوت شریعتی، ترازو رادین، بار خرید، پیش‌بینی بازدهی، تخصیص فروش).  
خروجی هدف: پروژهٔ مستقل به نام **`dashiman`** (نه ادغام با ریپوی قدیمی در این فاز).

---

## بخش A — ROLE & OBJECTIVE (انگلیسی؛ اجرای دقیق)

```text
# ROLE & OBJECTIVE
You are an expert Senior Frontend & Data Modeling Architect. Your objective is to rapidly generate interactive, high-polish, 100% self-hosted Next.js (App Router) client prototypes paired with a perfectly aligned `prisma/schema.prisma` blueprint. The application must run instantaneously in Google AI Studio preview and Vercel with zero external CDN requests, automatic local Persian font provisioning, custom SVG brand identity, and zero skeleton flicker.

# CORE TECHNICAL CONSTRAINTS (STRICTLY ENFORCED)

## 1. Zero Runtime External Asset Requests
- NO External CDNs: Do NOT use `<script src="https://cdn.tailwindcss.com"></script>`, unpkg, jsdelivr, cdnjs, or any external stylesheet/script links in HTML/TSX.
- NO External Font Links: Do NOT use Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) or remote CSS font imports.
- NO External Images: Do NOT use Unsplash, Pexels, Picsum, placeholder.com, or any `http://` / `https://` URLs inside `<img>` tags or CSS `background-image`.
- NO External Icon Fonts: Use `lucide-react` locally or inline `<svg>` elements.

Exception for build-time only: `scripts/setup-fonts.mjs` may download Shabnam `.woff2` from GitHub raw URLs during `npm install` / `prebuild` — these files must land in `public/fonts/` and be served locally at runtime.

## 2. Automated Local Persian Font Setup (Shabnam `.woff2`)
- Configure `@font-face` rules in `app/globals.css` pointing exclusively to local files inside `/fonts/`:
  - `font-family: 'Shabnam'`, `font-weight: 400`, `src: url('/fonts/Shabnam-Regular.woff2') format('woff2');`
  - `font-family: 'Shabnam'`, `font-weight: 500`, `src: url('/fonts/Shabnam-Medium.woff2') format('woff2');`
  - `font-family: 'Shabnam'`, `font-weight: 700`, `src: url('/fonts/Shabnam-Bold.woff2') format('woff2');`
- Set `'Shabnam', sans-serif` as the global font family across `html`, `body`, inputs, buttons, and Tailwind `font-sans`. Add `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; letter-spacing: 0;` to `body` for crisp Persian rendering.
- Auto-Download Script (`scripts/setup-fonts.mjs`): Create a zero-dependency Node.js script (`scripts/setup-fonts.mjs`) and hook it into `package.json` as `"postinstall": "node scripts/setup-fonts.mjs"` (and `"prebuild": "node scripts/setup-fonts.mjs"`). This script must check if `public/fonts/Shabnam-Regular.woff2`, `Shabnam-Medium.woff2`, and `Shabnam-Bold.woff2` exist, and if missing, download them from the official GitHub release raw URLs (`https://raw.githubusercontent.com/rastikerdar/shabnam-font/master/dist/Shabnam.woff2`, `Shabnam-Medium.woff2`, `Shabnam-Bold.woff2`) into `public/fonts/` with graceful error handling so builds never fail even offline.

## 3. Local Styling & RTL Setup
- Install and configure Tailwind CSS locally via `package.json`, `postcss.config.js`, and `tailwind.config.ts`.
- Enforce full RTL (Right-to-Left) support (`dir="rtl"` and `lang="fa"` on `<html>`) using logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`).

## 4. Custom Brand Identity & Local Media Handling
- Generate a bespoke, minimal vector `logo.svg` (`public/images/logo.svg` + `<BrandLogo />` component) and `favicon.svg` (`public/favicon.svg` + `app/icon.svg`) tailored to the project's domain and color palette.
- Brand name in UI: **داش ایمان** — domain: **dashiman.ir**. Suggested palette: warm professional orange-amber accent on slate/neutral (inspired by Kaseh group, not a copy of legacy mockups).
- Reference all other images from `/images/...` using clean English filenames with graceful visual fallback containers (subtle gradient + inline SVG placeholder + `onError` handler) so the UI never breaks before images are added.

## 5. Instant Prototype UX & Zero Skeletons
- No Artificial Delays or Skeletons: Never add fake `setTimeout` loading spinners or skeleton screens. All interactive flows (creating, editing, filtering, deleting items, switching tabs, demo login) must respond instantaneously via clean React Context / state providers (`src/context/`).
- Rich Realistic Persian Seed State: Populate all modules, tables, charts, and cards with realistic, domain-accurate Persian sample records (using Shamsi dates where appropriate) stored in centralized typed seed modules (`src/data/seed.ts`) so client presentations feel completely alive.
- Fast Navigation: Use Next.js `<Link prefetch>` for sidebar and navigation items so route transitions are instant.

## 6. Schema-Aligned Architecture (Ready for Backend Handoff)
- Synchronized `prisma/schema.prisma`: Always generate and maintain a clean, normalized `prisma/schema.prisma` (PostgreSQL provider) whose models, fields, relations, and enums match 1:1 with the TypeScript interfaces and form inputs used in the frontend UI. Whenever a UI form or entity changes, update `prisma/schema.prisma` accordingly.
- No Backend Boilerplate Overhead: Do NOT generate `app/api/` routes, Prisma client database queries, or `prisma migrate` build commands in this prototype phase—keep `package.json` `"build"` simply as `"next build"` so Vercel and AI Studio builds succeed in seconds.
- Clean Data Layer Boundary: Keep all mock CRUD operations encapsulated inside clean Context action methods (`addItem`, `updateItem`, `deleteItem`) so a backend engineer can later swap those methods with real `/api/*` calls in Cursor without rewriting UI components.

## 7. Standardized `env.example`
- Include a clean `env.example` file at the project root with NO `#` comments or hashtag headers—only clean `KEY=VALUE` lines separated by blank lines (see Section H at the end of this document).
```

---

## بخش B — سند محصول (فارسی)

### چشم‌انداز

**داش ایمان** سامانهٔ مدیریت فروشگاه و انبار **وزنی** برای مجموعهٔ رستوران/فست‌فود **کاسه** است.  
فاز اول: شعبهٔ **شریعتی (سوخاری بابل)**؛ معماری از روز اول **چندشعبه‌ای**.

### کاربران

| نقش در UI | معنی |
|-----------|------|
| مدیر کل | همه شعب، کاربران، گزارش تجمیعی پیش‌بینی در برابر فروش واقعی |
| مدیر شعبه | کاتالوگ، خرید، گزارش بار، رویداد ترازو، اصلاح موجودی و لغو فروش |
| اپراتور فروش | ورود با کارت، خلاصه شعبه، رویداد ترازو (مشاهده + ثبت دستی محدود) |
| آشپز | مشاهده موجودی (حداقل) |

### قانون زبان (غیرقابل مذاکره)

1. **تمام متن‌های قابل مشاهده در UI فارسی** — بدون واژهٔ انگلیسی (نه PLU، نه API، نه Login، نه FIFO در برچسب).
2. معادل‌ها: **کد فروش**، **بارکد**، **رویداد ترازو**، **ثبت دستی**، **بار خرید**، **پیش‌بینی قابل فروش**، **فروش ثبت‌شده**، **مانده بار**، **ضریب بازدهی**.
3. اعداد با قالب خوانا برای ایران (جداکنندهٔ هزارگان)؛ واحد: **گرم**، **کیلوگرم**، **ریال** یا **تومان** (یکی را در کل پروژه انتخاب و ثابت نگه دار).
4. تاریخ‌های نمایشی **شمسی** در کارت‌ها و جداول.

### ورود (پروتوتایپ)

1. **ورود با کارت** (شبیه‌سازی NFC): انتخاب کارت از لیست دمو یا وارد کردن شناسهٔ کارت → کاربر + شعبه.
2. **ورود مدیر کل**: نام کاربری/رمز دمو (فوری، بدون تأخیر).
3. چند شعبه برای یک کاربر → صفحهٔ **انتخاب شعبه** (فقط شعب مجاز).

### ماژول‌های MVP

| ماژول | رفتار دمو |
|-------|-----------|
| خلاصه شعبه | موجودی کلیدی، وضعیت پل ترازو، فروش امروز |
| کالاها و قیمت | CRUD کالا؛ انواع: مواد خام وزنی، کالای فروش وزنی، قطعه‌ای (نمایش فقط) |
| خرید وزنی | فاکتور + ایجاد بار خرید + پیش‌بینی از ضریب بازدهی |
| فروش | فهرست فاکتورها؛ لغو فروش با دلیل (بازگشت موجودی و تخصیص در state) |
| رویداد ترازو | فهرست موفق/ناموفق؛ فرم ثبت دستی |
| دستگاه‌ها | یک دستگاه رادین + وضعیت رایانهٔ شعبه (FM1) |
| گزارش روز و بار خرید | KPI پیش‌بینی در برابر فروش؛ نمودار ساده (recharts محلی) |
| کاربران و کارت‌ها | فقط مدیر کل |

### سناریوی پذیرش (همان پایلوت فیله)

1. کاتالوگ: خام فیله + فیله سوخاری با کد فروش.
2. خرید **۱۰٬۰۰۰ گرم** خام → پیش‌بینی **۹٬۰۰۰ گرم** (ضریب ۹۰٪).
3. فروش **۳۰۰ + ۵۰۰ + ۸۰۰ گرم** → جمع تخصیص **۱٬۶۰۰ گرم**؛ مانده **۷٬۴۰۰ گرم**.
4. مدیر کل همان اعداد را در داشبورد چندشعبه ببیند.

### خارج از محدودهٔ MVP

سفارش آنلاین، بلاگ، مشتریان CRM، وب‌اپ سفارش غذا — **نیاور**.

### مرجع فنی آینده (برای مهندس بک‌اند بعد از پروتوتایپ)

قرارداد ترازو (repo فعلی): `POST /api/branches/{branchId}/scale-events`، کلید درگاه، یکتایی رویداد. مستندات: `shariati.md`, `CRM-WEB-HANDOFF-FA.md` در kasehcrm9aban.

---

## بخش C — درخت تحویل (Deliverable Tree)

AI Studio باید پروژهٔ کامل با این ساختار تولید کند:

```text
dashiman/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── (auth)/
│   │   └── vorood/page.tsx
│   ├── (shell)/
│   │   ├── layout.tsx
│   │   ├── modir/page.tsx
│   │   ├── karbaran/page.tsx
│   │   └── shobe/[slug]/
│   │       ├── layout.tsx
│   │       ├── khulashe/page.tsx
│   │       ├── kalaha/page.tsx
│   │       ├── kharid/page.tsx
│   │       ├── forush/page.tsx
│   │       ├── roydad-tarazu/page.tsx
│   │       ├── dastgah-ha/page.tsx
│   │       └── gozaresh/page.tsx
├── components/
│   ├── BrandLogo.tsx
│   ├── shell/Sidebar.tsx
│   ├── shell/Header.tsx
│   ├── charts/...
│   └── forms/...
├── src/
│   ├── context/
│   │   ├── AppProviders.tsx
│   │   ├── AuthContext.tsx
│   │   ├── BranchContext.tsx
│   │   └── DataContext.tsx
│   ├── data/
│   │   ├── types.ts
│   │   └── seed.ts
│   └── lib/
│       ├── format-fa.ts
│       └── shamsi.ts
├── public/
│   ├── fonts/
│   ├── favicon.svg
│   └── images/logo.svg
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── setup-fonts.mjs
├── env.example
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

**نباشد:** `app/api/**`, `prisma migrate` در اسکریپت build، اسکلتون UI، لینک CDN در runtime.

**وابستگی‌های پیشنهادی:** `next`, `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `recharts`, `typescript`. (بدون `@prisma/client` در runtime پروتوتایپ مگر فقط devDependency اختیاری برای schema validation — ترجیح: فقط فایل schema بدون generate در build.)

---

## بخش D — هم‌ترازی `prisma/schema.prisma` و `src/data/types.ts`

### enumها (DB لاتین؛ UI از `src/data/labels-fa.ts` یا map ثابت)

| Enum | مقادیر |
|------|--------|
| BranchConcept | FRIED, BURGER, ASH, CAFE |
| CatalogItemType | RAW, WEIGHED_SALE, PIECE |
| StockMovementType | PURCHASE_IN, SALE_OUT, WASTE, ADJUSTMENT |
| SaleSource | MANUAL, SCALE_RECEIPT, SCALE_SERIAL |
| ScaleConnection | USB, RS232, PS2, BARCODE_ONLY |
| ScaleEventStatus | pending, parsed, failed |
| ScaleBusinessEventType | sale, manual, prep_in, prep_out, waste |
| StaffRole | OWNER, BRANCH_MANAGER, CASHIER, CHEF |
| SaleInvoiceStatus | ACTIVE, VOIDED |
| AuditAction | CREATE, UPDATE, VOID, ADJUST |

### مدل‌ها (فیلدهای اصلی)

- **Branch**: id, slug (unique, e.g. `shariati`), name, city, concept, isOpen, isPilot, pilotDefaultSaleCode, createdAt
- **StaffUser**: id, displayName, username (unique), role, isActive, createdAt
- **StaffUserBranch**: id, staffUserId, branchId, @@unique([staffUserId, branchId])
- **NfcCard**: id, cardUid (unique), staffUserId, label, isActive
- **CatalogItem**: id, branchId, saleCode, barcode, name, type, unitPriceRialPerKg (BigInt optional), isActive
- **BranchStock**: id, branchId, catalogItemId, quantityGrams, @@unique([branchId, catalogItemId])
- **PurchaseInvoice**: id, branchId, purchasedAt, supplierName, totalRial, createdByStaffId
- **PurchaseLine**: id, purchaseInvoiceId, catalogItemId, weightGrams, unitPriceRialPerKg, lineTotalRial
- **PurchaseYieldRule**: id, branchId, rawCatalogItemId, saleCatalogItemId, yieldBps (e.g. 9000 = 90%)
- **PurchaseBatch**: id, branchId, purchaseLineId (unique), raw/sale catalog ids, purchasedAt, rawGrams, expectedSellableGrams, allocatedSoldGrams
- **SaleInvoice**: id, branchId, soldAt, source, status, totalRial, voidReason?, voidedAt?, voidedByStaffId?
- **SaleLine**: id, saleInvoiceId, catalogItemId, weightGrams, unitPriceRialPerKg, lineTotalRial
- **SaleLineBatchAllocation**: id, saleLineId, purchaseBatchId, gramsAllocated
- **ScaleDevice**: id, branchId, model, connection, label, isActive
- **ScaleIntegrationEvent**: id, branchId, deviceId?, eventType, clientEventId?, status, rawPayload (Json), createdAt
- **ScaleAgentHeartbeat**: id, branchId, hostname, lastSeenAt
- **AuditLog**: id, branchId, staffUserId, action, entityKind, entityId, note, createdAt

روابط و `onDelete` مطابق الگوی kasehcrm9aban (Cascade برای شعبه، Restrict برای catalog در movement).

### TypeScript (`src/data/types.ts`)

هر interface باید نام فیلد و نوع همان Prisma را منعکس کند (BigInt در UI به number/string امن برای دمو).  
فرم‌ها فقط فیلدهای موجود در types را ویرایش کنند.

---

## بخش E — محتوای `src/data/seed.ts` (اجباری)

### شعب

| slug | name | city | isPilot |
|------|------|------|---------|
| shariati | سوخاری بابل (شریعتی) | بابل | true |
| amol | سوخاری آمل | آمل | false |
| babolsar | آش و حلیم بابلسر | بابلسر | false |

### کاربران و کارت‌ها

- **مدیر کل**: `admin` / نمایش «علی مدیر» — دسترسی همه شعب.
- **مدیر شعبه شریعتی**: «رضا شریعتی» — فقط shariati.
- **اپراتور**: «سارا صندوق» — کارت NFC دمو `A1B2C3D4` — فقط shariati.
- رمز دمو در UI نمایش داده نشود؛ ورود یک‌کلیکی در پروتوتایپ.

### کاتالوگ شعبه شریعتی

| saleCode | name | type | note |
|----------|------|------|------|
| RAW-FILLET | فیله خام مرغ | RAW | |
| FILLET01 | فیله سوخاری آماده | WEIGHED_SALE | کد پیش‌فرض ترازو |
| POT001 | سیب‌زمینی سرخ‌کرده | WEIGHED_SALE | اختیاری برای نمایش موجودی دوم |

قیمت‌های نمونه ریالی واقع‌گرا (عدد گرد).

### ضریب بازدهی

RAW-FILLET → FILLET01 ، **yieldBps = 9000** (۹۰٪).

### بار خرید + فروش (همان سناریوی تست)

- یک خرید: **۱۰٬۰۰۰ g** RAW-FILLET در تاریخ شمسی نزدیک (مثلاً ۱۴۰۴/۰۹/۰۱).
- PurchaseBatch: expectedSellableGrams = **۹٬۰۰۰** ، allocatedSoldGrams شروع **۰** سپس پس از فروش‌ها **۱۶۰۰**.
- سه فاکتور فروش FILLET01: ۳۰۰، ۵۰۰، ۸۰۰ گرم — منبع: دو تا «رسید ترازو»، یکی «ثبت دستی».
- FIFO: تخصیص‌ها به همان batch.

### رویداد ترازو

- ۲ رویداد `parsed` + ۱ رویداد `failed` با پیام خطای فارسی («کد فروش ناشناخته»).

### موجودی

- RAW بعد از خرید: ۱۰٬۰۰۰ g (یا منطق کسر در صورت طراحی متفاوت — در seed ثابت و در گزارش سازگار).
- FILLET01: موجودی فروش بر اساس خروجی سناریو (مثلاً ۹۰۰۰ منهای فروش‌ها اگر مدل «ورود از بازدهی» دارید — یا فقط نمایش ساده در MVP).

### گزارش

کارت‌های خلاصه: پیش‌بینی **۹٬۰۰۰** ، فروش تخصیص‌یافته **۱٬۶۰۰** ، مانده **۷٬۴۰۰** ، درصد تحقق ≈ **۱۷٫۸٪** از پیش‌بینی (برای نمودار).

---

## بخش F — مسیرها و ناوبری

| مسیر | عنوان منو |
|------|-----------|
| `/vorood` | ورود |
| `/modir` | پیشخوان مدیر کل |
| `/karbaran` | کاربران و کارت‌ها |
| `/shobe/shariati/khulashe` | خلاصه شعبه |
| `/shobe/shariati/kalaha` | کالاها و قیمت |
| `/shobe/shariati/kharid` | خرید وزنی |
| `/shobe/shariati/forush` | فروش و اصلاح |
| `/shobe/shariati/roydad-tarazu` | رویداد ترازو |
| `/shobe/shariati/dastgah-ha` | دستگاه و پل |
| `/shobe/shariati/gozaresh` | گزارش روز و بار خرید |

سایدبار شعبه فقط وقتی کاربر در context شعبه است. مدیر کل از `/modir` به شعبه drill-down کند.

**دسترسی دمو (Context):**

| مسیر | مدیر کل | مدیر شعبه | اپراتور |
|------|---------|-----------|---------|
| karbaran | ✓ | ✗ | ✗ |
| kalaha, kharid | ✓ | ✓ | ✗ |
| roydad-tarazu | ✓ | ✓ | ✓ |
| forush لغو | ✓ | ✓ | ✗ |
| gozaresh کامل | ✓ | ✓ | ✗ |

---

## بخش G — DATA CONTEXT API (برای بک‌اند بعدی)

`DataContext` باید این متدها را expose کند (همه sync/instant):

```text
addCatalogItem, updateCatalogItem, deleteCatalogItem
createPurchaseInvoice (creates batch + yield prediction)
createSaleInvoice (allocates FIFO to batches, updates stock)
voidSaleInvoice (status VOIDED, reverse stock + allocation)
addScaleEvent, retryScaleEvent (demo)
adjustStock (with AuditLog)
addStaffUser, updateStaffUser, assignBranch, registerNfcCard
```

هیچ `fetch` به سرور در پروتوتایپ.

---

## بخش H — محتوای دقیق `env.example`

فایل ریشهٔ پروژه داش ایمان باید عیناً این خطوط را داشته باشد (بدون `#`):

```env
NODE_ENV=production

HOST=0.0.0.0
PORT=3000

DATABASE_URL=postgresql://user:password@localhost:5432/dashiman_db
DIRECT_URL=postgresql://user:password@localhost:5432/dashiman_db

AUTH_SESSION_SECRET=change-me-to-a-long-random-secret-key
AUTH_SESSION_COOKIE=dashiman_session
AUTH_SESSION_TTL_DAYS=30
AUTH_COOKIE_SECURE=true

NEXT_PUBLIC_APP_URL=https://dashiman.ir

LOG_LEVEL=info

STORAGE_ROOT=/data

SMS_PROVIDER=generic
SMS_API_KEY=your-sms-api-key
SMS_TEMPLATE_ID=100000

OTP_TTL_SECONDS=120
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_VERIFY_ATTEMPTS=5
OTP_MAX_SEND_PER_PHONE_PER_DAY=10

SKIP_MIGRATE=false
MIGRATE_ONLY=false

SCALE_API_KEY=
PILOT_DEFAULT_SALE_CODE=FILLET01
```

---

## بخش I — چک‌لیست پذیرش

- [ ] `npm install && npm run dev` بدون خطا
- [ ] `npm run build` فقط `next build` (+ prebuild fonts)
- [ ] DevTools Network: بدون fonts.googleapis.com و CDN tailwind
- [ ] `html` دارای `dir="rtl"` و `lang="fa"`
- [ ] ورود کارت دمو → شعبه شریعتی فوری
- [ ] گزارش بار: ۹۰۰۰ / ۱۶۰۰ / ۷۴۰۰ گرم
- [ ] هیچ متن انگلیسی در UI قابل مشاهده
- [ ] `types.ts` و `schema.prisma` هم‌نام فیلدها
- [ ] Context CRUD بدون اسکلتون

---

## بخش J — TASK (آخرین دستور برای AI Studio)

```text
TASK: Generate the complete `dashiman` Next.js App Router project in one generation pass (all files).
Read sections A through I of this document and implement exactly.
Product: Dash Iman (داش ایمان) for Kaseh weighted inventory + scale sales; MVP branch shariati.
Prototype only: React Context + seed.ts; NO app/api routes; NO Prisma Client in production bundle; build = next build.
UI 100% Persian visible strings; RTL; Shabnam local fonts via setup-fonts.mjs; lucide-react icons only.
Include interactive admin dashboard, branch workspace, NFC demo login, catalog/purchase/sales/scale events/reports with the fillet seed scenario numbers.
prisma/schema.prisma must mirror src/data/types.ts field-for-field.
Include env.example from Section H with no comment lines.
Include README.md in Persian with install and dev instructions.
After generation, the app must feel production-polished with zero skeleton screens and instant interactions.
```

---

## پیوست — یاداشت برای تیم Cursor (بعد از Studio)

1. خروجی Studio را در ریپوی جدید `dashiman` commit کنید.
2. منطق واقعی را از `kasehcrm9aban` کپی کنید: `lib/services/batch-fifo.ts`, `scale-integration.ts`, `purchase-batch.ts`, routes زیر `app/api/branches/`.
3. Context actions را به fetch همان APIها وصل کنید.
4. `StaffUserBranch`, `NfcCard`, `AuditLog`, `SaleInvoiceStatus` را migrate کنید.

---

*نسخهٔ سند: ۱۴۰۴/۰۹/۰۵ — تهیه‌شده برای هندآف AI Studio از روی kasehcrm9aban.*