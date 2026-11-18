'use client';

import { formatKgFromGrams, formatToman } from '@/lib/money';
import { catalogTypeLabelFa } from '@/lib/pilot/labels-fa';

type StockRow = {
  quantityGrams: number;
  catalogItem: {
    name: string;
    type: string;
    unitPriceRialPerKg: string | null;
  };
};

export default function StockTable({ stock }: { stock: StockRow[] }) {
  if (!stock.length) {
    return <p className="text-slate-500 font-bold text-sm">موجودی ثبت نشده است.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-right text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-black text-slate-500">کالا</th>
            <th className="px-4 py-3 font-black text-slate-500">نوع</th>
            <th className="px-4 py-3 font-black text-slate-500">موجودی (کیلوگرم)</th>
            <th className="px-4 py-3 font-black text-slate-500">فی فروش</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {stock.map((row, i) => (
            <tr key={i}>
              <td className="px-4 py-3 font-bold text-slate-800">{row.catalogItem.name}</td>
              <td className="px-4 py-3 text-slate-500 font-bold">
                {catalogTypeLabelFa(row.catalogItem.type)}
              </td>
              <td className="px-4 py-3 font-black">{formatKgFromGrams(row.quantityGrams)}</td>
              <td className="px-4 py-3 font-bold text-orange-600">
                {row.catalogItem.unitPriceRialPerKg
                  ? `${formatToman(row.catalogItem.unitPriceRialPerKg)} تومان/کیلو`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
