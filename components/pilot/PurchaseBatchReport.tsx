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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setMessage('');
    const params = new URLSearchParams();
    if (from) params.set('from', new Date(from).toISOString());
    if (to) params.set('to', new Date(to).toISOString());
    fetch(`${base}/report/batches?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(translateApiError(data.error));
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

  async function saveExpected(batchId: string, kgInput: string): Promise<boolean> {
    const kg = parseFloat(kgInput.replace(/,/g, '').trim());
    if (!Number.isFinite(kg) || kg <= 0) {
      setMessage('وزن پیش‌بینی معتبر نیست (کیلوگرم).');
      return false;
    }
    setMessage('');
    try {
      const res = await fetch(`${base}/report/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedKg: kg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(translateApiError(data.error));
      setMessage('پیش‌بینی فروش ذخیره شد.');
      load();
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'خطا در ذخیره');
      return false;
    }
  }

  function clearFilters() {
    setFrom('');
    setTo('');
  }

  function setLastDays(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setFrom(toDatetimeLocalValue(start));
    setTo(toDatetimeLocalValue(end));
  }

  return (
    <section className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 space-y-5 border-b border-slate-100 bg-gradient-to-l from-orange-50/80 to-white">
        <div>
          <h3 className="text-lg font-black text-slate-800">گزارش بار خرید و پیش‌بینی فروش</h3>
          <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed">
            هر بار مواد خام یک ردیف است؛ فروش وزنی به همان بار (از قدیمی‌ترین خرید) وصل می‌شود. پیش‌بینی فروش را
            می‌توانید برای هر بار دستی اصلاح کنید.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1 min-w-[11rem]">
            <span className="text-xs font-black text-slate-500">از تاریخ و ساعت</span>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white"
            />
            {from ? (
              <span className="text-[10px] text-slate-500 font-bold">{formatDateFa(from)}</span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1 min-w-[11rem]">
            <span className="text-xs font-black text-slate-500">تا تاریخ و ساعت</span>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white"
            />
            {to ? <span className="text-[10px] text-slate-500 font-bold">{formatDateFa(to)}</span> : null}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-black hover:bg-orange-600"
            >
              اعمال فیلتر
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-black"
            >
              پاک کردن
            </button>
            <button
              type="button"
              onClick={() => setLastDays(30)}
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-black"
            >
              سی روز اخیر
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {error ? <p className="text-rose-600 font-bold text-sm">{error}</p> : null}
        {message ? (
          <p
            className={`text-sm font-bold ${message.includes('خطا') || message.includes('معتبر') ? 'text-rose-600' : 'text-emerald-700'}`}
          >
            {message}
          </p>
        ) : null}
        {loading ? <p className="text-slate-500 font-bold text-sm">در حال بارگذاری…</p> : null}

        {summary && !loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard label="تعداد بار خرید" value={formatCountFa(summary.batchCount)} />
            <SummaryCard label="جمع خرید خام (کیلو)" value={kgLabel(summary.rawGrams)} />
            <SummaryCard label="جمع پیش‌بینی فروش (کیلو)" value={kgLabel(summary.expectedSellableGrams)} />
            <SummaryCard
              label="فروش تخصیص‌یافته"
              value={`${kgLabel(summary.allocatedSoldGrams)}${
                summary.variancePercent != null ? ` · ${formatPercentFa(summary.variancePercent)}` : ''
              }`}
            />
          </div>
        ) : null}

        {!loading && rows.length === 0 ? (
          <p className="text-slate-500 text-sm font-bold bg-slate-50 rounded-2xl p-4">
            هنوز باری ثبت نشده. پس از خرید مواد خام (مثلاً فیله خام با ضریب خروجی ۹۰٪) اینجا نمایش داده می‌شود.
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-right text-sm min-w-[52rem]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3 font-black whitespace-nowrap">تاریخ تحویل</th>
                  <th className="px-3 py-3 font-black">ماده خام</th>
                  <th className="px-3 py-3 font-black">تأمین‌کننده</th>
                  <th className="px-3 py-3 font-black">شماره فاکتور</th>
                  <th className="px-3 py-3 font-black">خرید (کیلو)</th>
                  <th className="px-3 py-3 font-black">پیش‌بینی فروش (کیلو)</th>
                  <th className="px-3 py-3 font-black">فروش واقعی (کیلو)</th>
                  <th className="px-3 py-3 font-black">باقی‌مانده (کیلو)</th>
                  <th className="px-3 py-3 font-black min-w-[8rem]">نسبت به پیش‌بینی</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <BatchTableRow
                    key={r.id}
                    row={r}
                    striped={i % 2 === 1}
                    onSaveExpected={(kg) => saveExpected(r.id, kg)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="text-xs text-slate-500 font-bold leading-relaxed border-t border-slate-100 pt-4">
          فروش به بارها از قدیمی‌ترین خرید به جدیدتر تخصیص می‌شود. ضریب پیش‌فرض خروجی فیله ۹۰٪ است؛ با ویرایش
          پیش‌بینی می‌توانید برای همان بار عدد دیگری بگذارید (نه کمتر از فروش ثبت‌شده روی همان بار).
        </p>
      </div>
    </section>
  );
}

function BatchTableRow({
  row,
  striped,
  onSaveExpected,
}: {
  row: BatchRow;
  striped: boolean;
  onSaveExpected: (kgInput: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [kgDraft, setKgDraft] = useState(gramsToKgInput(row.expectedSellableGrams));

  useEffect(() => {
    if (!editing) setKgDraft(gramsToKgInput(row.expectedSellableGrams));
  }, [row.expectedSellableGrams, editing]);

  const pct = row.variancePercent;

  return (
    <tr className={`border-t border-slate-100 ${striped ? 'bg-slate-50/60' : 'bg-white'}`}>
      <td className="px-3 py-3 font-bold text-slate-700 whitespace-nowrap">
        {formatDate(row.purchasedAt)}
      </td>
      <td className="px-3 py-3 font-bold text-slate-800">{row.rawName}</td>
      <td className="px-3 py-3 text-slate-600 font-bold">{row.supplierName?.trim() || '—'}</td>
      <td className="px-3 py-3 text-slate-600 font-bold">{row.invoiceNo?.trim() || '—'}</td>
      <td className="px-3 py-3 font-black text-slate-800 tabular-nums">{kgLabel(row.rawGrams)}</td>
      <td className="px-3 py-3">
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={0.001}
              step={0.001}
              value={kgDraft}
              onChange={(e) => setKgDraft(e.target.value)}
              className="w-24 px-2 py-1 rounded-lg border border-orange-200 text-sm font-bold"
              aria-label="پیش‌بینی فروش کیلوگرم"
            />
            <button
              type="button"
              onClick={async () => {
                const ok = await onSaveExpected(kgDraft);
                if (ok) setEditing(false);
              }}
              className="text-xs font-black text-orange-600"
            >
              ذخیره
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setKgDraft(gramsToKgInput(row.expectedSellableGrams));
              }}
              className="text-xs font-black text-slate-500"
            >
              انصراف
            </button>
          </div>
        ) : (
          <ExpectedCell value={row.expectedSellableGrams} onEdit={() => setEditing(true)} />
        )}
      </td>
      <td className="px-3 py-3 font-black text-slate-800 tabular-nums">{kgLabel(row.allocatedSoldGrams)}</td>
      <td className="px-3 py-3 font-bold text-slate-700 tabular-nums">{kgLabel(row.remainingExpectedGrams)}</td>
      <td className="px-3 py-3">
        {pct != null ? (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span className="text-xs font-black text-orange-800">{formatPercentFa(pct)}</span>
          </div>
        ) : (
          '—'
        )}
      </td>
    </tr>
  );
}

function ExpectedCell({ value, onEdit }: { value: number; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-black text-slate-800 tabular-nums">{kgLabel(value)}</span>
      <button type="button" onClick={onEdit} className="text-[11px] font-black text-orange-600 underline">
        ویرایش
      </button>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-4">
      <p className="text-xs font-black text-slate-500 leading-snug">{label}</p>
      <p className="text-base font-black text-slate-800 mt-2 tabular-nums">{value}</p>
    </div>
  );
}

function kgLabel(grams: number) {
  return `${formatKgFromGrams(grams)} کیلو`;
}

function formatCountFa(n: number) {
  return n.toLocaleString('fa-IR');
}

function formatPercentFa(n: number) {
  return `${n.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function formatDateFa(datetimeLocal: string) {
  try {
    return new Date(datetimeLocal).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '';
  }
}

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function gramsToKgInput(grams: number) {
  return String(grams / 1000);
}

function translateApiError(code: string) {
  switch (code) {
    case 'BELOW_ALLOCATED':
      return 'پیش‌بینی نمی‌تواند از فروش تخصیص‌یافته روی این بار کمتر باشد.';
    case 'INVALID_GRAMS':
    case 'EXPECTED_WEIGHT_REQUIRED':
      return 'وزن پیش‌بینی را به کیلوگرم معتبر وارد کنید.';
    case 'NOT_FOUND':
      return 'بار خرید پیدا نشد.';
    default:
      return code;
  }
}