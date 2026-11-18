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
              کالاها و PLU
            </Link>
            : <code className="font-mono">RAW-FILLET</code> (خام)، <code className="font-mono">FILLET01</code> (فروش وزنی).
          </li>
          <li>
            <Link href="/pilot/shariati/purchases" className="text-orange-600 underline">
              خرید وزنی
            </Link>
            : مثلاً ۱۰ kg خام.
          </li>
          <li>
            <Link href="/pilot/shariati/scale-events" className="text-orange-600 underline">
              رویداد ترازو
            </Link>
            : SIM-CRM نوع <strong>فروش</strong> + PLU <code className="font-mono">FILLET01</code> + وزن (۳۰۰، ۸۰۰ g).
          </li>
          <li>
            <Link href="/pilot/shariati/report" className="text-orange-600 underline">
              گزارش روزانه
            </Link>
            : مقایسه ورود RAW و خروج فروش.
          </li>
        </ol>
        <p className="text-xs text-slate-600">
          Bridge: با <code className="font-mono">PILOT_DEFAULT_SALE_PLU=FILLET01</code> روی سرور، ارسال وزن از SIM-DESK هم فاکتور می‌زند.
          جزئیات: <code className="font-mono">docs/fillet-pilot-flow-fa.md</code>
        </p>
      </div>
    </div>
  );
}