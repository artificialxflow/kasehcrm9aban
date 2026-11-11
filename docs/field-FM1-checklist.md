# چک‌لیست میدان — شعبه ۲ (PC FM1)

مرجع: [CRM-WEB-HANDOFF-FA.md](../CRM-WEB-HANDOFF-FA.md) · [ops-scale-api-key.md](./ops-scale-api-key.md)

## CRM (قبل از رفتن)

- [ ] `SCALE_API_KEY` روی سرور = `scaleApiKey` در config شعبه
- [ ] `npx prisma migrate deploy` روی DB تولید
- [ ] curl preflight → 201
- [ ] ورود پنل → `/pilot/shariati/scale-events`

## PC شعبه — سریال

- [ ] پورت **COM13** (نه COM10 Intel SOL)
- [ ] Baud **19200**, 8N1
- [ ] کابل RS-232 به ترازو RADIN

## KasehScaleBridge

- [ ] `apiBase`: `https://kasehcrm.ronakcare.ir`
- [ ] `branchId`: `"2"`
- [ ] `scaleApiKey`: همان سرور
- [ ] `serial.path`: `COM13`, `baudRate`: 19200
- [ ] `--demo-post` → 200/201
- [ ] پس از موفقیت: `livePostEnabled: true` و `--live`
- [ ] GUI محلی: وزن زنده؛ ثبت فقط پس از تثبیت (Bridge)

## در فروشگاه — تأیید

- [ ] رویداد جدید در لیست CRM (نوع فروش، FM1، clientEventId)
- [ ] وضعیت `parsed` + فاکتور برای `sale` با PLU معتبر
- [ ] در قطعی ترازو: ثبت **manual** از همان صفحه CRM
- [ ] heartbeat FM1 در ویجت agent (اختیاری فاز ۴ Bridge)

## عیب‌یابی سریع

| علامت | اقدام |
|--------|--------|
| 401 | کلید API |
| 422 validation | `source` RS232/USB، وزن یا barcode |
| failed / ITEM_NOT_FOUND | PLU در `/pilot/shariati/catalog` |
| duplicate 200 | طبیعی — idempotency |
