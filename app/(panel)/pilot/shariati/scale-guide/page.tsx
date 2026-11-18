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
          <strong>رویداد ترازو</strong> = پایش پل ترازو و رویدادهای سرور.{' '}
          <strong>فروش ترازو</strong> = فاکتور دستی اضطراری.
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>پل سالم: نماینده آنلاین + ردیف فروش موفق در لیست.</li>
          <li>
            خطای ۴۰۱: کلید درگاه ترازو روی سرور باید با کلید تنظیم‌شده روی رایانهٔ شعبه یکی باشد.
          </li>
          <li>
            ناموفق: کد فروش در{' '}
            <Link href="/pilot/shariati/catalog" className="text-orange-600">
              کالاها و کد فروش
            </Link>{' '}
            نیست.
          </li>
          <li>
            قطع ترازو: ثبت دستی در{' '}
            <Link href="/pilot/shariati/scale-events" className="text-orange-600">
              رویداد ترازو
            </Link>
            .
          </li>
        </ul>
        <p className="text-xs text-slate-500">
          نسخهٔ کامل در مستند «روز اپراتور ترازو» داخل پوشهٔ docs پروژه.
        </p>
      </div>
    </div>
  );
}