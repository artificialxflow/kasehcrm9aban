'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';

const CartPage: React.FC = () => {
  const { cart } = useCart();
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800">سبد خرید</h1>
      {cart.length === 0 ? (
        <p className="text-slate-500 font-bold">سبد خرید شما خالی است.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-800">{item.name} × {item.qty}</span>
                <span className="font-black text-orange-600">{(item.price * item.qty).toLocaleString()} تومان</span>
              </li>
            ))}
          </ul>
          <p className="text-lg font-black text-slate-800">جمع کل: {total.toLocaleString()} تومان</p>
        </>
      )}
      <div className="flex gap-3">
        <Link href="/app" className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm">
          ادامه خرید
        </Link>
        {cart.length > 0 && (
          <Link href="/app/checkout" className="px-6 py-2 rounded-2xl bg-orange-500 text-white font-black text-sm">
            ثبت سفارش و پرداخت
          </Link>
        )}
      </div>
    </div>
  );
};

export default CartPage;
