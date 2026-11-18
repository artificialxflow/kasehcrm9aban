'use client';

import { useCallback, useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

export default function PilotBranchSettings() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [plu, setPlu] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    fetch(`${base}`)
      .then((r) => r.json())
      .then((data) => {
        setPlu(data.branch?.pilotDefaultSalePlu ?? '');
      })
      .catch(() => setMessage('خطا در بارگذاری تنظیم شعبه'));
  }, [base]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${base}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilotDefaultSalePlu: plu.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setMessage('ذخیره شد. برای وزن‌تنها از SIM-DESK/FM1 همین کد فروش وزنی استفاده می‌شود.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 max-w-xl">
      <h4 className="text-sm font-black text-slate-800">کد پیش‌فرض فروش وزن‌تنها (بدون env جدا per کالا)</h4>
      <p className="text-xs text-slate-600 font-bold leading-relaxed">
        وقتی ترازو فقط عدد وزن می‌فرستد، سیستم این کد را روی کالای «فروش وزنی» می‌گذارد. مثلاً{' '}
        <span className="font-mono dir-ltr">FILLET01</span>
      </p>
      <input
        dir="ltr"
        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm"
        value={plu}
        onChange={(e) => setPlu(e.target.value)}
        placeholder="FILLET01"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-black disabled:opacity-50"
      >
        {loading ? '...' : 'ذخیره تنظیم شعبه'}
      </button>
      {message ? <p className="text-xs font-bold text-slate-700">{message}</p> : null}
    </form>
  );
}