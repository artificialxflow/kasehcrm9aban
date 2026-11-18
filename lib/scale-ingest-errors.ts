export type ScaleIngestErrorCode =
  | "PARSE_FAILED"
  | "ITEM_NOT_FOUND"
  | "PROCESS_FAILED"
  | "INSUFFICIENT_STOCK"
  | "NO_LINES"
  | "INVALID_SALE_ITEM_TYPE";

const MESSAGES_FA: Record<ScaleIngestErrorCode, string> = {
  PARSE_FAILED:
    "خواندن بارکد یا وزن ممکن نشد. برای فروش وزنی کد فروش و فی کیلو در کاتالوگ لازم است؛ برای وزن‌تنها روی میز (SIM-DESK/FM1) متغیر PILOT_DEFAULT_SALE_PLU را روی سرور بگذارید.",
  ITEM_NOT_FOUND:
    "کد فروش در کاتالوگ این شعبه پیدا نشد یا قیمت کیلوگرم ندارد.",
  PROCESS_FAILED: "ثبت فاکتور فروش از ترازو ناموفق بود.",
  INSUFFICIENT_STOCK:
    "موجودی این کالا برای این فروش کافی نیست. از «تعدیل موجودی» در خلاصه پایلوت مقدار کالای فروش (مثلاً فیله سوخاری) را اضافه کنید.",
  NO_LINES: "هیچ قلم فروشی برای فاکتور ساخته نشد.",
  INVALID_SALE_ITEM_TYPE:
    "نوع کالا برای فروش وزنی مناسب نیست — باید «فروش وزنی» باشد و فی کیلوگرم داشته باشد.",
};

export function scaleIngestErrorMessageFa(code: ScaleIngestErrorCode): string {
  return MESSAGES_FA[code] ?? MESSAGES_FA.PROCESS_FAILED;
}

export function normalizeScaleProcessError(err: unknown): ScaleIngestErrorCode {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "PROCESS_FAILED";
  if (msg in MESSAGES_FA) return msg as ScaleIngestErrorCode;
  return "PROCESS_FAILED";
}