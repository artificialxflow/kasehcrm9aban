# تحویل به تیم وب‌اپ (CRM کاسه) — ترازو رادین

سند عملیاتی فارسی برای پروژهٔ سایت (`kasehcrm`). مرجع فنی کامل‌تر: [`shariati.md`](shariati.md) (در repo **KasehScaleBridge**).

**پایلوت:** PC `FM1`، `branchId = 2`، API: `https://kasehcrm.ronakcare.ir`

---

## ۱. خلاصه برای محصول

- ترازو **مدام** وزن می‌فرستد (استریم ASCII مثل `     90  `) — **نباید** هر chunk به CRM POST شود.
- **Bridge** روی PC شعبه وزن را می‌خواند؛ CRM فقط **رویدادهای معنی‌دار** می‌گیرد (فروش تأییدشده، چاپ بارکد، یا ثبت دستی).
- فاز ۱: **`eventType: sale`** با وزن پایدار یا دکمه «ثبت فروش» در Bridge.
- فاز بعد: `prep_in` / `prep_out` / `waste` / `manual` (ورود دستی وقتی برق/ترازو قطع است).

---

## ۲. وضعیت میدان FM1 (تأیید شده)

| مورد | مقدار |
|------|--------|
| COM | **COM13** (نه COM10 Intel SOL) |
| Baud | **19200**, 8N1 |
| فرمت زنده | `rawAscii`: فاصله + عدد + فاصله (مثلاً `     90  `) |
| فرمت چاپ (در صورت فعال) | خط با `\|` مثل `PLU\|weight\|price` |
| Agent | KasehScaleBridge **0.2.2+** |
| مشکل فعلی | Demo/live POST → **401 unauthorized** (کلید API) |

---

## ۳. API الزامی

| مورد | مقدار |
|------|--------|
| Method | `POST` |
| URL | `{API_BASE}/api/branches/2/scale-events` |
| Content-Type | `application/json` |
| Header اختیاری | `x-scale-api-key: {SCALE_API_KEY}` اگر روی سرور env تنظیم شده |

### Body (Bridge می‌فرستد)

**حداقل (فاز ۱):**

```json
{
  "eventType": "sale",
  "clientEventId": "FM1-2026-11-11T12:00:00.000Z-abc123",
  "deviceId": "FM1",
  "rawPayload": {
    "weightGrams": 90,
    "barcode": "     90  ",
    "source": "RS232"
  }
}
```

**چاپ / بارکد (وقتی خط pipe آمد):**

```json
{
  "eventType": "sale",
  "clientEventId": "...",
  "deviceId": "FM1",
  "rawPayload": {
    "barcode": "1001|90|1289000",
    "pluCode": "1001",
    "weightGrams": 90,
    "source": "RS232"
  }
}
```

### Validation پیشنهادی

- `rawPayload` الزامی؛ `rawPayload.source` الزامی (`USB` | `RS232`).
- قبول اگر: `weightGrams` عدد مثبت **یا** `barcode` غیرخالی.
- `eventType` اختیاری؛ پیش‌فرض CRM: اگر `barcode` شامل `|` → `sale`.
- **Idempotency:** یکتا بودن `(branch_id, clientEventId)` — duplicate → `200` با همان `id` یا `409` با پیام روشن.

### پاسخ HTTP

| Status | معنی |
|--------|------|
| 200 / 201 | `{ "ok": true, "id": "..." }` |
| 401 | کلید API — **الان پایلوت اینجاست** |
| 422 | validation |
| 500 | خطای سرور |

---

## ۴. UI وب (حداقل فاز ۱)

- [ ] لیست رویدادهای ترازو برای **شعبه ۲** (`received_at`, `event_type`, وزن، PLU، `device_id`)
- [ ] فرم **ثبت دستی** (`eventType: manual`) — وقتی Bridge آفلاین یا برق رفت
- [ ] نمایش آخرین رویداد / خطای sync (اختیاری: آخرین heartbeat فاز ۲)

---

## ۵. قطعی برق / شبکه

| سناریو | رفتار |
|--------|--------|
| اینترنت قطع | Bridge صف محلی (`queueEnabled`) تا ۷ روز |
| برق PC | لاگ JSONL روی دیسک؛ صف بعد از روشن شدن |
| ترازو/کابل قطع | `data_stale` در لاگ Bridge — اپراتور **manual** در CRM |
| کلید API اشتباه | 401 — تا رفع نشود live کار نمی‌کند |

---

## ۶. چک‌لیست پیاده‌سازی CRM

- [ ] Endpoint `POST .../scale-events` برای branch `2`
- [ ] رفع **401** (`SCALE_API_KEY` سرور = `scaleApiKey` در config شعبه، یا غیرفعال موقت پایلوت با IP محدود)
- [ ] جدول `scale_events` (+ ستون‌های `event_type`, `client_event_id`, `device_id`)
- [ ] Idempotency روی `client_event_id`
- [ ] UI لیست + manual entry
- [ ] (فاز ۲) `POST .../scale-agent/heartbeat` — [`shariati.md`](shariati.md)

---

## ۷. پرامپت آماده (کپی برای Cursor / تسک تیم CRM)

```text
پروژه: CRM کاسه (kasehcrm). پایلوت شعبه 2، PC FM1.

کار: endpoint و UI رویداد ترازو رادین طبق سند KasehScaleBridge/CRM-WEB-HANDOFF-FA.md

الزامی:
1) POST https://kasehcrm.ronakcare.ir/api/branches/2/scale-events
   - body JSON: eventType (مثلاً sale), clientEventId (یکتا), deviceId (FM1), rawPayload { weightGrams, barcode?, pluCode?, source: RS232|USB }
   - header اختیاری x-scale-api-key اگر SCALE_API_KEY روی سرور هست
   - پاسخ 200/201 با { ok: true, id }

2) رفع 401 فعلی — هماهنگ SCALE_API_KEY با config شعبه یا سیاست auth پایلوت

3) ذخیره در DB (scale_events) + idempotency روی (branch_id, client_event_id)

4) UI: لیست رویدادهای شعبه 2 + فرم ثبت دستی manual وقتی ترازو offline

مرجع فنی: shariati.md در repo KasehScaleBridge (parse، لاگ، queue agent).

تست: از PC شعبه KasehScaleBridge.exe --demo-post سپس live با weightGrams=90.
```

---

## ۸. لینک‌ها در repo Bridge

| فایل |用途 |
|------|-----|
| [`todo.md`](todo.md) | چک‌لیست فاز Bridge |
| [`FIELD-GUIDE-FA.md`](FIELD-GUIDE-FA.md) | راهنمای مغازه |
| [`config.example.json`](config.example.json) | پیش‌فرض COM13 / 19200 |
