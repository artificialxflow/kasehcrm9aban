# یکپارچه‌سازی ترازو RADIN (فاز ۲)

## سخت‌افزار (شعبه شریعتی)

- مدل: RADIN
- پورت‌ها: CASH, PS2, RS-232, USB
- All-in-One به‌عنوان میزبان

## فاز ۱ (فعلی)

- ثبت دستی فاکتور در `/pilot/shariati/sales`
- بارکد stub: `PLU|weightGrams|unitPriceRialPerKg` (مثال: `POT001|225|1289000`)
- API: `POST /api/branches/2/sales`

## فاز ۲ (USB / RS-232)

1. سرویس واسط محلی (پیشنهاد: `scripts/scale-bridge/`) که از پورت سریال/USB داده می‌خواند.
2. ارسال payload به `POST /api/branches/{branchId}/scale-events`:

```json
{
  "deviceId": "optional-scale-device-cuid",
  "rawPayload": {
    "barcode": "POT001|225|1289000",
    "source": "RS232"
  }
}
```

3. سرور رویداد را در `ScaleIntegrationEvent` ذخیره می‌کند و در صورت parse موفق، `SaleInvoice` با `source=SCALE_SERIAL` می‌سازد.

## تست بدون سخت‌افزار

```bash
curl -X POST http://localhost:3000/api/branches/2/scale-events \
  -H "Content-Type: application/json" \
  -d "{\"rawPayload\":{\"barcode\":\"POT001|225|1289000\"}}"
```

## مستندات بیشتر

- نیازمندی‌ها: [updates/01/2.txt](../updates/01/2.txt)
