'use client';

import { useCallback, useEffect, useState } from 'react';
import { rialPerKgToTomanInput } from '@/lib/money';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';
import { catalogTypeLabelFa } from '@/lib/pilot/labels-fa';

type CatalogItem = {
  id: string;
  name: string;
  type: string;
  pluCode: string | null;
  barcode: string | null;
  unitPriceRialPerKg: string | null;
  isActive: boolean;
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
      setMessage('برای فروش وزنی، کد فروش الزامی است.');
      setLoading(false);
      return;
    }
    if (type === 'WEIGHED_SALE' && !unitPriceTomanPerKg.trim()) {
      setMessage('برای فروش وزنی، فی (تومان/کیلو) الزامی است.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${base}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          pluCode: pluCode || undefined,
          barcode: barcode.trim() || undefined,
          ...(type === 'WEIGHED_SALE' && unitPriceTomanPerKg
            ? { unitPriceTomanPerKg: unitPriceTomanPerKg.trim() }
            : {}),
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

  async function patchItem(itemId: string, patch: Record<string, unknown>) {
    const res = await fetch(`${base}/catalog/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(translateError(data.error) || data.error || 'خطا');
    await load();
  }

  async function removeItem(item: CatalogItem) {
    if (!window.confirm(`حذف «${item.name}»؟ اگر سابقهٔ خرید/فروش دارد، غیرفعال می‌شود.`)) return;
    setMessage('');
    try {
      const res = await fetch(`${base}/catalog/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setMessage(data.mode === 'deactivated' ? 'کالا غیرفعال شد (سابقه دارد).' : 'کالا حذف شد.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border-2 border-slate-100 space-y-4 max-w-2xl">
        <h3 className="text-lg font-black text-slate-800">افزودن کالا به شعبه شریعتی</h3>
        <p className="text-xs text-slate-500 font-bold leading-relaxed">
          فروش وزنی: کد فروش و فی الزامی. بارکد رادین (اختیاری) برای نگاشت سخت‌افزار.
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
            <label className="text-xs font-black text-slate-500">کد فروش</label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              placeholder="مثلاً 1001"
              value={pluCode}
              onChange={(e) => setPluCode(e.target.value)}
            />
          </div>
          {type === 'WEIGHED_SALE' && (
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500">بارکد رادین (اختیاری)</label>
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
              <label className="text-xs font-black text-slate-500">فی فروش (تومان / کیلوگرم)</label>
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
              <th className="px-4 py-3 font-black text-slate-500">کد فروش</th>
              <th className="px-4 py-3 font-black text-slate-500">فی (تومان/کیلو)</th>
              <th className="px-4 py-3 font-black text-slate-500">وضعیت</th>
              <th className="px-4 py-3 font-black text-slate-500">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <CatalogRow
                key={item.id}
                item={item}
                onToggle={() => toggleActive(item)}
                onPatch={(patch) => patchItem(item.id, patch)}
                onDelete={() => removeItem(item)}
                onError={(msg) => setMessage(msg)}
              />
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
  onPatch,
  onDelete,
  onError,
}: {
  item: CatalogItem;
  onToggle: () => void;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [type, setType] = useState(item.type);
  const [pluCode, setPluCode] = useState(item.pluCode ?? '');
  const [barcode, setBarcode] = useState(item.barcode ?? '');
  const [priceToman, setPriceToman] = useState(rialPerKgToTomanInput(item.unitPriceRialPerKg));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setName(item.name);
      setType(item.type);
      setPluCode(item.pluCode ?? '');
      setBarcode(item.barcode ?? '');
      setPriceToman(rialPerKgToTomanInput(item.unitPriceRialPerKg));
    }
  }, [item, editing]);

  async function saveEdit() {
    setSaving(true);
    try {
      const patch: Record<string, unknown> = {
        name: name.trim(),
        type,
        pluCode: pluCode.trim() || null,
        barcode: type === 'WEIGHED_SALE' ? barcode.trim() || null : null,
      };
      if (type === 'WEIGHED_SALE' && priceToman.trim()) {
        patch.unitPriceTomanPerKg = priceToman.trim();
      }
      await onPatch(patch);
      setEditing(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'خطا در ویرایش');
    } finally {
      setSaving(false);
    }
  }

  const priceCell =
    editing && type === 'WEIGHED_SALE' ? (
      <input
        className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold"
        value={priceToman}
        onChange={(e) => setPriceToman(e.target.value)}
        placeholder="تومان/کیلو"
      />
    ) : item.type === 'WEIGHED_SALE' && item.unitPriceRialPerKg ? (
      `${rialPerKgToTomanInput(item.unitPriceRialPerKg)} تومان`
    ) : (
      '—'
    );

  return (
    <tr className={item.isActive ? '' : 'opacity-50 bg-slate-50'}>
      <td className="px-4 py-3 font-bold text-slate-800">
        {editing ? (
          <input
            className="w-full min-w-[120px] px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          item.name
        )}
      </td>
      <td className="px-4 py-3 text-slate-500 font-bold text-xs">
        {editing ? (
          <select
            className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="WEIGHED_SALE">فروش وزنی</option>
            <option value="RAW">مواد خام</option>
          </select>
        ) : (
          catalogTypeLabelFa(item.type)
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs">
        {editing ? (
          <input
            dir="ltr"
            className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs"
            value={pluCode}
            onChange={(e) => setPluCode(e.target.value)}
          />
        ) : (
          (item.pluCode ?? '—')
        )}
      </td>
      <td className="px-4 py-3">{priceCell}</td>
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
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2 items-center">
          {editing ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveEdit()}
                className="text-xs font-black text-orange-600"
              >
                {saving ? '…' : 'ذخیره'}
              </button>
              <button type="button" className="text-xs font-black text-slate-500" onClick={() => setEditing(false)}>
                انصراف
              </button>
            </>
          ) : (
            <>
              <button type="button" className="text-xs font-black text-orange-600" onClick={() => setEditing(true)}>
                ویرایش
              </button>
              <button type="button" className="text-xs font-black text-rose-600" onClick={onDelete}>
                حذف
              </button>
            </>
          )}
          {editing && type === 'WEIGHED_SALE' ? (
            <input
              dir="ltr"
              className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold"
              placeholder="بارکد"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function translateError(code: string) {
  switch (code) {
    case 'PLU_REQUIRED':
      return 'برای فروش وزنی کد فروش الزامی است.';
    case 'UNIT_PRICE_REQUIRED':
      return 'فی فروش الزامی است.';
    case 'PLU_DUPLICATE':
      return 'این کد فروش قبلاً ثبت شده است.';
    default:
      return code;
  }
}
