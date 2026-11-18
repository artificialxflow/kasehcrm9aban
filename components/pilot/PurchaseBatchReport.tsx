'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatKgFromGrams } from '@/lib/money';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type BatchRow = {
  id: string;
  purchasedAt: string;
  invoiceNo: string | null;
  supplierName: string | null;
  rawName: string;
  rawGrams: number;
  expectedSellableGrams: number;
  allocatedSoldGrams: number;
  remainingExpectedGrams: number;
  variancePercent: number | null;
};

type BatchSummary = {
  batchCount: number;
  rawGrams: number;
  expectedSellableGrams: number;
  allocatedSoldGrams: number;
  remainingExpectedGrams: number;
  variancePercent: number | null;
};

export default function PurchaseBatchReport() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', new Date(from).toISOString());
    if (to) params.set('to', new Date(to).toISOString());
    fetch(`${base}/report/batches?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRows(data.report?.rows ?? []);
        setSummary(data.report?.summary ?? null);
        setError('');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'))
      .finally(() => setLoading(false));
  }, [base, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden space-y-4 p-5">
      <BatchReportHeader />
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-black text-slate-500">از تاریخ</span>
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-black text-slate-500">تا تاریخ</span>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
          />
        </label>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-black"
        >
          اعمال فیلتر
        </button>
      </div>

      {error ? <p className="text-rose-600 font-bold text-sm">{error}</p> : null}
      {loading ? <p className="text-slate-500 font-bold text-sm">در حال بارگذاری...</p> : null}

      {summary && !loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="تعداد بچ" value={String(summary.batchCount)} />
          <SummaryCard label="جمع خرید خام" value={formatKgFromGrams(summary.rawGrams)} />
          <SummaryCard label="پیش‌بینی فروش" value={formatKgFromGrams(summary.expectedSellableGrams)} />
          <SummaryCard
            label="فروش تخصیص‌یافته"
            value={`${formatKgFromGrams(summary.allocatedSoldGrams)}${
              summary.variancePercent != null ? ` (${summary.variancePercent}٪)` : ''
            }`}
          />
        </div>
      ) : null}

      {!loading && rows.length === 0 ? (
        <p className="text-slate-500 text-sm font-bold">
          بچ خریدی ثبت نشده — پس از خرید مواد خام با قانون تولید (مثلاً فیله ۹۰٪) اینجا نمایش داده می‌شود.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 font-black text-slate-500">تاریخ تحویل</th>
                <th className="px-3 py-2 font-black text-slate-500">ماده خام</th>
                <th className="px-3 py-2 font-black text-slate-500">خرید (کیلو)</th>
                <th className="px-3 py-2 font-black text-slate-500">پیش‌بینی فروش</th>
                <th className="px-3 py-2 font-black text-slate-500">فروش واقعی</th>
                <th className="px-3 py-2 font-black text-slate-500">باقی‌مانده</th>
                <th className="px-3 py-2 font-black text-slate-500">٪ از پیش‌بینی</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-bold text-slate-700">{formatDate(r.purchasedAt)}</td>
                  <td className="px-3 py-2 font-bold">{r.rawName}</td>
                  <td className="px-3 py-2 font-mono dir-ltr text-left">{formatKgFromGrams(r.rawGrams)}</td>
                  <td className="px-3 py-2 font-mono dir-ltr text-left">
                    {formatKgFromGrams(r.expectedSellableGrams)}
                  </td>
                  <td className="px-3 py-2 font-mono dir-ltr text-left">
                    {formatKgFromGrams(r.allocatedSoldGrams)}
                  </td>
                  <td className="px-3 py-2 font-mono dir-ltr text-left">
                    {formatKgFromGrams(r.remainingExpectedGrams)}
                  </td>
                  <td className="px-3 py-2 font-bold text-orange-700">
                    {r.variancePercent != null ? `${r.variancePercent}٪` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="text-xs text-slate-500 font-bold leading-relaxed">
        تخصیص فروش به بچ با FIFO (قدیمی‌ترین خرید اول) انجام می‌شود. ضریب فیله: ۹۰٪ — از seed/rule شعبه.
      </p>
    </div>
  );
}

function BatchReportHeader() {
  return (
    <div>
      <h3 className="text-lg font-black text-slate-800">گزارش بار خرید و پیش‌بینی فروش</h3>
      <p className="text-xs font-bold text-slate-600 mt-1">
        هر خرید مواد خام یک «بچ» است؛ فروش‌های FILLET01 به همان بچ‌ها وصل می‌شوند.
      </p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-3">
      <p className="text-xs font-black text-slate-500">{label}</p>
      <p className="text-sm font-black text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}