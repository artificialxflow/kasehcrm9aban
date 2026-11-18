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

## پاکسازی دمو شعبه شریعتی (فقط legacyId ۲)

رویدادها، فاکتورها، موجودی و سیگنال‌های همان شعبه حذف می‌شوند؛ کاتالوگ و کاربران می‌مانند.

```bash
npm run db:reset-pilot
npm run db:seed
```

اسکریپت: [prisma/scripts/reset-pilot-branch.ts](../prisma/scripts/reset-pilot-branch.ts)

## پایلوت شریعتی

- UI: `/pilot/shariati` · کالاها · رویداد ترازو · [fillet-guide](/pilot/shariati/fillet-guide)
- API: `/api/branches/2/...` (legacyId شعبه شریعتی)
- چک‌لیست فیله: [fillet-pilot-checklist-fa.md](./fillet-pilot-checklist-fa.md)