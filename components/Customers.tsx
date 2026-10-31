'use client';

import React from 'react';
import Link from 'next/link';

const Customers: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800">مشتریان</h2>
        <p className="text-slate-500 font-bold mt-1">CRM مشتری هنوز به PostgreSQL وصل نشده</p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-100 p-12 text-center max-w-2xl mx-auto">
        <span className="text-5xl block mb-4">👥</span>
        <h3 className="text-lg font-black text-slate-800 mb-2">بدون داده mock</h3>
        <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
          فروش وزنی شعبه (پایلوت شریعتی) در بخش سفارشات و داشبورد از دیتابیس واقعی نمایش داده می‌شود.
          پروفایل مشتری، باشگاه وفاداری و سفارش آنلاین در فاز بعد با جداول Customer اضافه می‌شود.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/orders" className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-black text-sm">
            فروش ثبت‌شده
          </Link>
          <Link href="/pilot/shariati" className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm">
            پایلوت شریعتی
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Customers;
