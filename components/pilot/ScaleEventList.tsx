'use client';

import { useCallback, useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type ScaleEventRow = {
  id: string;
  status: string;
  saleInvoiceId: string | null;
  createdAt: string;
  rawPayload: { barcode?: string; source?: string; pluCode?: string; weightGrams?: number };
};

export default function ScaleEventList({ pollMs = 10000 }: { pollMs?: number }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [rows, setRows] = useState<ScaleEventRow[]>([]);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const q = barcode.trim() ? `?barcode=${encodeURIComponent(barcode.trim())}` : '';
    fetch(`${base}/scale-events${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.ok) throw new Error(data.error);
        setRows(data.events ?? []);
        setError('');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'))
      .finally(() => setLoading(false));
  }, [base, barcode]);

  useEffect(() => {
    load();
    if (!pollMs) return;
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [load, pollMs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-black text-slate-500">جستجوی barcode</span>
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="POT001 یا بخشی از رشته"
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold min-w-[220px]"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-black"
        >
          اعمال فیلتر
        </button>
        {pollMs ? (
          <span className="text-xs font-bold text-emerald-600 pb-2">به‌روز خودکار هر {pollMs / 1000}s</span>
        ) : null}
      </div>

      {error ? <p className="text-rose-600 text-sm font-bold">{error}</p> : null}
      {loading && !rows.length ? <p className="text-slate-500 font-bold">در حال بارگذاری...</p> : null}
      {!loading && !rows.length && !error ? (
        <p className="text-slate-500 text-sm font-bold">هنوز رویداد ترازویی ثبت نشده.</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 font-black text-slate-500">زمان</th>
                <th className="px-4 py-2 font-black text-slate-500">وضعیت</th>
                <th className="px-4 py-2 font-black text-slate-500">منبع</th>
                <th className="px-4 py-2 font-black text-slate-500">بارکد / PLU</th>
                <th className="px-4 py-2 font-black text-slate-500">فاکتور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((ev) => (
                <tr key={ev.id}>
                  <td className="px-4 py-2 font-bold text-slate-600 whitespace-nowrap">
                    {formatDate(ev.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={ev.status} />
                  </td>
                  <td className="px-4 py-2 text-xs font-bold">{ev.rawPayload?.source ?? '—'}</td>
                  <td className="px-4 py-2 text-xs font-mono dir-ltr text-left">
                    {ev.rawPayload?.barcode ??
                      (ev.rawPayload?.pluCode
                        ? `${ev.rawPayload.pluCode} · ${ev.rawPayload.weightGrams}g`
                        : '—')}
                  </td>
                  <td className="px-4 py-2 text-xs font-bold text-slate-600">
                    {ev.saleInvoiceId ? (
                      <span title={ev.saleInvoiceId}>{ev.saleInvoiceId.slice(0, 8)}…</span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    parsed: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-rose-100 text-rose-800',
  };
  const label: Record<string, string> = {
    pending: 'در صف',
    parsed: 'موفق',
    failed: 'ناموفق',
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {label[status] ?? status}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}
