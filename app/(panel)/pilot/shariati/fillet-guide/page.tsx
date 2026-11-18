import Link from 'next/link';
import PilotNav from '@/components/pilot/PilotNav';

export const metadata = { title: 'پایلوت فیله | شریعتی' };

export default function FilletGuidePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">پایلوت فیله مرغ — تست بدون ترازو</h2>
      <PilotNav />
      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5 space-y-4 text-sm font-bold text-slate-700">
        <ol className="list-decimal pr-6 space-y-3">
          <li>
            <Link href="/pilot/shariati/catalog" className="text-orange-600 underline">
              کالاها و کد فروش
            </Link>
            : خام با کد{' '}
            <span className="font-mono text-xs" dir="ltr">
              RAW-FILLET
            </span>
            ، فروش وزنی با کد{' '}
            <span className="font-mono text-xs" dir="ltr">
              FILLET01
            </span>
            .
          </li>
          <li>
            <Link href="/pilot/shariati/purchases" className="text-orange-600 underline">
              خرید وزنی
            </Link>
            : مثلاً ۱۰ کیلوگرم خام.
          </li>
          <li>
            <Link href="/pilot/shariati/scale-events" className="text-orange-600 underline">
              رویداد ترازو
            </Link>
            : شبیه‌سازی نوع <strong>فروش</strong> + کد فروش فیله + وزن (۳۰۰ و ۸۰۰ گرم).
          </li>
          <li>
            <Link href="/pilot/shariati/report" className="text-orange-600 underline">
              گزارش روزانه
            </Link>
            : مقایسهٔ ورود خام و خروج فروش.
          </li>
        </ol>
        <p className="text-xs text-slate-600 leading-relaxed">
          اگر پل ترازو فقط وزن می‌فرستد، روی سرور «کد فروش پیش‌فرض پایلوت» را روی همان کد فیله تنظیم کنید تا
          از میز آزمایشی دفتر هم فاکتور زده شود. جزئیات در سند «فلو پایلوت فیله» داخل مستندات پروژه.
        </p>
      </div>
    </div>
  );
}