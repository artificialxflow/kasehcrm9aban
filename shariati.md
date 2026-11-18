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

Agent فعلی: **v0.2.6+** (GUI + شبیه‌سازی بدون COM). roadmap: [`todo.md`](todo.md) فاز ۴۲–۴۵ · تست دسکتاپ: [`docs/TEST-DESK-FA.md`](docs/TEST-DESK-FA.md).

---

## 2. مقادیر ثابت پایلot (هاردکد)

| نام | مقدار | استفاده |
|-----|--------|---------|
| `API_BASE` | `https://kasehcrm.ronakcare.ir` | `config.json` → `apiBase` |
| `BRANCH_ID` | `2` | مسیر URL + `config.json` → `branchId` |
| `SCALE_API_KEY` (agent) | `` (خالی در config شعبه) | `config.json` → `scaleApiKey` |
| `SCALE_API_KEY` (سرور) | تعریف در Runflare (محرمانه) | env روی CRM — باید با `scaleApiKey` config شعبه یکی باشد — [`docs/ops-scale-api-key.md`](docs/ops-scale-api-key.md) |
| `PILOT_HOSTNAME` | `FM1` | از لاگ agent (`hostname` در JSONL) |
| `SERIAL_PATH_WRONG_PILOT` | `COM10` | Intel AMT SOL — **ترازو نیست** |
| `SERIAL_PATH_PILOT` | `COM13` | `config.json` → `serial.path` |
| `SERIAL_BAUD_DEFAULT` | `19200` | پایلوت FM1 — 9600 = نویز در لاگ |
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
    "path": "COM13",
    "baudRate": 19200,
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

**Body کامل (v0.2.4+ — همان `ScaleEventBody`):**

```json
{
  "eventType": "sale",
  "clientEventId": "FM1-2026-11-17T12:00:00.000Z-a1b2c3d4",
  "deviceId": "FM1",
  "rawPayload": {
    "weightGrams": 90,
    "barcode": "     90  ",
    "source": "RS232"
  }
}
```

**چاپ pipe:**

```json
{
  "eventType": "sale",
  "clientEventId": "...",
  "deviceId": "FM1",
  "rawPayload": {
    "barcode": "POT001|225|1289000",
    "pluCode": "POT001",
    "weightGrams": 225,
    "source": "RS232"
  }
}
```

**شبیه‌سازی دسکتاپ (Bridge GUI):** `deviceId: "SIM-DESK"` — برای تست بدون ترازو.

### 3.3 Schema پیشنهادی (validation CRM)

```typescript
interface ScaleEventBody {
  eventType?: string;       // sale | manual | test
  clientEventId?: string;     // idempotency — الزامی عملی
  deviceId?: string;        // FM1 | SIM-DESK | SIM-CRM
  rawPayload: {
    barcode?: string;
    pluCode?: string;
    weightGrams?: number;
    source: "USB" | "RS232";
  };
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

- **اولویت:** `(branch_id, clientEventId)` — duplicate → `200` با همان `id`
- fallback: barcode + دقیقه

### 3.6 سیاست تأیید (چه چیز به CRM برود؟)

| منبع | به CRM؟ |
|------|---------|
| استریم خام `serial_data` | **خیر** — فقط لاگ محلی |
| Live + `stableWeightPostEnabled` | **بله** — یک POST پس از پایداری وزن |
| دکمه «ثبت فروش» Bridge | **بله** — تأیید اپراتور |
| خط pipe از چاپ | **بله** — فوری |
| GUI «شبیه‌سازی» Bridge | **بله** — با `SIM-DESK` |
| فرم **manual/test** در پنل CRM | **بله** — بدون Bridge |

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

## 7. UI سایت (فاز ۱ — الزامی برای تست)

- **لیست** رویداد شعبه ۲: `received_at`, `event_type`, `weight_grams`, `plu_code`, `device_id`, `client_event_id`
- **فرم شبیه‌سازی ترازو** (همان body §3.2): وزن (گرم)، `pluCode` اختیاری، `eventType` = `test` | `manual` | `sale` — دکمه «ارسال» → همان endpoint
- **فرم ثبت دستی مغازه** (`eventType: manual`) وقتی Bridge آفلاین
- دکمه **«تست اتصال API»** — یک POST نمونه FM1 90g و نمایش status
- توضیح UI: «استریم خام ترازو به CRM نمی‌آید؛ فقط رویداد تأییدشده / simulate / manual»

Route پیشنهادی: `/admin/branches/2/scale-events` (یا معادل در پنل شما)

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

ماتریس چهار مسیر — جزئیات Bridge: [`docs/TEST-DESK-FA.md`](docs/TEST-DESK-FA.md)

| # | مسیر | انتظار |
|---|------|--------|
| 1 | `npm test` در repo Bridge | 5 pass |
| 2 | GUI `http://127.0.0.1:3921/` → شبیه‌سازی 90g → ارسال SIM-DESK | `http_post` در لاگ |
| 3 | curl FM1 body (زیر) | ردیف در پنل CRM |
| 4 | پنل CRM → فرم شبیه‌سازی | همان ردیف |

