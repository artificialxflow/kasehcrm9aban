# Runflare — deploy و دیتابیس

## Deploy

```bash
runflare deploy
```

بیلد خودکار: `npm install` → `postinstall` (prisma generate) → `npm run build`.

## یک‌بار روی DB (shell کانتینر یا لپ‌تاپ با DATABASE_URL)

```bash
npx prisma migrate deploy
npx prisma db seed
```

`tsx` در `dependencies` است؛ `npx prisma db seed` روی Runflare باید بدون ENOENT کار کند.

## پایلوت شریعتی

- UI: `/pilot/shariati` (خلاصه)، `/pilot/shariati/catalog` (کالا و PLU)
- API: `/api/branches/2/...` (legacyId شعبه شریعتی)
