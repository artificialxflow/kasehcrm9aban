# هم‌ترازی SCALE_API_KEY (قبل از میدان FM1)

## چرا 401 می‌گیرید؟

اگر روی سرور CRM متغیر `SCALE_API_KEY` **پر** باشد ولی Agent در `config.json` مقدار `scaleApiKey` خالی یا متفاوت باشد، همهٔ `POST /scale-events` با **401 unauthorized** برمی‌گردند.

## مراحل

1. یک رشتهٔ تصادفی امن تولید کنید (۳۲+ کاراکتر)، مثلاً:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

2. **Runflare / production** — همان مقدار را در `SCALE_API_KEY` قرار دهید (همراه `PANEL_SESSION_SECRET`, `DATABASE_URL`).

3. **PC شعبه** — `C:\ProgramData\KasehScale\ScaleBridge\config.json`:

```json
"scaleApiKey": "همان_مقدار_دقیق"
```

4. Deploy اپ + migration:

```bash
npx prisma migrate deploy
npm run build
```

5. تست:

```bash
curl -sS -X POST "https://kasehcrm.ronakcare.ir/api/branches/2/scale-events" \
  -H "Content-Type: application/json" \
  -H "x-scale-api-key: YOUR_KEY" \
  -d "{\"eventType\":\"sale\",\"clientEventId\":\"preflight-test-1\",\"deviceId\":\"FM1\",\"rawPayload\":{\"barcode\":\"POT001|225|1289000\",\"source\":\"RS232\"}}"
```

انتظار: HTTP `201` و `{ "ok": true, "id": "...", "saleId": "..." }`.

6. Agent: `KasehScaleBridge.exe --demo-post`

## نکته

اگر `SCALE_API_KEY` روی سرور **خالی** باشد، auth غیرفعال است (فقط برای dev توصیه می‌شود). در production کلید مشترک الزامی است.
