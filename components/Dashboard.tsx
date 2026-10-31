'use client';

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { STATS, SALES_CHART_DATA, RECENT_ORDERS, BRANCHES_DATA, CONCEPTS } from '@/lib/constants';
import { BranchConcept, OrderStatus } from '@/lib/types';

const Dashboard: React.FC = () => {
  const [conceptFilter, setConceptFilter] = useState<BranchConcept | 'all'>('all');

  const filteredBranches = useMemo(
    () => (conceptFilter === 'all' ? BRANCHES_DATA : BRANCHES_DATA.filter((b) => b.concept === conceptFilter)),
    [conceptFilter],
  );

  const filteredOrders = useMemo(
    () => (conceptFilter === 'all' ? RECENT_ORDERS : RECENT_ORDERS.filter((o) => o.concept === conceptFilter)),
    [conceptFilter],
  );

  const totalTodayRevenue = useMemo(
    () => filteredBranches.reduce((sum, b) => sum + b.dailyRevenue, 0),
    [filteredBranches],
  );

  const totalWeeklyRevenueMock = useMemo(
    () => Math.round(totalTodayRevenue * 5.2),
    [totalTodayRevenue],
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OrderStatus.COOKING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case OrderStatus.CANCELLED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Stats + Concept Filter */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                  <i className={`fa-solid ${stat.icon} text-xl`}></i>
                </div>
                <span
                  className={`text-xs font-black px-2 py-1 rounded-lg ${
                    stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-bold mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">
                {idx === 0 ? `${totalTodayRevenue.toLocaleString()} تومان` : stat.value}
              </p>
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
            <p className="text-sm font-black text-orange-600 mt-1">این هفته: {totalWeeklyRevenueMock.toLocaleString()} تومان</p>
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
              <BarChart data={SALES_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Bar dataKey="sales" radius={[8, 8, 0, 0]} barSize={40}>
                  {SALES_CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#f97316' : '#fdba74'} />
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
                      شهر: {branch.city} • پیک فعال: {branch.activeCouriers}
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
          <button className="w-full mt-6 py-3 rounded-2xl bg-orange-50 text-orange-600 font-black text-sm hover:bg-orange-100 transition-colors">
            مشاهده جزییات تمام شعب
          </button>
        </div>
      </div>

      {/* AI Placeholders: پیشنهادات هوشمند و آیتم‌های فصلی */}
      <div className="bg-gradient-to-l from-indigo-600 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <h3 className="text-lg font-black mb-4">پیشنهادات هوشمند (AI)</h3>
        <p className="text-indigo-200 text-xs font-bold mb-4">
          پیشنهاد آیتم‌های فصلی که می‌توانند به منوی ثابت اضافه شوند (Mock).
        </p>
        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            دمنوش — تقاضای بالا؛ پیشنهاد: ثابت در منو
          </li>
          <li className="flex items-center gap-2 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            آب دو خیار — فصلی؛ قابل نگه‌داری در منو
          </li>
          <li className="flex items-center gap-2 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            للو کباب — فصلی؛ فعلاً نگه‌داری نشده
          </li>
        </ul>
        <button type="button" className="w-full py-3 bg-white text-indigo-900 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg">
          تحلیل خودکار فروش (اتصال به بک‌اند AI در آینده)
        </button>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800">آخرین سفارشات ثبت شده 📝</h3>
          <button className="text-orange-500 font-bold text-sm">مشاهده همه</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">شناسه</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">مشتری</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">شعبه</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">مبلغ کل</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">زمان</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">وضعیت</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-black text-slate-800">{order.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-bold">
                    <div>{order.branch}</div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      {order.concept === 'fried'
                        ? 'سوخاری'
                        : order.concept === 'burger'
                        ? 'مکیان برگر'
                        : order.concept === 'ash'
                        ? 'آش و حلیم'
                        : 'کافه‌رستوران'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-800">{order.totalPrice.toLocaleString()} تومان</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-bold">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black border ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : order.paymentStatus === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {order.paymentStatus === 'paid'
                          ? 'پرداخت‌شده'
                          : order.paymentStatus === 'pending'
                          ? 'در انتظار پرداخت'
                          : 'پرداخت ناموفق'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors">
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
