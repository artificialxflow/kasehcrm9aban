/** برچسب‌های فارسی UI پایلوت — مقادیر فنی API در جداول با font-mono */

export function scaleEventStatusLabelFa(status: string): string {
  const map: Record<string, string> = {
    pending: 'در صف',
    parsed: 'موفق',
    failed: 'ناموفق',
  };
  return map[status] ?? status;
}

export function scaleEventTypeLabelFa(type: string): string {
  const map: Record<string, string> = {
    sale: 'فروش',
    manual: 'دستی',
    prep_in: 'ورود پخت',
    prep_out: 'خروج پخت',
    waste: 'ضایعات',
  };
  return map[type] ?? type;
}

export function catalogTypeLabelFa(type: string): string {
  const map: Record<string, string> = {
    RAW: 'مواد خام',
    WEIGHED_SALE: 'فروش وزنی',
    PIECE: 'عددی',
  };
  return map[type] ?? type;
}

export function saleSourceLabelFa(source: string): string {
  const map: Record<string, string> = {
    SCALE_SERIAL: 'ترازو (درگاه)',
    MANUAL: 'دستی پنل',
    PANEL: 'پنل',
  };
  return map[source] ?? 'سایر';
}

export function scaleConnectionLabelFa(conn: string): string {
  const map: Record<string, string> = {
    RS232: 'پورت سریال',
    USB: 'یو‌اس‌بی',
    PS2: 'پی‌اس/۲',
    BARCODE_ONLY: 'فقط بارکد',
  };
  return map[conn] ?? conn;
}