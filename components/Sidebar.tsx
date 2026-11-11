'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: UserRole;
}

const PATH_ACCESS: Record<string, Record<UserRole, boolean>> = {
  '/': { owner: true, branchManager: true, cashier: true, chef: true },
  '/branches': { owner: true, branchManager: true, cashier: false, chef: false },
  '/orders': { owner: true, branchManager: true, cashier: true, chef: true },
  '/customers': { owner: true, branchManager: true, cashier: true, chef: false },
  '/reports': { owner: true, branchManager: false, cashier: false, chef: false },
  '/roles': { owner: true, branchManager: false, cashier: false, chef: false },
  '/blog': { owner: true, branchManager: false, cashier: false, chef: false },
  '/app': { owner: true, branchManager: false, cashier: false, chef: false },
  '/pilot/shariati': { owner: true, branchManager: true, cashier: false, chef: false },
  '/pilot/shariati/catalog': { owner: true, branchManager: true, cashier: false, chef: false },
  '/pilot/shariati/scale-events': { owner: true, branchManager: true, cashier: false, chef: false },
  '/pilot/shariati/devices': { owner: true, branchManager: true, cashier: false, chef: false },
  '/pilot/shariati/scale-guide': { owner: true, branchManager: true, cashier: false, chef: false },
};

const ALL_MENU_ITEMS = [
  { name: 'داشبورد', path: '/', icon: 'fa-house' },
  { name: 'مدیریت شعب', path: '/branches', icon: 'fa-location-dot' },
  { name: 'سفارشات', path: '/orders', icon: 'fa-file-lines' },
  { name: 'مشتریان', path: '/customers', icon: 'fa-users' },
  { name: 'گزارشات', path: '/reports', icon: 'fa-chart-simple' },
  { name: 'کاربران و نقش‌ها', path: '/roles', icon: 'fa-user-shield' },
  { name: 'بلاگ', path: '/blog', icon: 'fa-newspaper' },
  { name: 'وب‌اپ مشتری', path: '/app', icon: 'fa-store' },
  { name: 'پایلوت شریعتی', path: '/pilot/shariati', icon: 'fa-weight-scale' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentUserRole = 'owner' }) => {
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    return ALL_MENU_ITEMS.filter((item) => PATH_ACCESS[item.path]?.[currentUserRole] !== false);
  }, [currentUserRole]);

  const activeClass = "bg-orange-500 text-white shadow-lg";
  const inactiveClass = "text-slate-600 hover:bg-orange-50 hover:text-orange-600";

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white border-l border-slate-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <span className="text-3xl">🥣</span>
          <h1 className="text-2xl font-black text-orange-600 tracking-tight">کاسه</h1>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive =
              item.path === '/'
                ? pathname === '/'
                : pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${isActive ? activeClass : inactiveClass}`}
              >
                <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
