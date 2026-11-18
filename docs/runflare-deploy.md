# Runflare — deploy و دیتابیس

## Deploy

```bash
runflare deploy
```

بیلد خودکار: `npm install` → `postinstall` (prisma generate) → `npm run build`.

در صورت قطع آپلود (`Connection closed`): تکرار دیپلوی یا `runflare update`.

## متغیرهای محیط (پایلوت فیله)

| متغیر | توضیح |
|--------|--------|
| `SCALE_API_KEY` | کلید درگاه ترازو (همان مقدار در برنامهٔ پل) |
| `PILOT_DEFAULT_SALE_PLU` | کد فروش پیش‌فرض برای وزن‌تنها از میز آزمایشی دفتر (مثلاً کد فیله در seed) |
| `DATABASE_URL` | اتصال Postgres |
| `PANEL_SESSION_SECRET` | کوکی ورود پنل |

بعد از تغییر env حتماً **ری‌استارت یا دیپلوی مجدد**.

## یک‌بار روی DB (shell کانتینر یا لپ‌تاپ با DATABASE_URL)

```bash
npx prisma migrate deploy
npm run db:seed
```

`tsx` در `dependencies` است؛ seed روی Runflare باید بدون ENOENT کار کند.

## پاکسازی شعبه شریعتی (فقط legacyId ۲)

| دستور | چه پاک می‌شود |
|--------|----------------|
| `npm run db:reset-pilot` | رویداد، فاکتور، موجودی، لاگ — **کاتالوگ می‌ماند** |
| `npm run db:reset-pilot:full` | همان + **همه کالاهای شعبه** + دستگاه‌های ترازو |

نام شعب و کاربران سیستم دست نخورده می‌مانند.

**شروع دستی از صفر (بدون کالای دمو):**

```bash
npm run db:reset-pilot:full
# seed نزنید — کالاها را از پنل ثبت کنید
```

**فقط صفر کردن فاکتورها با نگه‌داشتن کالاهای seed:**

```bash
npm run db:reset-pilot
npm run db:seed
```

اسکریپت: [prisma/scripts/reset-pilot-branch.ts](../prisma/scripts/reset-pilot-branch.ts)

## پایلوت شریعتی

- UI: `/pilot/shariati` · کالاها · رویداد ترازو · [fillet-guide](/pilot/shariati/fillet-guide)
- API: `/api/branches/2/...` (legacyId شعبه شریعتی)
- چک‌لیست فیله: [fillet-pilot-checklist-fa.md](./fillet-pilot-checklist-fa.md)