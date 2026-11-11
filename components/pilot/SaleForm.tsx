'use client';

import Link from 'next/link';
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

type ScaleDevice = { id: string; label: string };

function pickDefaultItem(items: CatalogItem[]) {
  const nonDemo = items.filter((i) => i.pluCode !== 'POT001');
  return nonDemo[0] ?? items[0];
}

export default function SaleForm({ onSuccess }: { onSuccess?: () => void }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [devices, setDevices] = useState<ScaleDevice[]>([]);
  const [catalogItemId, setCatalogItemId] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [unitPriceRialPerKg, setUnitPriceRialPerKg] = useState('');
  const [scaleLabel, setScaleLabel] = useState('');
  const [scaleInvoiceNo, setScaleInvoiceNo] = useState('');
  const [rawBarcode, setRawBarcode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${base}/catalog`).then((r) => r.json()),
      fetch(`${base}/scale-devices`).then((r) => r.json()),
    ])
      .then(([catData, devData]) => {
        const saleItems = (catData.items as CatalogItem[]).filter((i) => i.type === 'WEIGHED_SALE');
        setItems(saleItems);
        const devs = (devData.devices ?? []) as ScaleDevice[];
        setDevices(devs);
        if (devs[0]) setScaleLabel(devs[0].label);
        const def = pickDefaultItem(saleItems);
        if (def) {
          setCatalogItemId(def.id);
          if (def.unitPriceRialPerKg) setUnitPriceRialPerKg(def.unitPriceRialPerKg);
        }
      })
      .catch(() => setMessage('خطا در بارگذاری داده'));
  }, [base]);

  function onCatalogChange(id: string) {
    setCatalogItemId(id);
    const item = items.find((i) => i.id === id);
    if (item?.unitPriceRialPerKg) setUnitPriceRialPerKg(item.unitPriceRialPerKg);
  }

  function applyBarcode() {
    const parsed = parseScaleBarcode(rawBarcode);
    if (!parsed) {
      setMessage('فرمت بارکد نامعتبر. نمونه: PLU|گرم|ریال-هر-کیلو');
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
    const w = parseFloat(weightKg);
    if (!catalogItemId || !Number.isFinite(w) || w <= 0) {
      setMessage('کالا و وزن معتبر وارد کنید.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${base}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scaleInvoiceNo: scaleInvoiceNo || undefined,
          scaleLabel: scaleLabel || undefined,
          boothLabel: undefined,
          rawBarcode: rawBarcode || undefined,
          lines: [
            {
              catalogItemId,
              weightGrams: kgToGrams(w),
              unitPriceRialPerKg: unitPriceRialPerKg,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setMessage('فروش دستی ثبت شد و موجودی به‌روز شد.');
      onSuccess?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-slate-100 space-y-4 max-w-xl">
      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-800">فروش دستی پنل (اضطراری)</h3>
        <p className="text-xs font-bold text-slate-500">
          فروش خودکار از Bridge در{' '}
          <Link href="/pilot/shariati/scale-events" className="text-orange-600 underline">
            رویداد ترازو
          </Link>{' '}
          دیده می‌شود.
        </p>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-black text-slate-500">بارکد / payload (PLU|گرم|ریال/kg)</label>
        <div className="flex gap-2">
          <input
            dir="ltr"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm"
            value={rawBarcode}
            onChange={(e) => setRawBarcode(e.target.value)}
            placeholder="PLU|گرم|فی-ریال-هر-کیلو"
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
          onChange={(e) => onCatalogChange(e.target.value)}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.pluCode ? `${i.pluCode} — ` : ''}
              {i.name}
            </option>
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
            placeholder="—"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">فی (ریال/kg)</label>
          <input
            dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
            value={unitPriceRialPerKg}
            onChange={(e) => setUnitPriceRialPerKg(e.target.value.replace(/\D/g, ''))}
            placeholder="از catalog"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">شماره فاکتور</label>
          <input
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
            value={scaleInvoiceNo}
            onChange={(e) => setScaleInvoiceNo(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500">ترازو</label>
          {devices.length ? (
            <select
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              value={scaleLabel}
              onChange={(e) => setScaleLabel(e.target.value)}
            >
              {devices.map((d) => (
                <option key={d.id} value={d.label}>
                  {d.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              value={scaleLabel}
              onChange={(e) => setScaleLabel(e.target.value)}
              placeholder="در دستگاه‌های ترازو تعریف کنید"
            />
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !catalogItemId}
        className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black disabled:opacity-50"
      >
        {loading ? 'در حال ثبت...' : 'ثبت فروش دستی'}
      </button>
      {message && <p className="text-sm font-bold text-slate-600">{message}</p>}
    </form>
  );
}
