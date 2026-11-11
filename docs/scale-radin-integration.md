# یکپارچه‌سازی ترازو RADIN (فاز ۲)

مرجع عملیاتی: [shariati.md](../shariati.md) · [CRM-WEB-HANDOFF-FA.md](../CRM-WEB-HANDOFF-FA.md) · [field-FM1-checklist.md](./field-FM1-checklist.md)

## سخت‌افزار (شعبه شریعتی)

- مدل: RADIN
- پورت‌ها: CASH, PS2, RS-232, USB
- All-in-One به‌عنوان میزبان (`FM1` در پایلot)
- Agent: **KasehScaleBridge** (repo جدا) → `POST /api/branches/2/scale-events`

## فاز ۱ (دستی)

- ثبت دستی فاکتور در `/pilot/shariati/sales`
- بارکد stub: `PLU|weightGrams|unitPriceRialPerKg` (مثال: `POT001|225|1289000`)
- API: `POST /api/branches/2/sales`

## فاز ۲ (USB / RS-232 + bridge)

1. `KasehScaleBridge.exe --live` روی PC شعبه
2. ارسال **فقط رویداد تجاری** (نه استریم وزن زنده) به `POST /api/branches/{branchId}/scale-events` با header `x-scale-api-key` اگر `SCALE_API_KEY` روی سرور تنظیم شده.

```json
{
  "eventType": "sale",
  "clientEventId": "FM1-2026-11-11T12:00:00.000Z-abc123",
  "deviceId": "FM1",
  "rawPayload": {
    "barcode": "POT001|225|1289000",
    "source": "RS232"
  }
}
```

`deviceId` hostname (مثلاً FM1) در `agentHostname` ذخیره می‌شود؛ FK `ScaleDevice` فقط برای cuid معتبر.

یا پس از parse agent:

```json
{
  "rawPayload": {
    "barcode": "626564512|420000|1289000",
    "pluCode": "1001",
    "weightGrams": 225,
    "source": "RS232"
  }
}
```

3. سرور در `ScaleIntegrationEvent` ذخیره می‌کند؛ **فقط `eventType: sale`** فاکتور می‌سازد. انواع `manual`, `prep_*`, `waste` بدون فاکتور.
4. Idempotency: `(branchId, clientEventId)` — duplicate → `200` + `duplicate: true`.
5. UI: `/pilot/shariati/scale-events` (لیست، manual، heartbeat، فیلتر تاریخ).
6. ثبت دستی پنل: `POST .../scale-events/manual` (session پنل).

## Agent heartbeat / logs

- `POST /api/branches/2/scale-agent/heartbeat` (header `x-scale-api-key` اگر env پر است)
- `POST /api/branches/2/scale-agent/logs` — body `{ "lines": ["...", ...] }` حداکثر 500 خط
- `GET /api/branches/2/scale-agent/status?hostname=FM1` — نیاز session پنل

### mapping کatalog (پایلot)

| PLU | barcode (RADIN) | قیمت/kg (ریال) | یادداشت |
|-----|-----------------|----------------|---------|
| POT001 | — | 1_289_000 | demo `--demo-post` |
| 1001 | 626564512 | 420_000 | نمونه Sample.xlsx |

اگر رشته pipe بارکد با `parseScaleBarcode` (PLU|گرم|فی) جور نبود، agent باید `pluCode` + `weightGrams` بفرستد.

## پاسخ API (POST scale-events)

موفق:

```json
{ "ok": true, "id": "clxxx...", "saleId": "clxxx..." }
```

تکرار `clientEventId`:

```json
{ "ok": true, "id": "...", "duplicate": true }
```

## تست بدون سخت‌افزار

```bash
curl -sS -X POST "http://localhost:3000/api/branches/2/scale-events" \
  -H "Content-Type: application/json" \
  -d "{\"rawPayload\":{\"barcode\":\"POT001|225|1289000\",\"source\":\"USB\"}}"
```

## مستندات بیشتر

- نیازمندی‌ها: [updates/01/2.txt](../updates/01/2.txt)
