import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

const CheckoutPage: React.FC = () => {
  const { cart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'inperson'>('online');
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800">خلاصه سفارش و پرداخت</h1>
      {cart.length === 0 ? (
        <p className="text-slate-500 font-bold">سبد خرید خالی است. <Link to="/app" className="text-orange-500">برگشت به منو</Link></p>
      ) : (
        <>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm font-black text-slate-800 mb-2">جمع کل: {total.toLocaleString()} تومان</p>
            <p className="text-xs text-slate-500 font-bold">انتخاب روش پرداخت (Mock)</p>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pay" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="rounded-full" />
              <span className="font-bold text-slate-800">پرداخت آنلاین</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pay" checked={paymentMethod === 'inperson'} onChange={() => setPaymentMethod('inperson')} className="rounded-full" />
              <span className="font-bold text-slate-800">پرداخت حضوری</span>
            </label>
          </div>
          <button type="button" className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black text-sm">
            {paymentMethod === 'online' ? 'انتقال به درگاه پرداخت (Mock)' : 'تایید سفارش'}
          </button>
        </>
      )}
      <Link to="/app/cart" className="inline-block text-sm font-bold text-slate-500">← بازگشت به سبد خرید</Link>
    </div>
  );
};

export default CheckoutPage;
