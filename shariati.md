# shariati.md — راهنمای پیاده‌سازی CRM (Kaseh)

این سند برای **پروژهٔ سایت / API اصلی** (`kasehcrm`) است. agent ویندوزی در repo جداگانهٔ **KasehScaleBridge** اجرا می‌شود و به این API درخواست می‌زند.

**پایلot فعلی:** شعبه با PC نام **`FM1`**، `branchId = 2`.  
**توجه:** مقادیر زیر عمداً هاردکد شده‌اند (محیط اختصاصی). فیلدهای `____________` را بعد از تست پر کنید.

---

## 1. خلاصه معماری

```text
[ترازو RADIN] --USB/RS232--> [COM روی PC شعبه]
                                    |
                                    v
                         KasehScaleBridge.exe (Windows)
                                    |
                    +---------------+---------------+
                    |                               |
              JSONL لاگ محلی                 HTTPS POST
         ProgramData\...\logs\          (حالت --live)
                    |                               |
                    v                               v
              دیباگ / parser                   [این CRM]
```

- **v1:** هر رویداد parse‌شده = یک **HTTP POST** (نه WebSocket).
- **لاگ خام** به‌صورت پیش‌فرض **روی PC** می‌ماند؛ آپلود batch = فاز ۲ (endpoint پایین).

Agent فعلی: **v0.1.0** (CLI). roadmap agent: [`todo.md`](todo.md) در repo bridge.

---

## 2. مقادیر ثابت پایلot (هاردکد)

| نام | مقدار | استفاده |
|-----|--------|---------|
| `API_BASE` | `https://kasehcrm.ronakcare.ir` | `config.json` → `apiBase` |
| `BRANCH_ID` | `2` | مسیر URL + `config.json` → `branchId` |
| `SCALE_API_KEY` (agent) | `` (خالی در config شعبه) | `config.json` → `scaleApiKey` |
| `SCALE_API_KEY` (سرور) | `____________` | env روی CRM — **بعد از تعریف کلید، اینجا و config شعبه را یکسان کنید** |
| `PILOT_HOSTNAME` | `FM1` | از لاگ agent (`hostname` در JSONL) |
| `SERIAL_PATH_WRONG_PILOT` | `COM10` | Intel AMT SOL — **ترازو نیست** |
| `SERIAL_BAUD_DEFAULT` | `9600` | `config.json` → `serial.baudRate` |
| `LIVE_POST_ENABLED_PILOT` | `false` | تا تست `--demo-post` و parser OK نشود `true` نکنید |

### مسیر config و لاگ روی PC شعبه

```text
Config:  C:\ProgramData\KasehScale\ScaleBridge\config.json
Logs:    C:\ProgramData\KasehScale\ScaleBridge\logs\bridge-YYYY-MM-DD.log
```

### نمونه `config.json` شعبه (همان پایلot)

```json
{
  "apiBase": "https://kasehcrm.ronakcare.ir",
  "branchId": "2",
  "scaleApiKey": "",
  "serial": {
    "path": "COM3",
    "baudRate": 9600,
    "dataBits": 8,
    "stopBits": 1,
    "parity": "none"
  },
  "logLevel": "debug",
  "livePostEnabled": false
}
```

**اگر مشخص نیست:** `serial.path` را بعد از Device Manager + RADIN TOOLS دستی عوض کنید (`COM3` فقط placeholder است).

---

## 3. endpoint الزامی — رویداد ترازو

### 3.1 مشخصات

| مورد | مقدار |
|------|--------|
| Method | `POST` |
| URL | `https://kasehcrm.ronakcare.ir/api/branches/2/scale-events` |
| Content-Type | `application/json` |
| Header اختیاری | `x-scale-api-key: {SCALE_API_KEY}` — **فقط اگر** env سرور `SCALE_API_KEY` پر است |

**اگر مشخص نیست:** prefix API (`/api` vs `/api/v1`) — با یک `curl` یا `--demo-post` تست کنید و مسیر نهایی را اینجا ثبت کنید: `____________`

### 3.2 Body — همان چیزی که agent می‌فرستد

Agent (`KasehScaleBridge`) body را **بدون wrap اضافه** JSON.stringify می‌کند:

**Demo (`--demo-post`):**

```json
{
  "rawPayload": {
    "barcode": "POT001|225|1289000",
    "source": "USB"
  }
}
```

**Live (پس از parse):** همان ساختار؛ فیلدهای داخل `rawPayload` با parser واقعی تکمیل می‌شوند، مثلاً:

```json
{
  "rawPayload": {
    "barcode": "626564512|420000|1289000",
    "pluCode": "1001",
    "weightGrams": 225,
    "source": "USB"
  },
  "deviceId": "____________"
}
```

**اگر مشخص نیست:** `deviceId` — فعلاً agent نمی‌فرستد؛ در CRM اختیاری نگه دارید تا v0.2.

### 3.3 Schema پیشنهادی (validation CRM)

