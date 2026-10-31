'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { SALES_CHART_DATA, BRANCH_SHARE_DATA } from '@/lib/constants';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7'];

const Reports: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800">گزارشات و تحلیل هوشمند 📊</h2>
        <p className="text-slate-500 font-bold mt-1">بررسی عملکرد شعب و تحلیل رفتاری مشتریان شمال</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800">روند رشد فروش (ماهانه)</h3>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">+۲۴٪ نسبت به ماه قبل</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_CHART_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} dx={-10} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-8">سهم فروش هر شعبه</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={BRANCH_SHARE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {BRANCH_SHARE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Item Performance Table Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">محبوب‌ترین غذاها در شمال 🍗</h3>
          <div className="space-y-4">
            {[
              { name: 'کاسه کباب کوردی', city: 'ساری', count: 450, growth: '+۱۲٪' },
              { name: 'جوجه کباب ارگانیک', city: 'آمل', count: 320, growth: '+۸٪' },
              { name: 'ماهی سفید دریایی', city: 'بابلسر', count: 210, growth: '-۲٪' },
              { name: 'برنج کته محلی', city: 'بابل', count: 580, growth: '+۱۸٪' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">بیشترین سفارش در: {item.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{item.count} پرس</p>
                  <p className={`text-[10px] font-black ${item.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{item.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-black mb-4">پیش‌بینی هوشمند (AI) 🤖</h4>
            <p className="text-indigo-200 text-xs font-bold leading-relaxed">بر اساس الگوریتم‌های یادگیری ماشین، پیش‌بینی می‌شود شعبه بابل در آخر هفته جاری با افزایش ۳۰ درصدی سفارشات روبرو شود.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-[10px] text-indigo-300 font-bold mb-4 italic">توصیه سیستم: افزایش تعداد پیک‌ها در شعبه بابل برای روز جمعه</p>
            <button type="button" className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg">
              تحلیل خودکار فروش (اتصال به AI در آینده)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
