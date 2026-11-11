import Link from 'next/link';
import PilotNav from '@/components/pilot/PilotNav';

export const metadata = { title: 'راهنمای ترازو | پایلوت شریعتی' };

export default function ScaleGuidePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">راهنمای اپراتور — ترازو</h2>
      <PilotNav />
      <div className="prose prose-slate max-w-none text-sm font-bold leading-relaxed space-y-4 text-slate-700">
        <p>
          <strong>رویداد ترازو</strong> = مانیتور Bridge و رویدادهای سرور.{' '}
          <strong>فروش ترازو</strong> = فاکتور دستی اضطراری.
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>Bridge OK: Agent آنلاین + ردیف فروش موفق در لیست.</li>
          <li>401: کلید <code>SCALE_API_KEY</code> سرور = <code>scaleApiKey</code> در config شعبه.</li>
          <li>failed: PLU در{' '}
            <Link href="/pilot/shariati/catalog" className="text-orange-600">
              کالاها و PLU
            </Link>
            .
          </li>
          <li>قطع ترازو: ثبت manual در{' '}
            <Link href="/pilot/shariati/scale-events" className="text-orange-600">
              رویداد ترازو
            </Link>
            .
          </li>
        </ul>
        <p className="text-xs text-slate-500">
          نسخهٔ کامل در repo: docs/operator-scale-day-fa.md
        </p>
      </div>
    </div>
  );
}
