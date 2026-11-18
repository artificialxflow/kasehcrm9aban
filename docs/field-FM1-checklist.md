# چک‌لیست میدان — شعبه ۲ (PC FM1)

مرجع: [CRM-WEB-HANDOFF-FA.md](../CRM-WEB-HANDOFF-FA.md) · [ops-scale-api-key.md](./ops-scale-api-key.md)

## CRM (قبل از رفتن)

- [ ] **فاز ۲ پنل:** SIM-CRM «مشاهده» ۲۲۵g → HTTP 201 و ردیف در لیست (بدون رفتن به مغازه)
- [ ] `SCALE_API_KEY` روی سرور = `scaleApiKey` در config شعبه (**فاز ۳**)
- [x] `npx prisma migrate deploy` روی DB تولید
- [ ] `db:seed` / catalog PLU `1001` روی production در صورت خطای sale
- [ ] curl preflight → 201
- [ ] ورود پنل → `/pilot/shariati/scale-events` (کنسول عملیات ترازو در بالای صفحه)

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
| 422 parse_failed در SIM-CRM | «مشاهده» برای تست وزن؛ فروش فقط با PLU + فی در catalog |
| duplicate 200 | طبیعی — idempotency |
