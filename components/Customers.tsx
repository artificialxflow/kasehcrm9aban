'use client';

import React, { useMemo, useState } from 'react';
import { CUSTOMERS_DATA, BRANCHES_DATA, CONCEPTS } from '@/lib/constants';
import { BranchConcept, Customer } from '@/lib/types';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMERS_DATA);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickBranch, setQuickBranch] = useState<string>('');
  const [quickConcept, setQuickConcept] = useState<BranchConcept | ''>('');
  const [conceptFilter, setConceptFilter] = useState<BranchConcept | 'all'>('all');
  const [search, setSearch] = useState('');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhone.trim()) return;
    const newCustomer: Customer = {
      id: `NEW-${customers.length + 1}`,
      name: quickName.trim() || 'مشتری جدید',
      phone: quickPhone.trim(),
      totalOrders: 0,
      totalSpend: 0,
      lastOrder: '—',
      avatar: 'https://i.pravatar.cc/150?u=new',
      loyaltyLevel: 'برنزی',
      preferredBranch: quickBranch || undefined,
      preferredConcept: quickConcept || undefined,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setQuickName('');
    setQuickPhone('');
    setQuickBranch('');
    setQuickConcept('');
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesConcept = conceptFilter === 'all' ? true : c.preferredConcept === conceptFilter;
      const text = `${c.name} ${c.phone} ${c.preferredBranch ?? ''}`.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchesSearch = q ? text.includes(q) : true;
      return matchesConcept && matchesSearch;
    });
  }, [customers, conceptFilter, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">بانک مشتریان 👥</h2>
          <p className="text-slate-500 font-bold mt-1">ثبت سریع شماره موبایل مشتریان و مدیریت باشگاه مشتریان کاسه</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200">
            <span className="text-slate-400 text-xs font-bold">جستجو:</span>
            <input
              type="text"
              placeholder="نام یا شماره موبایل..."
              className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none w-40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center gap-2">
            <i className="fa-solid fa-file-export"></i>
            خروجی اکسل
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-4 sm:p-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-black text-slate-800">ثبت سریع مشتری جدید 📱</p>
          <p className="text-[11px] text-slate-500 font-bold">فقط شماره موبایل اجباری است؛ بقیه اطلاعات را می‌توانید بعداً تکمیل کنید.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">نام (اختیاری)</label>
              <input type="text" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500" value={quickName} onChange={(e) => setQuickName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">شماره موبایل *</label>
              <input type="tel" dir="ltr" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500" value={quickPhone} onChange={(e) => setQuickPhone(e.target.value)} placeholder="09xxxxxxxxx" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">شعبه (اختیاری)</label>
              <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500" value={quickBranch} onChange={(e) => setQuickBranch(e.target.value)}>
                <option value="">انتخاب شعبه</option>
                {BRANCHES_DATA.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-500">کانسپت (اختیاری)</label>
              <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500" value={quickConcept} onChange={(e) => setQuickConcept(e.target.value as BranchConcept | '')}>
                <option value="">انتخاب کانسپت</option>
                {CONCEPTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-auto">
          <button type="submit" className="w-full lg:w-40 py-3 rounded-2xl bg-orange-500 text-white text-sm font-black hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all">
            ذخیره مشتری
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 text-[11px] font-black flex-wrap">
          <span className="text-slate-500">فیلتر بر اساس کانسپت:</span>
          <button type="button" onClick={() => setConceptFilter('all')} className={`px-3 py-1 rounded-xl ${conceptFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>همه</button>
          {CONCEPTS.map((c) => (
            <button key={c.id} type="button" onClick={() => setConceptFilter(c.id)} className={`px-3 py-1 rounded-xl text-[11px] ${conceptFilter === c.id ? `${c.badgeClass} shadow-md` : `${c.softBgClass} border border-slate-100`}`}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-2 h-full ${customer.loyaltyLevel === 'طلایی' ? 'bg-amber-400' : customer.loyaltyLevel === 'نقره‌ای' ? 'bg-slate-300' : 'bg-orange-400'}`}></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img src={customer.avatar} alt={customer.name} className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-md" />
                <span className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-lg text-[8px] font-black text-white ${customer.loyaltyLevel === 'طلایی' ? 'bg-amber-400' : 'bg-slate-500'}`}>
                  {customer.loyaltyLevel}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">{customer.name}</h3>
              <p className="text-xs text-slate-400 font-bold mb-4" dir="ltr">{customer.phone}</p>

              <div className="grid grid-cols-2 w-full gap-4 border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">سفارشات</p>
                  <p className="text-sm font-black text-slate-800">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">مجموع خرید</p>
                  <p className="text-sm font-black text-orange-600">{customer.totalSpend.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">آخرین خرید</p>
                  <p className="text-xs font-black text-slate-700">{customer.lastOrder}</p>
                </div>
              </div>

              <div className="mt-6 w-full space-y-2">
                <button className="w-full py-2.5 rounded-xl bg-orange-50 text-orange-600 text-xs font-black hover:bg-orange-500 hover:text-white transition-all">
                  مشاهده تاریخچه خرید
                </button>
                <button className="w-full py-2.5 rounded-xl border border-slate-100 text-slate-400 text-xs font-black hover:bg-slate-50 transition-all">
                  ارسال پیامک اختصاصی
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
