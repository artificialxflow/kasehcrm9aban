'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { DashboardSummary } from '@/lib/api/types';
import { formatToman } from '@/lib/money';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#64748b', '#ec4899', '#14b8a6'];

const Reports: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSummary(data as DashboardSummary);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'));
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-rose-600 font-bold">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-slate-500 font-bold">در حال بارگذاری گزارش...</p>
      </div>
    );
  }

  const pieData = summary.branchShare.length
    ? summary.branchShare
    : [{ name: 'بدون فروش امروز', value: 1 }];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800">گزارشات و تحلیل</h2>
        <p className="text-slate-500 font-bold mt-1">داده واقعی فروش وزنی (PostgreSQL) — امروز و ۷ روز گذشته</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-500">فروش امروز</p>
          <p className="text-xl font-black text-orange-600">{formatToman(summary.totalSaleRialToday)} تومان</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-500">تعداد فاکتور فروش</p>
          <p className="text-xl font-black text-slate-800">{summary.saleCountToday}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-500">خرید انبار امروز</p>
          <p className="text-xl font-black text-slate-800">{summary.purchaseCountToday} فاکتور</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-8">روند فروش وزنی (۷ روز)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.salesChart}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dx={-10} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-8">سهم فروش امروز به تفکیک شعبه</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => `${Number(v ?? 0).toLocaleString('fa-IR')} تومان`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
        <p className="text-sm font-bold text-slate-600 leading-relaxed">
          گزارش رفتار مشتریان و سفارش آنلاین هنوز مدل دیتابیس ندارد. پس از تعریف جداول Customer/Order، همین صفحه گسترش می‌یابد.
        </p>
      </div>
    </div>
  );
};

export default Reports;
