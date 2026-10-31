
import React from 'react';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        <h2 className="text-xl font-black text-slate-800 hidden sm:block">{title}</h2>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative group">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
          <input 
            type="text" 
            placeholder="جستجوی سریع سفارش یا مشتری..." 
            className="w-full pr-12 pl-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
          <i className="fa-solid fa-bell text-xl"></i>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800">امیر مدیری</p>
            <p className="text-[10px] text-slate-500 font-bold">مدیر کل مجموعه</p>
          </div>
          <img 
            src="https://picsum.photos/id/64/100/100" 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-orange-200"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
