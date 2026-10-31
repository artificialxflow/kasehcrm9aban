'use client';

import { useEffect, useState } from 'react';
import { kgToGrams } from '@/lib/money';
import { parseScaleBarcode } from '@/lib/scale/parse-barcode';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type CatalogItem = {
  id: string;
  name: string;
  type: string;
  pluCode: string | null;
  unitPriceRialPerKg: string | null;
};

export default function SaleForm({ onSuccess }: { onSuccess?: () => void }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [catalogItemId, setCatalogItemId] = useState('');
  const [weightKg, setWeightKg] = useState('0.225');
  const [unitPriceRialPerKg, setUnitPriceRialPerKg] = useState('1289000');
  const [scaleInvoiceNo, setScaleInvoiceNo] = useState('');
  const [scaleLabel, setScaleLabel] = useState('ترازو ۱');
  const [boothLabel, setBoothLabel] = useState('غرفه ۱');
  const [rawBarcode, setRawBarcode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${base}/catalog`)
      .then((r) => r.json())
      .then((data) => {
        const saleItems = (data.items as CatalogItem[]).filter((i) => i.type === 'WEIGHED_SALE');
        setItems(saleItems);
        if (saleItems[0]) {
          setCatalogItemId(saleItems[0].id);
          if (saleItems[0].unitPriceRialPerKg) {
            setUnitPriceRialPerKg(saleItems[0].unitPriceRialPerKg);
          }
        }
      })
      .catch(() => setMessage('خطا در بارگذاری کatalog'));
  }, [base]);

  function applyBarcode() {
    const parsed = parseScaleBarcode(rawBarcode);
    if (!parsed) {
      setMessage('فرمت بارکد نامعتبر. نمونه: POT001|225|1289000');
      return;
    }
    const item = items.find((i) => i.pluCode === parsed.pluCode);
    if (item) setCatalogItemId(item.id);
    setWeightKg(String(parsed.weightGrams / 1000));
    setUnitPriceRialPerKg(parsed.unitPriceRialPerKg.toString());
    setMessage('بارکد اعمال شد.');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${base}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scaleInvoiceNo: scaleInvoiceNo || undefined,
          scaleLabel,
          boothLabel,
          rawBarcode: rawBarcode || undefined,
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
      setMessage('فروش ثبت شد و موجودی به‌روز شد.');
      onSuccess?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-slate-100 space-y-4 max-w-xl">
      <h3 className="text-lg font-black text-slate-800">ثبت فروش وزنی (فاکتور RADIN)</h3>
      <div className="space-y-1">
        <label className="text-xs font-black text-slate-500">بارکد / payload (PLU|گرم|ریال/kg)</label>
        <div className="flex gap-2">
          <input
            dir="ltr"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm"
            value={rawBarcode}
            onChange={(e) => setRawBarcode(e.target.value)}
            placeholder="POT001|225|1289000"
          />
          <button type="button" onClick={applyBarcode} className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-black">
            اعمال
          </button>
        </div>
      </div>
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
          <input type="number" step="0.001" min="0.001" className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">فی (ریال/kg)</label>
          <input dir="ltr" className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold" value={unitPriceRialPerKg} onChange={(e) => setUnitPriceRialPerKg(e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">شماره فاکتور</label>
          <input className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold" value={scaleInvoiceNo} onChange={(e) => setScaleInvoiceNo(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">ترازو</label>
          <input className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold" value={scaleLabel} onChange={(e) => setScaleLabel(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">غرفه</label>
          <input className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold" value={boothLabel} onChange={(e) => setBoothLabel(e.target.value)} />
        </div>
      </div>
      <button type="submit" disabled={loading || !catalogItemId} className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black disabled:opacity-50">
        {loading ? 'در حال ثبت...' : 'ثبت فروش'}
      </button>
      {message && <p className="text-sm font-bold text-slate-600">{message}</p>}
    </form>
  );
}
