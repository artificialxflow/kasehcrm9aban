'use client';

import Link from 'next/link';

/** بنر راهنما برای قابلیت‌های جدید (بچ خرید، تاریخ تحویل، گزارش) */
export default function PilotFeatureBanner() {
  return (
    <aside className="rounded-2xl border-2 border-orange-200 bg-orange-50/80 p-4 space-y-2">
      <p className="text-sm font-black text-slate-800">جدید — بار خرید و پیش‌بینی فروش فیله (۹۰٪)</p>
      <ul className="text-xs font-bold text-slate-700 space-y-1 list-disc list-inside">
        <li>
          <Link href="/pilot/shariati/purchases" className="text-orange-700 underline">
            خرید وزنی
          </Link>
          : تاریخ تحویل بار + ثبت خام → بچ خودکار
        </li>
        <li>
          <Link href="/pilot/shariati/report" className="text-orange-700 underline">
            گزارش و بار خرید
          </Link>
          : پیش‌بینی در برابر فروش واقعی (FIFO)
        </li>
      </ul>
      <p className="text-[11px] text-slate-500 font-bold">
        کدها: RAW-FILLET (خام) و FILLET01 (فروش) — بدون seed کامل، بعد از ثبت هر دو در کاتالوگ rule خودکار ساخته
        می‌شود.
      </p>
    </aside>
  );
}