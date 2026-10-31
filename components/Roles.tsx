'use client';

import React from 'react';
import { UserRole } from '@/lib/types';

interface AccessRow {
  section: string;
  owner: boolean;
  branchManager: boolean;
  cashier: boolean;
  chef: boolean;
}

const ACCESS_MATRIX: AccessRow[] = [
  { section: 'داشبورد', owner: true, branchManager: true, cashier: true, chef: true },
  { section: 'مدیریت شعب', owner: true, branchManager: true, cashier: false, chef: false },
  { section: 'سفارشات', owner: true, branchManager: true, cashier: true, chef: true },
  { section: 'مشتریان', owner: true, branchManager: true, cashier: true, chef: false },
  { section: 'گزارشات و تحلیل', owner: true, branchManager: false, cashier: false, chef: false },
  { section: 'کاربران و نقش‌ها', owner: true, branchManager: false, cashier: false, chef: false },
  { section: 'بلاگ و محتوا', owner: true, branchManager: false, cashier: false, chef: false },
];

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'صاحب مجموعه',
  branchManager: 'مدیر شعبه',
  cashier: 'صندوقدار / فروشنده',
  chef: 'آشپز',
};

const Roles: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800">کاربران و نقش‌ها</h2>
        <p className="text-slate-500 font-bold mt-1">
          فقط صاحب مجموعه (Owner) به تنظیمات کل سیستم و گزارش‌های نهایی دسترسی دارد؛ مدیران شعبه محدود به شعبه خود هستند.
        </p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-800">ماتریس دسترسی (کدام نقش به کدام بخش منو دسترسی دارد)</h3>
          <p className="text-xs text-slate-500 font-bold mt-1">تیک یعنی دسترسی دارد؛ خالی یعنی ندارد.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-black text-slate-500">بخش</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">{ROLE_LABELS.owner}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">{ROLE_LABELS.branchManager}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">{ROLE_LABELS.cashier}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">{ROLE_LABELS.chef}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACCESS_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{row.section}</td>
                  <td className="px-6 py-4">{row.owner ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-6 py-4">{row.branchManager ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-6 py-4">{row.cashier ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-6 py-4">{row.chef ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-slate-300">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
        <p className="text-sm font-black text-amber-800">نکته:</p>
        <p className="text-xs text-amber-700 font-bold mt-1">
          دسترسی در سطح فرانت بر اساس نقش فعلی کاربر (Mock) کنترل می‌شود؛ پس از اتصال به بک‌اند، نقش واقعی از سرور اعمال خواهد شد.
        </p>
      </div>
    </div>
  );
};

export default Roles;
