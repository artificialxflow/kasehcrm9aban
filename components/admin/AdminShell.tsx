'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { UserRole } from '@/lib/types';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUserRole: UserRole = 'owner';

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUserRole={currentUserRole}
      />

      <main className="flex-1 flex flex-col lg:mr-64 transition-all duration-300 min-w-0">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          title="کاسه CRM | پنل مدیریت هوشمند"
        />

        <div className="flex-1">{children}</div>

        <footer className="p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-400">
            © ۱۴۰۳ مجموعه غذایی کاسه - طراحی شده برای مدیریت زنجیره‌ای
          </p>
          <div className="flex gap-4 text-slate-400 text-xs font-bold">
            <a href="#" className="hover:text-orange-500 transition-colors">
              پشتیبانی
            </a>
            <a href="#" className="hover:text-orange-500 transition-colors">
              راهنمای سیستم
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
