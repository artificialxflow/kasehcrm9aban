'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CONCEPTS } from '@/lib/constants';
import type { DashboardSummary } from '@/lib/api/types';
import { formatKgFromGrams, formatToman } from '@/lib/money';

const Orders: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [conceptFilter, setConceptFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSummary(data as DashboardSummary);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'));
  }, []);

  const branchNames = useMemo(() => {
    if (!summary) return [];
    return summary.branches.map((b) => b.name);
  }, [summary]);

  const filteredSales = useMemo(() => {
    if (!summary) return [];
    return summary.recentSales.filter((s) => {
      const matchConcept = conceptFilter === 'all' || s.branch.concept === conceptFilter;
      const matchBranch = branchFilter === 'all' || s.branch.name === branchFilter;
      return matchConcept && matchBranch;
    });
  }, [summary, conceptFilter, branchFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">فروش وزنی ثبت‌شده</h2>
          <p className="text-slate-500 font-bold mt-1">
            فاکتورهای واقعی از PostgreSQL (پایلوت و bridge ترازو). سفارش آنلاین مشتری در فاز بعد.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
            value={conceptFilter}
            onChange={(e) => setConceptFilter(e.target.value)}
          >
            <option value="all">همه کانسپت‌ها</option>
            {CONCEPTS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="all">همه شعب</option>
            {branchNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-rose-600 font-bold">{error}</p>}
      {!summary && !error && <p className="text-slate-500 font-bold">در حال بارگذاری...</p>}

      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-500">شعبه</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">کالا / وزن</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">مبلغ</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">زمان</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500">منبع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-black text-slate-800 text-sm">{sale.branch.name}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    {sale.lines.map((l, i) => (
                      <span key={i}>
                        {l.catalogItem.name} ({formatKgFromGrams(l.weightGrams)} kg)
                        {i < sale.lines.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-black text-orange-600">{formatToman(sale.totalRial)} تومان</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-bold">
                    {new Date(sale.soldAt).toLocaleString('fa-IR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700">
                      {sale.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {summary && filteredSales.length === 0 && (
            <p className="p-8 text-center text-slate-500 font-bold">فاکتوری با این فیلتر یافت نشد.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
