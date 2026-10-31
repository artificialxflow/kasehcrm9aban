
import React, { useMemo, useState } from 'react';
import { BRANCHES_DATA, CONCEPTS } from '../constants';
import { Branch, BranchConcept } from '../types';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(BRANCHES_DATA);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [activeModal, setActiveModal] = useState<'settings' | 'menu' | null>(null);
  const [conceptFilter, setConceptFilter] = useState<BranchConcept | 'all'>('all');

  // Menu mock data for "View Menu"
  const menuItems = [
    { id: 1, name: 'کاسه کباب مخصوص', price: '۳۸۰,۰۰۰', category: 'کباب', image: '🥘', available: true },
    { id: 2, name: 'جوجه زعفرانی', price: '۲۹۰,۰۰۰', category: 'کباب', image: '🍗', available: true },
    { id: 3, name: 'میرزا قاسمی', price: '۱۴۵,۰۰۰', category: 'پیش‌غذا', image: '🍆', available: true },
    { id: 4, name: 'دوغ محلی پارچه‌ای', price: '۶۵,۰۰۰', category: 'نوشیدنی', image: '🥛', available: false },
    { id: 5, name: 'زیتون پرورده شمال', price: '۸۵,۰۰۰', category: 'مخلفات', image: '🫒', available: true },
    { id: 6, name: 'کته قالبی زعفرانی', price: '۹۵,۰۰۰', category: 'برنج', image: '🍚', available: true },
  ];

  const handleOpenModal = (branch: Branch, type: 'settings' | 'menu') => {
    setSelectedBranch(branch);
    setActiveModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedBranch(null);
  };

  const handleUpdateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    
    setBranches(prev => prev.map(b => b.id === selectedBranch.id ? selectedBranch : b));
    handleCloseModal();
  };

  const filteredBranches = useMemo(
    () => (conceptFilter === 'all' ? branches : branches.filter((b) => b.concept === conceptFilter)),
    [branches, conceptFilter],
  );

  const resolveConceptUi = (concept: BranchConcept) => {
    const def = CONCEPTS.find((c) => c.id === concept);
    if (!def) return { label: concept, badgeClass: 'bg-slate-800 text-white' };
    return { label: def.name, badgeClass: def.badgeClass };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">مدیریت شعب زنجیره‌ای</h2>
          <p className="text-slate-500 font-bold mt-1">مدیریت شعب سوخاری، مکیان برگر، آش و حلیم و کافه‌رستوران</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 px-3 py-2 flex items-center gap-2 text-xs font-black">
            <span className="text-slate-500 whitespace-nowrap">فیلتر بر اساس کانسپت:</span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setConceptFilter('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
                  conceptFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                همه
              </button>
              {CONCEPTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setConceptFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] ${
                    conceptFilter === c.id
                      ? `${c.badgeClass} shadow-md`
                      : `${c.softBgClass} border border-slate-100`
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <button className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center gap-2">
            <i className="fa-solid fa-plus"></i>
            افزودن شعبه جدید
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredBranches.map((branch) => {
          const conceptUi = resolveConceptUi(branch.concept);
          return (
          <div key={branch.id} className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 group">
            <div className="h-24 bg-slate-50 flex items-center justify-center text-4xl group-hover:bg-orange-50 transition-colors">
              📍
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-800">{branch.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${conceptUi.badgeClass}`}>
                      {conceptUi.label}
                    </span>
                    {branch.isMoving && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-amber-100 text-amber-700 flex items-center gap-1">
                        <i className="fa-solid fa-truck-moving" />
                        در حال جابه‌جایی
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    branch.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {branch.isOpen ? '🟢 باز است' : '🔴 بسته است'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">شهر:</span>
                  <span className="text-slate-800 font-black">{branch.city}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">پیک فعال:</span>
                  <span className="text-slate-800 font-black flex items-center gap-1">
                    🛵 {branch.activeCouriers}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">فروش امروز:</span>
                  <span className="text-orange-600 font-black">
                    {branch.dailyRevenue.toLocaleString()} تومان
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => handleOpenModal(branch, 'settings')}
                  className="py-2.5 px-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  تنظیمات شعبه
                </button>
                <button 
                  onClick={() => handleOpenModal(branch, 'menu')}
                  className="py-2.5 px-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-black hover:bg-orange-100 transition-colors"
                >
                  مشاهده منو
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Info Banner */}
      <div className="mt-12 p-8 bg-gradient-to-l from-orange-500 to-orange-400 rounded-[2.5rem] text-white shadow-2xl shadow-orange-100 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <h4 className="text-2xl font-black mb-2">گسترش شعب به شهرهای جدید</h4>
            <p className="font-bold opacity-90 max-w-xl">برنامه ریزی برای افتتاح شعبه «تنکابن» و «نوشهر» در فصل آینده نهایی شد. جهت بررسی پتانسیل بازار کلیک کنید.</p>
          </div>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-sm whitespace-nowrap shadow-lg">
            دریافت طرح توجیهی 📊
          </button>
        </div>
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* --- MODALS --- */}

      {/* Branch Settings Modal */}
      {activeModal === 'settings' && selectedBranch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">تنظیمات {selectedBranch.name}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleUpdateBranch} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2">نام شعبه</label>
                <input 
                  type="text" 
                  value={selectedBranch.name}
                  onChange={(e) => setSelectedBranch({...selectedBranch, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-800">وضعیت شعبه</p>
                  <p className="text-[10px] text-slate-400 font-bold">آیا شعبه در حال حاضر سفارش می‌پذیرد؟</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedBranch({...selectedBranch, isOpen: !selectedBranch.isOpen})}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${selectedBranch.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${selectedBranch.isOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2">تعداد پیک‌های فعال 🛵</label>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedBranch({...selectedBranch, activeCouriers: Math.max(0, selectedBranch.activeCouriers - 1)})}
                    className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    readOnly
                    value={selectedBranch.activeCouriers}
                    className="flex-1 text-center bg-transparent border-none text-2xl font-black text-slate-800"
                  />
                  <button 
                    type="button"
                    onClick={() => setSelectedBranch({...selectedBranch, activeCouriers: selectedBranch.activeCouriers + 1})}
                    className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl font-bold hover:bg-orange-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all"
                >
                  ذخیره تغییرات
                </button>
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Menu Modal */}
      {activeModal === 'menu' && selectedBranch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl">🍽️</div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">لیست منو: {selectedBranch.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">نمایش و مدیریت موجودی غذاها در این شعبه</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {['همه', 'کباب', 'پیش‌غذا', 'نوشیدنی', 'برنج', 'مخلفات'].map((cat, i) => (
                <button key={i} className={`px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${i === 0 ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-orange-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm">
                        {item.image}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-orange-500">{item.price} تومان</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 mb-1">موجودی شعبه</p>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${item.available ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {item.available ? 'موجود' : 'ناموجود'}
                        </span>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-orange-500 transition-colors">
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold italic">نکته: تغییرات موجودی در لحظه روی اپلیکیشن مشتریان اعمال می‌شود.</p>
              <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all">
                به‌روزرسانی کلی منو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
