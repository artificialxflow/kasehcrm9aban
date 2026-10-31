# Scale Bridge

روی **All-in-One شعبه** اجرا شود (USB به همین PC وصل است).

## تست بدون سریال

```bash
cd scripts/scale-bridge
set API_BASE=https://kasehcrm.ronakcare.ir
set BRANCH_ID=2
set SCALE_API_KEY=your-secret-if-set-on-server
node index.mjs --demo
```

## فاز ۲

افزودن `serialport` و parse خروجی COM؛ سپس همان `postScaleEvent()` در `index.mjs`.

Endpoint: `POST /api/branches/2/scale-events` — header اختیاری `x-scale-api-key` اگر `SCALE_API_KEY` روی سرور تنظیم شده باشد.
