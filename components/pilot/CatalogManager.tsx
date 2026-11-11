'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatToman } from '@/lib/money';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type CatalogItem = {
  id: string;
  name: string;
  type: string;
  pluCode: string | null;
  unitPriceRialPerKg: string | null;
  isActive: boolean;
};

const TYPE_LABEL: Record<string, string> = {
  RAW: 'مواد خام (RAW)',
  WEIGHED_SALE: 'فروش وزنی (ترازو)',
  PIECE: 'عددی',
};

export default function CatalogManager() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<'RAW' | 'WEIGHED_SALE'>('WEIGHED_SALE');
  const [pluCode, setPluCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unitPriceTomanPerKg, setUnitPriceTomanPerKg] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`${base}/catalog?all=1`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'خطا');
    setItems(data.items as CatalogItem[]);
  }, [base]);

  useEffect(() => {
    load().catch(() => setMessage('خطا در بارگذاری کatalog'));
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
  if (type === 'WEIGHED_SALE' && !pluCode.trim()) {
      setMessage('برای فروش وزنی، کد PLU الزامی است.');
      setLoading(false);
      return;
    }
    if (type === 'WEIGHED_SALE' && !unitPriceTomanPerKg.trim()) {
      setMessage('برای فروش وزنی، فی (تومان/کیلو) الزامی است.');
      setLoading(false);
      return;
    }
    try {
      const unitPriceRialPerKg =
        type === 'WEIGHED_SALE' && unitPriceTomanPerKg
          ? String(Math.round(parseFloat(unitPriceTomanPerKg) * 10))
          : undefined;

      const res = await fetch(`${base}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          pluCode: pluCode || undefined,
          barcode: barcode.trim() || undefined,
          unitPriceRialPerKg,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(translateError(data.error));
      setName('');
      setPluCode('');
      setBarcode('');
      setUnitPriceTomanPerKg('');
      setMessage('کالا اضافه شد.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(item: CatalogItem) {
    setMessage('');
    try {
      const res = await fetch(`${base}/catalog/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    }
  }

  async function savePrice(item: CatalogItem, tomanPerKg: string) {
    if (!tomanPerKg.trim()) return;
    const rial = String(Math.round(parseFloat(tomanPerKg) * 10));
    const res = await fetch(`${base}/catalog/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitPriceRialPerKg: rial }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'خطا');
    await load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border-2 border-slate-100 space-y-4 max-w-2xl">
        <h3 className="text-lg font-black text-slate-800">افزودن کالا به شعبه شریعتی</h3>
        <p className="text-xs text-slate-500 font-bold leading-relaxed">
          فروش وزنی: PLU و فی الزامی. بارکد RADIN (اختیاری) برای mapping سخت‌افزار.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-black text-slate-500">نام کالا</label>
            <input
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500">نوع</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              value={type}
              onChange={(e) => setType(e.target.value as 'RAW' | 'WEIGHED_SALE')}
            >
              <option value="WEIGHED_SALE">فروش وزنی</option>
              <option value="RAW">مواد خام</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500">کد PLU</label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              placeholder="مثلاً 1001"
              value={pluCode}
              onChange={(e) => setPluCode(e.target.value)}
            />
          </div>
          {type === 'WEIGHED_SALE' && (
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500">بارکد RADIN (اختیاری)</label>
              <input
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="626564512"
              />
            </div>
          )}
          {type === 'WEIGHED_SALE' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-black text-slate-500">فی فروش (تومان / kg)</label>
              <input
                required
                type="number"
                min={1}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                value={unitPriceTomanPerKg}
                onChange={(e) => setUnitPriceTomanPerKg(e.target.value)}
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-orange-500 text-white font-black disabled:opacity-50"
        >
          {loading ? 'در حال ثبت…' : 'ثبت کالا'}
        </button>
      </form>

      {message && (
        <p className={`text-sm font-bold ${message.includes('خطا') ? 'text-red-600' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-black text-slate-500">کالا</th>
              <th className="px-4 py-3 font-black text-slate-500">نوع</th>
              <th className="px-4 py-3 font-black text-slate-500">PLU</th>
              <th className="px-4 py-3 font-black text-slate-500">فی (تومان/kg)</th>
              <th className="px-4 py-3 font-black text-slate-500">وضعیت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <CatalogRow key={item.id} item={item} onToggle={() => toggleActive(item)} onSavePrice={savePrice} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CatalogRow({
  item,
  onToggle,
  onSavePrice,
}: {
  item: CatalogItem;
  onToggle: () => void;
  onSavePrice: (item: CatalogItem, toman: string) => Promise<void>;
}) {
  const [editPrice, setEditPrice] = useState(
    item.unitPriceRialPerKg ? String(Math.round(Number(item.unitPriceRialPerKg) / 10)) : '',
  );

  return (
    <tr className={item.isActive ? '' : 'opacity-50 bg-slate-50'}>
      <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
      <td className="px-4 py-3 text-slate-500 font-bold text-xs">{TYPE_LABEL[item.type] ?? item.type}</td>
      <td className="px-4 py-3 font-mono text-xs">{item.pluCode ?? '—'}</td>
      <td className="px-4 py-3">
        {item.type === 'WEIGHED_SALE' ? (
          <div className="flex items-center gap-2">
            <input
              className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
            <button
              type="button"
              className="text-xs font-black text-orange-600"
              onClick={() => onSavePrice(item, editPrice).catch(() => {})}
            >
              ذخیره
            </button>
          </div>
        ) : item.unitPriceRialPerKg ? (
          formatToman(item.unitPriceRialPerKg)
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className={`text-xs font-black px-3 py-1 rounded-lg ${
            item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {item.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      </td>
    </tr>
  );
}

function translateError(code: string) {
  switch (code) {
    case 'PLU_REQUIRED':
      return 'برای فروش وزنی کد PLU الزامی است.';
    case 'UNIT_PRICE_REQUIRED':
      return 'فی فروش الزامی است.';
    case 'PLU_DUPLICATE':
      return 'این PLU قبلاً ثبت شده است.';
    default:
      return code;
  }
}
