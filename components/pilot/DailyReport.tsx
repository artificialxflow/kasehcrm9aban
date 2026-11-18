'use client';

import { useEffect, useState } from 'react';
import { formatKgFromGrams, formatToman } from '@/lib/money';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';
import StockTable from '@/components/pilot/StockTable';

type Report = {
  purchaseCount: number;
  saleCount: number;
  purchaseTotalRial: string;
  saleTotalRial: string;
  rawPurchaseInGrams: number;
  saleOutGrams: number;
  stock: unknown[];
};

export default function DailyReport() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${base}/report/daily`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReport(data.report);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا'));
  }, [base]);

  if (error) return <p className="text-rose-600 font-bold">{error}</p>;
  if (!report) return <p className="text-slate-500 font-bold">در حال بارگذاری گزارش...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-500">خرید امروز</p>
          <p className="text-xl font-black text-slate-800">{report.purchaseCount} فاکتور</p>
          <p className="text-sm font-bold text-orange-600">{formatToman(report.purchaseTotalRial)} تومان</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-500">فروش امروز</p>
          <p className="text-xl font-black text-slate-800">{report.saleCount} فاکتور</p>
          <p className="text-sm font-bold text-orange-600">{formatToman(report.saleTotalRial)} تومان</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-500">ورود مواد خام (وزن)</p>
          <p className="text-xl font-black text-slate-800">
            {formatKgFromGrams(report.rawPurchaseInGrams)} کیلوگرم
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-black text-slate-500">خروج فروش (وزن)</p>
          <p className="text-xl font-black text-slate-800">
            {formatKgFromGrams(report.saleOutGrams)} کیلوگرم
          </p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-black text-amber-900">تطبیق وزنی (نسخهٔ اولیه)</p>
        <p className="text-xs font-bold text-amber-800 mt-1">
          مقایسهٔ سادهٔ ورود مواد خام با خروج فروش (بدون فرمول مصرف پخت). برای سود واقعی، ضایعات استاندارد در فاز بعد اضافه می‌شود.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-800 mb-3">موجودی لحظه‌ای</h4>
        <StockTable stock={report.stock as Parameters<typeof StockTable>[0]['stock']} />
      </div>
    </div>
  );
}
