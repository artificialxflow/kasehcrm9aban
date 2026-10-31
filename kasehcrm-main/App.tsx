
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Branches from './components/Branches';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Reports from './components/Reports';
import Roles from './components/Roles';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import CustomerApp from './components/customer-app/CustomerApp';
import { UserRole } from './types';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserRole] = useState<UserRole>('owner');

  return (
    <Router>
      <div className="min-h-screen flex bg-[#f8fafc]">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentUserRole={currentUserRole}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:mr-64 transition-all duration-300 min-w-0">
          <Header 
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            title="کاسه CRM | پنل مدیریت هوشمند" 
          />
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/app/*" element={<CustomerApp />} />
            </Routes>
          </div>

          <footer className="p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-400">© ۱۴۰۳ مجموعه غذایی کاسه - طراحی شده برای مدیریت زنجیره‌ای</p>
            <div className="flex gap-4 text-slate-400 text-xs font-bold">
              <a href="#" className="hover:text-orange-500 transition-colors">پشتیبانی</a>
              <a href="#" className="hover:text-orange-500 transition-colors">راهنمای سیستم</a>
            </div>
          </footer>
        </main>
      </div>
    </Router>
  );
};

export default App;