```typescript
// قرارداد منطقی — با stack خودتان map کنید
interface ScaleEventBody {
  rawPayload: {
    barcode?: string;      // often "PLU|weight|price" or full label string
    pluCode?: string;
    weightGrams?: number;
    source: "USB" | "RS232";
  };
  deviceId?: string;
}
```

قوانین پیشنهادی:

- `rawPayload` **الزامی**
- `rawPayload.source` **الزامی** (agent همیشه `"USB"` یا `"RS232"` می‌فرستد)
- حداقل یکی از `barcode` | (`pluCode` + `weightGrams`) برای accept — **اگر مشخص نیست:** فعلاً فقط `barcode` non-empty کافی است (مثل demo).

### 3.4 پاسخ HTTP (برای لاگ agent)

| Status | معنی | body پیشنهادی |
|--------|------|----------------|
| `200` یا `201` | ذخیره OK | `{"ok":true,"id":"..."}` |
| `401` | کلید API اشتباه / نبود | `{"ok":false,"error":"unauthorized"}` |
| `404` | route یا branchId | `{"ok":false,"error":"not_found"}` |
| `422` | validation | `{"ok":false,"error":"validation","fields":{...}}` |
| `500` | خطای سرور | متن کوتاه — agent تا 2000 کاراکتر در لاگ می‌گذارد |

**اگر مشخص نیست:** فرمت JSON پاسخ — agent فقط `response.ok` و متن body را لاگ می‌کند؛ ساختار دقیق CRM را بعداً مستند کنید.

### 3.5 Idempotency (توصیه)

ترازو ممکن است یک barcode را دوباره بفرستد.

- کلید یکتا پیشنهادی: `(branch_id=2, barcode, date_trunc_minute(received_at))`
- یا hash(body) + branch

**اگر مشخص نیست:** سیاست duplicate — `____________` (ignore / update / insert always)

---

## 4. ذخیره در دیتابیس (پیشنهاد)

جدول پیشنهادی: `scale_events`

| ستون | نوع | توضیح |
|------|-----|--------|
| `id` | bigint PK | auto |
| `branch_id` | int | `2` پایلot |
| `received_at` | timestamp | server now |
| `barcode` | varchar nullable | از `rawPayload.barcode` |
| `plu_code` | varchar nullable | |
| `weight_grams` | int nullable | |
| `source` | varchar | USB / RS232 |
| `raw_json` | json/text | کل body |
| `agent_ip` | varchar nullable | از `X-Forwarded-For` یا `req.ip` |

**اگر مشخص نیست:**

- `DATABASE_URL=____________`
- نام جدول/ migration path: `____________`

---

## 5. env سرور (CRM) — چک‌لیست

فایل `.env` یا secrets production:

```env
# الزامی اگر auth فعال است
SCALE_API_KEY=____________

# پایلot
BRANCH_PILOT_ID=2

# اختیاری
APP_URL=https://kasehcrm.ronakcare.ir
DATABASE_URL=____________

# CORS — برای POST از agent لازم نیست (server-side از PC)
# SCALE_EVENTS_RATE_LIMIT_PER_MIN=____________
```

**منطق auth پیشنهادی:**

```text
IF env.SCALE_API_KEY is empty:
    accept POST without x-scale-api-key (فقط برای dev — در prod توصیه نمی‌شود)
ELSE:
    require header x-scale-api-key == env.SCALE_API_KEY
```

---

## 6. پیاده‌سازی handler (شبه‌کد)

```text
POST /api/branches/:branchId/scale-events

1. if branchId != "2" (یا lookup DB): 404
2. if SCALE_API_KEY set and header mismatch: 401
3. parse JSON body → validate rawPayload
4. idempotency check
5. INSERT scale_events
6. optional: dispatch job / notify UI / link to order module
7. return 201 + { ok: true, id: ... }
```

**اگر مشخص نیست — ماژول کسب‌وکار بعد از insert:**

- مسیر کد سفارش/فاکتور: `____________`
- Event name داخلی (queue): `____________`

---

## 7. UI سایت (اختیاری)

- صفحه مانیتoring شعبه 2: آخرین N رویداد از `scale_events`
- فیلتر تاریخ + جستجو barcode

**اگر مشخص نیست:**

- Route UI: `____________` (مثلاً `/admin/branches/2/scale-events`)
- نقش دسترسی: `____________` (admin / branch_manager)

---

## 8. endpointهای فاز ۲ (agent هنوز نمی‌فرستد — آماده‌سازی CRM)

### 8.1 Heartbeat

| مورد | مقدار |
|------|--------|
| URL | `POST https://kasehcrm.ronakcare.ir/api/branches/2/scale-agent/heartbeat` |
| Auth | همان `x-scale-api-key` |

Body نمونه (v0.2 agent):

```json
{
  "agentVersion": "0.2.0",
  "hostname": "FM1",
  "comPort": "COM3",
  "baudRate": 9600,
  "mode": "live",
  "lastSerialDataAt": "2026-11-02T12:00:00.000Z",
  "livePostEnabled": true
}
```

