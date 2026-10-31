'use client';

import { useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type Item = { id: string; name: string };

export default function StockAdjustForm({ onSuccess }: { onSuccess?: () => void }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [items, setItems] = useState<Item[]>([]);
  const [catalogItemId, setCatalogItemId] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${base}/catalog`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.items as Item[];
        setItems(list);
        if (list[0]) setCatalogItemId(list[0].id);
      })
      .catch(() => setMessage('خطا در بارگذاری کالاها'));
  }, [base]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${base}/stock/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogItemId,
          quantityKg: parseFloat(quantityKg),
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setMessage('موجودی به‌روز شد.');
      onSuccess?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-slate-100 space-y-4 max-w-xl">
      <h3 className="text-lg font-black text-slate-800">تعدیل موجودی (شمارش انبار)</h3>
      <p className="text-xs text-slate-500 font-bold">مقدار نهایی بر حسب کیلوگرم — نه افزایش/کاهش.</p>
      <div className="space-y-1">
        <label className="text-xs font-black text-slate-500">کالا</label>
        <select
          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
          value={catalogItemId}
          onChange={(e) => setCatalogItemId(e.target.value)}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-black text-slate-500">موجودی واقعی (kg)</label>
        <input
          required
          type="number"
          min={0}
          step="0.001"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
          value={quantityKg}
          onChange={(e) => setQuantityKg(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-black text-slate-500">یادداشت (اختیاری)</label>
        <input
          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {message && <p className="text-sm font-bold text-emerald-600">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-black disabled:opacity-50"
      >
        {loading ? '…' : 'ثبت تعدیل'}
      </button>
    </form>
  );
}
