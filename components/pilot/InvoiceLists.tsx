'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatKgFromGrams, formatToman } from '@/lib/money';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';
import { saleSourceLabelFa } from '@/lib/pilot/labels-fa';

type PurchaseRow = {
  id: string;
  invoiceNo: string | null;
  supplierName: string | null;
  purchasedAt: string;
  totalRial: string;
  lines: { weightGrams: number; catalogItem: { name: string } }[];
};

type SaleRow = {
  id: string;
  soldAt: string;
  source: string;
  scaleInvoiceNo: string | null;
  totalRial: string;
  lines: { weightGrams: number; catalogItem: { name: string } }[];
};

export function PurchaseInvoiceList({ refreshKey = 0 }: { refreshKey?: number }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch(`${base}/purchases`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRows(data.purchases ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'));
  }, [base]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (error) return <p className="text-rose-600 text-sm font-bold">{error}</p>;
  if (!rows.length) return <p className="text-slate-500 text-sm font-bold">هنوز فاکتور خریدی ثبت نشده.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <h4 className="px-4 py-3 font-black text-slate-800 border-b border-slate-100">آخرین خریدها</h4>
      <table className="w-full text-right text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 font-black text-slate-500">تاریخ</th>
            <th className="px-4 py-2 font-black text-slate-500">تأمین‌کننده</th>
            <th className="px-4 py-2 font-black text-slate-500">اقلام</th>
            <th className="px-4 py-2 font-black text-slate-500">مبلغ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2 font-bold text-slate-600">{formatDate(p.purchasedAt)}</td>
              <td className="px-4 py-2">{p.supplierName || p.invoiceNo || '—'}</td>
              <td className="px-4 py-2 text-xs">
                {p.lines.map((l, i) => (
                  <span key={i}>
                    {l.catalogItem.name} ({formatKgFromGrams(l.weightGrams)} کیلوگرم)
                    {i < p.lines.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </td>
              <td className="px-4 py-2 font-black text-orange-600">{formatToman(p.totalRial)} تومان</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SaleInvoiceList({
  refreshKey = 0,
  pollMs = 0,
}: {
  refreshKey?: number;
  pollMs?: number;
}) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch(`${base}/sales`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRows(data.sales ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'));
  }, [base]);

  useEffect(() => {
    load();
    if (!pollMs) return;
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [load, refreshKey, pollMs]);

  if (error) return <p className="text-rose-600 text-sm font-bold">{error}</p>;
  if (!rows.length) return <p className="text-slate-500 text-sm font-bold">هنوز فروشی ثبت نشده.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <h4 className="px-4 py-3 font-black text-slate-800 border-b border-slate-100">
        آخرین فروش‌ها {pollMs ? <span className="text-xs text-emerald-600">· به‌روز خودکار</span> : null}
      </h4>
      <table className="w-full text-right text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 font-black text-slate-500">زمان</th>
            <th className="px-4 py-2 font-black text-slate-500">منبع</th>
            <th className="px-4 py-2 font-black text-slate-500">اقلام</th>
            <th className="px-4 py-2 font-black text-slate-500">مبلغ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-2 font-bold text-slate-600">{formatDate(s.soldAt)}</td>
              <td className="px-4 py-2 text-xs font-bold">{saleSourceLabelFa(s.source)}</td>
              <td className="px-4 py-2 text-xs">
                {s.lines.map((l, i) => (
                  <span key={i}>
                    {l.catalogItem.name} ({formatKgFromGrams(l.weightGrams)} کیلوگرم)
                    {i < s.lines.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </td>
              <td className="px-4 py-2 font-black text-orange-600">{formatToman(s.totalRial)} تومان</td>
            </tr>
          ))}
        </tbody>
      </table>
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