جدول پیشنهادی: `scale_agent_heartbeats` (branch_id, hostname, last_seen_at, payload json).

### 8.2 آپلود batch لاگ (اختیاری)

| مورد | مقدار |
|------|--------|
| URL | `POST https://kasehcrm.ronakcare.ir/api/branches/2/scale-agent/logs` |
| Body | `{ "lines": [ "...json line...", ... ] }` یا multipart file |

**اگر مشخص نیست:** max size / retention: `____________`

---

## 9. تست از دفتر (بدون ترازو)

### 9.1 با agent روی Windows

```powershell
cd "C:\Users\M S\Downloads\KasehScaleBridge-v0.1.0-win-x64"
.\KasehScaleBridge.exe --demo-post
```

انتظار: `Demo POST OK (200)` یا `(201)`.

Config پیش‌فرض: `C:\ProgramData\KasehScale\ScaleBridge\config.json`  
با کلید:

```json
"scaleApiKey": "____________"
```

(همان مقدار `SCALE_API_KEY` روی سرور)

### 9.2 curl (معادل Postman)

**بدون API key (فقط اگر سرور key نخواهد):**

```bash
curl -sS -X POST "https://kasehcrm.ronakcare.ir/api/branches/2/scale-events" \
  -H "Content-Type: application/json" \
  -d "{\"rawPayload\":{\"barcode\":\"POT001|225|1289000\",\"source\":\"USB\"}}"
```

**با API key:**

```bash
curl -sS -X POST "https://kasehcrm.ronakcare.ir/api/branches/2/scale-events" \
  -H "Content-Type: application/json" \
  -H "x-scale-api-key: ____________" \
  -d "{\"rawPayload\":{\"barcode\":\"POT001|225|1289000\",\"source\":\"USB\"}}"
```

### 9.3 عیب‌یاب

| symptom | احتمال |
|---------|--------|
| 404 | route register نشده یا `branchId` اشتباه |
| 401 | `SCALE_API_KEY` / header |
| SSL error | certificate روی PC شعبه |
| timeout | firewall / DNS |

---

## 10. فعال‌سازی live در شعبه (بعد از CRM OK)

1. CRM: `--demo-post` یا curl → 200/201
2. شعبه: لاگ با `serial_data` + parser در agent به‌روز
3. `config.json`: `"livePostEnabled": true`
4. `.\KasehScaleBridge.exe --live`
5. لاگ agent: `parse_ok`, `http_post` با `httpStatus` 200/201

**اگر مشخص نیست:** SLA مانیتoring (alert اگر ۱ ساعت heartbeat/رویداد نیامد): `____________`

---

## 11. ارتباط با بارکد/PLU ترازو (Sample.xlsx)

در پایلot، PLU نمونه در اکسل RADIN (ستون barcode مثل `626564512`…) با قیمت `420000` و کد `1001`.

خروجی سریال/چاپ ترازو **ممکن است** همان رشته pipe باشد — تا وقتی `rawLine` از لاگ شعبه نیامده، در CRM فقط demo `POT001|225|1289000` را implement کنید.

**اگر مشخص نیست:** mapping barcode → product_id در CRM: `____________`

---

## 12. ریسک‌های شناخته‌شده (از پایلot)

| ریسک | اثر | mitigation |
|------|-----|------------|
| COM اشتباه (Intel SOL) | هیچ داده‌ای | Device Manager + `--list-ports` (v0.2) |
| `serial_open` بدون داده | false green | heartbeat + `data_stale` در agent |
| دو instance agent | Access denied | lock file (v0.2) |
| قطع اینternet | از دست POST | queue (v0.2) + retry |
| parser ناقص | `parse_fail` | لاگ خام + تکمیل `radin.ts` |

---

## 13. چک‌لیست تحویل CRM (printable)

- [x] Route `POST /api/branches/2/scale-events` registered
- [x] Validation `rawPayload` + پاسخ 422 واضح
- [x] Auth `x-scale-api-key` مطابق env
- [x] INSERT DB + idempotency
- [x] تست curl و `--demo-post` موفق (نیاز به `source: USB|RS232`)
- [x] UI لیست رویدادها (`/pilot/shariati/scale-events`)
- [x] (فاز ۲) heartbeat + log upload routes
- [x] مستند داخلی CRM: [docs/scale-radin-integration.md](docs/scale-radin-integration.md) + این سند

---

## 14. مراجع repo agent

| موضوع | مسیر در KasehScaleBridge |
|--------|---------------------------|
| URL ساخت POST | `src/api/scale-events.ts` |
| Demo body | `demoPayload()` همان فایل |
| Config | `src/config.ts`, `config.example.json` |
| Parser | `src/parse/radin.ts` |
| کارهای agent | `todo.md` |

---

**نسخه سند:** 2026-11-02 — هم‌تراز با agent **0.1.0**