### 9.1 Bridge GUI (0.2.4+)

`Start-Bridge.cmd` → بدون Listen: preset **FM1 90g** → **اعمال** → **ارسال فروش شبیه‌سازی**.

### 9.2 curl — FM1 padded 90g (PowerShell یک خط)

```powershell
curl.exe -sS -X POST "https://kasehcrm.ronakcare.ir/api/branches/2/scale-events" -H "Content-Type: application/json" -H "x-scale-api-key: YOUR_KEY" -d "{\"eventType\":\"sale\",\"clientEventId\":\"TEST-90g-001\",\"deviceId\":\"SIM-CRM\",\"rawPayload\":{\"weightGrams\":90,\"barcode\":\"     90  \",\"source\":\"RS232\"}}"
```

### 9.3 Demo POST از Bridge

```powershell
.\KasehScaleBridge.exe --demo-post
```

### 9.4 عیب‌یاب

| symptom | احتمال |
|---------|--------|
| 404 | route register نشده یا `branchId` اشتباه |
| 401 | `SCALE_API_KEY` / header |
| SSL error | certificate روی PC شعبه |
| timeout | firewall / DNS |

---

## 10. فعال‌سازی live در شعبه (بعد از CRM OK)

1. CRM: curl / Demo / simulate پنل → 200/201
2. شعبه: COM13 @ 19200 — لاگ `serial_data` با `rawAscii` خوانا
3. پایلوت: ترجیح **دکمه ثبت فروش** قبل از spam با Live
4. `livePostEnabled: true` + debounce (`stableWeightPostEnabled`)
5. لاگ: `http_post` 200/201

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
- [ ] تست curl و `--demo-post` موفق (بعد از فاز ۴۲ ops)
- [x] UI لیست + manual + **SIM-CRM** (`POST .../scale-events/simulate`)
- [x] ستون‌های `event_type`, `client_event_id`, `device_id` در DB
- [x] heartbeat + log upload (+ آپلود پنل)
- [x] مستند: [`docs/scale-radin-integration.md`](docs/scale-radin-integration.md)

---

## 14. مراجع repo agent

| موضوع | مسیر در KasehScaleBridge |
|--------|---------------------------|
| URL ساخت POST | `src/api/scale-events.ts` |
| Demo body | `demoPayload()` همان فایل |
| Config | `src/config.ts`, `config.example.json` |
| Parser | `src/parse/radin.ts` |
| Simulate | `src/simulate/presets.ts` |
| تحویل فارسی | `CRM-WEB-HANDOFF-FA.md` |
| کارهای agent | `todo.md` |

---

## 15. پرامپت آماده (Cursor — پروژه CRM)

```text
پروژه CRM کاسه (kasehcrm). branchId=2. مرجع: shariati.md در KasehScaleBridge (§3–7، §9).

الزامی:
1) POST /api/branches/2/scale-events — body ScaleEventBody با eventType, clientEventId, deviceId, rawPayload (نمونه FM1 90g در shariati §9.2)
2) Idempotency روی clientEventId
3) UI: لیست شعبه 2 + فرم «شبیه‌سازی ترازو» (test/manual/sale) + دکمه تست API
4) رفع 401 — SCALE_API_KEY = config شعبه scaleApiKey

تست پذیرش: فرم simulate 225g sale → ردیف در لیست؛ Bridge SIM-DESK هم همان endpoint را بزند.
```

---

**نسخه سند:** 2026-11-18 — هم‌تراز با agent **0.2.6+** و todo فاز ۴۲–۵۱
