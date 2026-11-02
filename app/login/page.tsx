'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ورود ناموفق');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6" dir="rtl">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-lg p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-800">ورود پنل کاسه</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">پایلوت شریعتی و مدیریت شعب</p>
        </div>
        {error ? <p className="text-sm font-bold text-rose-600">{error}</p> : null}
        <label className="block">
          <span className="text-xs font-black text-slate-500">نام کاربری</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 font-bold"
            autoComplete="username"
          />
        </label>
        <label className="block">
          <span className="text-xs font-black text-slate-500">رمز عبور</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 font-bold"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-black disabled:opacity-60"
        >
          {loading ? '…' : 'ورود'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <LoginForm />
    </Suspense>
  );
}
