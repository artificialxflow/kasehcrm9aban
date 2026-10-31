'use client';

import React, { useMemo, useState } from 'react';
import { RECENT_ORDERS, CONCEPTS, BRANCHES_DATA } from '@/lib/constants';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(RECENT_ORDERS);
  const [statusFilter, setStatusFilter] = useState<string>('همه');
  const [conceptFilter, setConceptFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OrderStatus.COOKING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case OrderStatus.CANCELLED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentColor = (payment?: PaymentStatus) => {
    if (!payment) return 'bg-slate-100 text-slate-600';
    switch (payment) {
      case 'paid': return 'bg-emerald-50 text-emerald-600';
      case 'pending': return 'bg-amber-50 text-amber-600';
      case 'failed': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'همه' || o.status === statusFilter;
      const matchConcept = conceptFilter === 'all' || o.concept === conceptFilter;
      const matchBranch = branchFilter === 'all' || o.branch === branchFilter;
      const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
      return matchStatus && matchConcept && matchBranch && matchPayment;
    });
  }, [orders, statusFilter, conceptFilter, branchFilter, paymentFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">مدیریت سفارشات 📝</h2>
            <p className="text-slate-500 font-bold">نمایش و پیگیری تمامی سفارشات؛ فیلتر بر اساس شعبه، کانسپت، وضعیت و پرداخت</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200">
          <span className="text-xs font-black text-slate-500">وضعیت سفارش:</span>
          <div className="flex gap-1 flex-wrap">
            {['همه', OrderStatus.COOKING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${statusFilter === status ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{status}</button>
            ))}
          </div>
          <span className="text-slate-300 mx-1">|</span>
          <span className="text-xs font-black text-slate-500">کانسپت:</span>
          <select value={conceptFilter} onChange={(e) => setConceptFilter(e.target.value)} className="px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 bg-slate-50">
            <option value="all">همه</option>
            {CONCEPTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-xs font-black text-slate-500">شعبه:</span>
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 bg-slate-50">
            <option value="all">همه</option>
            {BRANCHES_DATA.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
          <span className="text-xs font-black text-slate-500">پرداخت:</span>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 bg-slate-50">
            <option value="all">همه</option>
            <option value="paid">پرداخت‌شده</option>
            <option value="pending">در انتظار پرداخت</option>
            <option value="failed">ناموفق</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-xs font-black text-slate-400">شناسه</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">مشتری</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">جزییات سفارش</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">شعبه</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">زمان</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">مبلغ نهایی</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">وضعیت سفارش</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">وضعیت پرداخت</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">تغییر وضعیت</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5 text-sm font-black text-slate-800">{order.id}</td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-slate-800">{order.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-bold">کد عضویت: {1000 + (order.id.charCodeAt(1) % 9000)}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1">
                      {order.items.map((item, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 font-bold">{order.branch}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-bold">{order.date}</td>
                  <td className="px-6 py-5 text-sm font-black text-orange-600">{order.totalPrice.toLocaleString()} تومان</td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${getPaymentColor(order.paymentStatus)}`}>
                      {order.paymentStatus === 'paid' ? 'پرداخت‌شده' : order.paymentStatus === 'pending' ? 'در انتظار' : order.paymentStatus === 'failed' ? 'ناموفق' : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={OrderStatus.COOKING}>{OrderStatus.COOKING}</option>
                      <option value={OrderStatus.SHIPPED}>{OrderStatus.SHIPPED}</option>
                      <option value={OrderStatus.DELIVERED}>{OrderStatus.DELIVERED}</option>
                      <option value={OrderStatus.CANCELLED}>{OrderStatus.CANCELLED}</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all">
                        <i className="fa-solid fa-print text-xs"></i>
                      </button>
                      <button type="button" className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-800 hover:text-white transition-all">
                        <i className="fa-solid fa-ellipsis text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
