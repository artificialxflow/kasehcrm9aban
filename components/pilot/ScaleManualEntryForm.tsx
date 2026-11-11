'use client';

import { useCallback, useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type CatalogRow = {
  id: string;
  pluCode: string;
  name: string;
  type: string;
};

export default function ScaleManualEntryForm({ onSaved }: { onSaved?: () => void }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [items, setItems] = useState<CatalogRow[]>([]);
  const [pluCode, setPluCode] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCatalog = useCallback(() => {
    fetch(`${base}/catalog`)
      .then((r) => r.json())
      .then((data) => {
        const list = (data.items ?? []).filter(
          (i: CatalogRow) => i.type === 'WEIGHED_SALE',
        ) as CatalogRow[];
        setItems(list);
        if (list.length && !pluCode) setPluCode(list[0].pluCode);
      })
      .catch(() => setError('بارگذاری کatalog ناموفق'));
  }, [base, pluCode]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const weight = parseInt(weightGrams, 10);
    if (!pluCode || !Number.isFinite(weight) || weight <= 0) {
      setError('PLU و وزن (گرم) معتبر وارد کنید.');
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`${base}/scale-events/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPayload: {
            source: 'RS232',
            pluCode,
            weightGrams: weight,
            note: note.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? 'ثبت ناموفق');
      setMessage('رویداد دستی ثبت شد (بدون فاکتور خودکار؛ در صورت نیاز از صفحه فروش استفاده کنید).');
      setWeightGrams('');
      setNote('');
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4"
    >
      <h3 className="text-lg font-black text-slate-800">ثبت دستی رویداد ترازو</h3>
      <p className="text-xs font-bold text-slate-500">
        وقتی Bridge یا ترازو آفلاین است؛ نوع رویداد: manual
      </p>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 min-w-[200px]">
          <span className="text-xs font-black text-slate-500">کالای وزنی (PLU)</span>
          <select
            value={pluCode}
            onChange={(ev) => setPluCode(ev.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
          >
            {items.map((i) => (
              <option key={i.id} value={i.pluCode}>
                {i.pluCode} — {i.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-black text-slate-500">وزن (گرم)</span>
          <input
            type="number"
            min={1}
            value={weightGrams}
            onChange={(ev) => setWeightGrams(ev.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold w-32"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <span className="text-xs font-black text-slate-500">یادداشت</span>
          <input
            value={note}
            onChange={(ev) => setNote(ev.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
            placeholder="اختیاری"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-xl bg-slate-800 text-white text-sm font-black disabled:opacity-50"
      >
        {saving ? 'در حال ثبت...' : 'ثبت manual'}
      </button>
      {error ? <p className="text-rose-600 text-sm font-bold">{error}</p> : null}
      {message ? <p className="text-emerald-700 text-sm font-bold">{message}</p> : null}
    </form>
  );
}
