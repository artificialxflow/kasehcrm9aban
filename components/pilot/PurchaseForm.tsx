'use client';

import { useEffect, useState } from 'react';
import { kgToGrams } from '@/lib/money';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type CatalogItem = { id: string; name: string; type: string };

export default function PurchaseForm({ onSuccess }: { onSuccess?: () => void }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [catalogItemId, setCatalogItemId] = useState('');
  const [weightKg, setWeightKg] = useState('1');
  const [unitPriceRialPerKg, setUnitPriceRialPerKg] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${base}/catalog`)
      .then((r) => r.json())
      .then((data) => {
        const raw = (data.items as CatalogItem[]).filter((i) => i.type === 'RAW');
        setItems(raw);
        if (raw[0]) setCatalogItemId(raw[0].id);
      })
      .catch(() => setMessage('خطا در بارگذاری کatalog'));
  }, [base]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${base}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo: invoiceNo || undefined,
          supplierName: supplierName || undefined,
          lines: [
            {
              catalogItemId,
              weightGrams: kgToGrams(parseFloat(weightKg)),
              unitPriceRialPerKg,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setMessage('خرید با موفقیت ثبت شد.');
      onSuccess?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-slate-100 space-y-4 max-w-xl">
      <h3 className="text-lg font-black text-slate-800">ثبت خرید وزنی (مواد خام)</h3>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">وزن (kg)</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">فی (ریال/kg)</label>
          <input
            type="text"
            dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
            value={unitPriceRialPerKg}
            onChange={(e) => setUnitPriceRialPerKg(e.target.value.replace(/\D/g, ''))}
            placeholder="1289000"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">تأمین‌کننده</label>
          <input className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">شماره فاکتور</label>
          <input className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !catalogItemId || !unitPriceRialPerKg}
        className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black disabled:opacity-50"
      >
        {loading ? 'در حال ثبت...' : 'ثبت خرید'}
      </button>
      {message && <p className="text-sm font-bold text-slate-600">{message}</p>}
    </form>
  );
}
