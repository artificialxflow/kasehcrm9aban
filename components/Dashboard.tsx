'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CONCEPTS } from '@/lib/constants';
import type { DashboardSummary } from '@/lib/api/types';
import { BranchConcept } from '@/lib/types';
import { formatToman, rialToToman } from '@/lib/money';

const Dashboard: React.FC = () => {
  const [conceptFilter, setConceptFilter] = useState<BranchConcept | 'all'>('all');
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

  const filteredBranches = useMemo(() => {
    if (!summary) return [];
    return conceptFilter === 'all'
      ? summary.branches
      : summary.branches.filter((b) => b.concept === conceptFilter);
  }, [summary, conceptFilter]);

  const filteredSales = useMemo(() => {
    if (!summary) return [];
    return conceptFilter === 'all'
      ? summary.recentSales
      : summary.recentSales.filter((s) => s.branch.concept === conceptFilter);
  }, [summary, conceptFilter]);

  const totalTodayRevenue = useMemo(() => {
    if (!summary) return 0;
    if (conceptFilter === 'all') return rialToToman(summary.totalSaleRialToday);
    return filteredBranches.reduce((sum, b) => sum + rialToToman(b.dailySaleRial), 0);
  }, [summary, conceptFilter, filteredBranches]);

  const totalWeeklyRevenue = useMemo(() => {
    if (!summary) return 0;
    return summary.salesChart.reduce((s, d) => s + d.sales, 0);
  }, [summary]);

  const chartData = summary?.salesChart ?? [];

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-rose-600 font-bold">خطا در بارگذاری داشبورد: {error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-slate-500 font-bold">در حال بارگذاری داشبورد...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'فروش وزنی امروز (ثبت‌شده)',
      value: `${totalTodayRevenue.toLocaleString('fa-IR')} تومان`,
      icon: 'fa-coins',
      sub: `${summary.saleCountToday} فاکتور`,
    },
    {
      label: 'شعب باز',
      value: `${summary.openBranches} / ${summary.branchCount}`,
      icon: 'fa-store',
      sub: 'از PostgreSQL',
    },
    {
      label: 'خرید انبار امروز (پایلوت)',
      value: `${summary.purchaseCountToday} فاکتور`,
      icon: 'fa-box',
      sub: 'شعب با isPilot',
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Stats + Concept Filter */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                  <i className={`fa-solid ${stat.icon} text-xl`}></i>
                </div>
                <span className="text-xs font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-600">{stat.sub}</span>
              </div>
              <p className="text-slate-500 text-sm font-bold mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-72 bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 mb-1">نمایش آمار بر اساس کانسپت</h3>
          <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
            یکی از کانسپت‌های مجموعه (سوخاری، مکیان، آش و حلیم یا کافه‌رستوران) را انتخاب کنید تا نمودارها و
            جداول فقط بر اساس همان فیلتر شوند.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => setConceptFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black ${
                conceptFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              کل مجموعه
            </button>
            {CONCEPTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setConceptFilter(c.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black ${
                  conceptFilter === c.id ? `${c.badgeClass} shadow-md` : `${c.softBgClass} border border-slate-100`
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-black text-slate-500 mb-2">گزارش مالی خلاصه</p>
            <p className="text-sm font-black text-slate-800">امروز: {totalTodayRevenue.toLocaleString()} تومان</p>
            <p className="text-sm font-black text-orange-600 mt-1">۷ روز: {totalWeeklyRevenue.toLocaleString('fa-IR')} تومان</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800">
              نمودار فروش هفتگی {conceptFilter === 'all' ? '(کل مجموعه)' : '(بر اساس کانسپت انتخاب‌شده)'}
            </h3>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold">
              <option>۷ روز گذشته</option>
              <option>۳۰ روز گذشته</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Bar dataKey="sales" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#f97316' : '#fdba74'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Overview Quick List */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">وضعیت لحظه‌ای شعب 📍</h3>
          <div className="space-y-4">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-hover hover:border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏙️</span>
                  <div>
                    <p className="text-sm font-black text-slate-800">{branch.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {branch.city} • امروز: {rialToToman(branch.dailySaleRial).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    branch.isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {branch.isOpen ? 'باز' : 'بسته'}
                </div>
              </div>
            ))}
          </div>
          <Link href="/branches" className="block w-full mt-6 py-3 rounded-2xl bg-orange-50 text-orange-600 font-black text-sm hover:bg-orange-100 transition-colors text-center">
            مشاهده جزییات تمام شعب
          </Link>
        </div>
      </div>

      {/* Recent weight sales from DB */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800">آخرین فروش وزنی (دیتابیس)</h3>
          <Link href="/orders" className="text-orange-500 font-bold text-sm">مشاهده همه</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-black text-slate-500">شعبه</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">اقلام</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">مبلغ</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">زمان</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">منبع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-bold text-sm">
                    هنوز فروشی ثبت نشده — از پایلوت شریعتی یا bridge ترازو ثبت کنید.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-slate-800">{sale.branch.name}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">
                      {sale.lines.map((l) => l.catalogItem.name).join(' · ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-orange-600">{formatToman(sale.totalRial)} تومان</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-bold">
                      {new Date(sale.soldAt).toLocaleString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-slate-500">{sale.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
