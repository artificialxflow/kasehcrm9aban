'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { formatKgFromGrams } from '@/lib/money';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type Setup = {
  yieldBpsDefault: number;
  rawFillet: { name: string; pluCode: string } | null;
  saleFillet: { name: string; pluCode: string } | null;
  yieldRule: { yieldBps: number } | null;
  readyForBatchTest: boolean;
  readyForScaleWeightOnly?: boolean;
  batchCount: number;
  batchTotals: {
    rawGrams: number;
    expectedSellableGrams: number;
    allocatedSoldGrams: number;
  };
  recentBatches: {
    rawGrams: number;
    expectedSellableGrams: number;
    allocatedSoldGrams: number;
    remainingExpectedGrams: number;
  }[];
};

export default function ManualTestWalkthrough() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch(`${base}/pilot-setup`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSetup(data.setup);
        setError('');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'));
  }, [base]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [load]);

  const stdSaleGrams = 1600;
  const stdExpectedAfter10kg = 9000;

  return (
    <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black text-slate-800">تست دستی: خام با تاریخ → فروش گرم‌به‌گرم → برآورد</h3>
        <button
          type="button"
          onClick={load}
          className="text-xs font-black text-orange-600 underline"
        >
          به‌روزرسانی وضعیت
        </button>
      </div>

      {error ? <p className="text-rose-600 text-sm font-bold">{error}</p> : null}

      <StatusGrid setup={setup} />

      <ol className="text-sm font-bold text-slate-700 space-y-4 list-decimal pr-5">
        <Step title="تعریف کالا (بدون seed)">
          در{' '}
          <Link href="/pilot/shariati/catalog" className="text-orange-600 underline">
            کالاها
          </Link>
          :<br />
          <span className="font-mono text-xs dir-ltr inline-block mt-1">
            RAW-FILLET
          </span>{' '}
          نوع خام ·{' '}
          <span className="font-mono text-xs dir-ltr">FILLET01</span> نوع فروش وزنی · فی
          مثلاً ۴۸۰۰۰ تومان/کیلو.
          <br />
          اختیاری انبار: <span className="font-mono text-xs dir-ltr">RAW-FLOUR</span>،{' '}
          <span className="font-mono text-xs dir-ltr">RAW-OIL</span> (فقط موجودی؛ در بچ فیله
          نیست).
        </Step>
        <Step title="خرید ۱۰ کیلو خام + تاریخ">
          <Link href="/pilot/shariati/purchases" className="text-orange-600 underline">
            خرید وزنی
          </Link>
          : فیله خام · وزن <strong>10</strong> کیلو · تاریخ تحویل بار را ست کنید.
          <br />
          انتظار: بچ با خام <strong>۱۰٬۰۰۰ گرم</strong>، پیش‌بینی فروش{' '}
          <strong>۹٬۰۰۰ گرم</strong> (۹۰٪).
        </Step>
        <Step title="سه فروش از ترازو">
          <Link href="/pilot/shariati/scale-events" className="text-orange-600 underline">
            رویداد ترازو
          </Link>
          ، نوع <strong>فروش</strong>، کد <span className="font-mono dir-ltr text-xs">FILLET01</span>:
          <strong> ۳۰۰ + ۵۰۰ + ۸۰۰</strong> گرم (جمع <strong>{stdSaleGrams}</strong> گرم).
        </Step>
        <Step title="بررسی گزارش">
          <Link href="/pilot/shariati/report" className="text-orange-600 underline">
            گزارش و بار خرید
          </Link>
          : فروش تخصیص‌یافته ≈ <strong>{stdSaleGrams} g</strong>، باقی‌مانده نظری ≈{' '}
          <strong>{stdExpectedAfter10kg - stdSaleGrams} g</strong>، ٪ پیش‌بینی ≈{' '}
          <strong>{Math.round((stdSaleGrams / stdExpectedAfter10kg) * 1000) / 10}٪</strong>.
        </Step>
      </ol>

      {setup && setup.batchCount > 0 ? (
        <TrackBox setup={setup} stdExpected={stdExpectedAfter10kg} stdSold={stdSaleGrams} />
      ) : (
        <p className="text-xs text-slate-500 font-bold">هنوز بچ خریدی ثبت نشده — گام ۲ را انجام دهید.</p>
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed">
        جزئیات: <code className="text-xs">docs/manual-test-fillet-inventory-fa.md</code> — آرد/روغن در
        فاز بعد (BOM) به برآورد فروش وصل می‌شوند.
      </p>
    </section>
  );
}

function StatusGrid({ setup }: { setup: Setup | null }) {
  const checks = [
    {
      ok: setup?.rawFillet,
      label: `کالای خام ${setup?.rawFillet?.pluCode ?? 'RAW-FILLET'}`,
    },
    {
      ok: setup?.readyForScaleWeightOnly ?? setup?.saleFillet,
      label: `فروش وزنی ${setup?.saleFillet?.pluCode ?? 'FILLET01'} + فی کیلو`,
    },
    {
      ok: setup?.yieldRule || (setup?.rawFillet && setup?.saleFillet),
      label: `قانون ${setup?.yieldRule?.yieldBps ?? setup?.yieldBpsDefault ?? 9000} bps (خودکار پس از کالاها)`,
    },
    {
      ok: setup && setup.batchCount > 0,
      label: `حداقل یک بچ خرید (${setup?.batchCount ?? 0})`,
    },
    {
      ok: setup && setup.batchTotals.allocatedSoldGrams > 0,
      label: `فروش تخصیص‌یافته (${setup?.batchTotals.allocatedSoldGrams ?? 0} g)`,
    },
  ];

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {checks.map((c) => (
        <li
          key={c.label}
          className={`text-xs font-black px-3 py-2 rounded-xl border ${
            c.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          {c.ok ? '✓' : '○'} {c.label}
        </li>
      ))}
    </ul>
  );
}

function TrackBox({
  setup,
  stdExpected,
  stdSold,
}: {
  setup: Setup;
  stdExpected: number;
  stdSold: number;
}) {
  const { batchTotals } = setup;
  const matchExpected = batchTotals.expectedSellableGrams === stdExpected;
  const matchSold = batchTotals.allocatedSoldGrams === stdSold;

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs font-bold space-y-2">
      <p className="text-slate-800 font-black">پیشرفت نسبت به سناریو استاندارد (۱۰ kg + ۱۶۰۰ g فروش)</p>
      <table className="w-full text-right">
        <thead>
          <tr className="text-slate-500">
            <th className="py-1">معیار</th>
            <th className="py-1">شما</th>
            <th className="py-1">هدف تست</th>
            <th className="py-1" />
          </tr>
        </thead>
        <tbody className="font-mono dir-ltr text-left text-slate-800">
          <tr>
            <td className="py-1 text-right font-sans">پیش‌بینی</td>
            <td>{batchTotals.expectedSellableGrams} g</td>
            <td>{stdExpected} g</td>
            <td>{matchExpected || batchTotals.expectedSellableGrams > 0 ? '✓' : '—'}</td>
          </tr>
          <tr>
            <td className="py-1 text-right font-sans">فروش تخصیص</td>
            <td>{batchTotals.allocatedSoldGrams} g</td>
            <td>{stdSold} g</td>
            <td>{matchSold ? '✓' : batchTotals.allocatedSoldGrams > 0 ? '~' : '—'}</td>
          </tr>
          <tr>
            <td className="py-1 text-right font-sans">خام (بچ)</td>
            <td colSpan={2}>
              {formatKgFromGrams(batchTotals.rawGrams)}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li>
      <span className="text-slate-900">{title}</span>
      <div className="mt-1 font-bold text-slate-600 leading-relaxed">{children}</div>
    </li>
  );
}
