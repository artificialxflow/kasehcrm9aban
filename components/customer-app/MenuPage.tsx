'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CONCEPTS } from '@/lib/constants';
import { useCart } from './CartContext';

type MenuItem = { id: string; name: string; price: number };

const MenuPage: React.FC<{ concept: string }> = ({ concept }) => {
  const { addToCart } = useCart();
  const conceptDef = CONCEPTS.find((c) => c.id === concept);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    fetch(`/api/app/menu?concept=${encodeURIComponent(concept)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error ?? 'menu_failed');
        setItems(data.items ?? []);
      })
      .catch(() => {
        setLoadError('بارگذاری منو از سرور ناموفق بود.');
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [concept]);

  if (!conceptDef) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-600">کانسپت یافت نشد.</p>
        <Link href="/app" className="text-orange-500 font-bold mt-2 inline-block">
          بازگشت به انتخاب برند
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{conceptDef.name}</h1>
          <p className="text-slate-500 font-bold mt-1">{conceptDef.description}</p>
        </div>
        <Link href="/app/cart" className="px-4 py-2 rounded-2xl bg-slate-800 text-white text-sm font-black">
          سبد خرید
        </Link>
      </div>
      {loading ? <p className="text-slate-500 font-bold text-center">در حال بارگذاری منو...</p> : null}
      {loadError ? <p className="text-rose-600 font-bold text-center text-sm">{loadError}</p> : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-black text-slate-800">{item.name}</p>
              <p className="text-sm font-bold text-orange-600">{item.price.toLocaleString()} تومان</p>
            </div>
            <button
              type="button"
              onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
              className={`px-4 py-2 rounded-xl text-sm font-black ${conceptDef.badgeClass}`}
            >
              افزودن به سبد
            </button>
          </div>
        ))}
      </div>
      {!loading && items.length === 0 && !loadError ? (
        <p className="text-center text-slate-500 font-bold">فعلاً آیتمی برای این برند تعریف نشده است.</p>
      ) : null}
    </div>
  );
};

export default MenuPage;