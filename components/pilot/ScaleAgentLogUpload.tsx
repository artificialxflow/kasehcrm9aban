'use client';

import { useCallback, useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type UploadRow = { id: string; receivedAt: string; lineCount: number };

export default function ScaleAgentLogUploadPanel() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [text, setText] = useState('');
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUploads = useCallback(() => {
    fetch(`${base}/scale-agent/logs/panel`)
      .then((r) => r.json())
      .then((data) => setUploads(data.uploads ?? []))
      .catch(() => setUploads([]));
  }, [base]);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    const content = await file.text();
    setText(content);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${base}/scale-agent/logs/panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? 'آپلود ناموفق');
      setMessage(`ذخیره شد — ${data.count} خط (id: ${data.id})`);
      setText('');
      loadUploads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
      <h3 className="text-lg font-black text-slate-800">آپلود لاگ Bridge (پشتیبانی)</h3>
      <p className="text-xs font-bold text-slate-500">
        فایل JSONL روزانه از <code className="font-mono">bridge-YYYY-MM-DD.log</code> — حداکثر ۵۰۰ خط
      </p>
      <label className="block">
        <span className="text-xs font-black text-slate-500">انتخاب فایل</span>
        <input
          type="file"
          accept=".log,.jsonl,.txt"
          className="mt-1 text-sm"
          onChange={(ev) => onFile(ev.target.files?.[0] ?? null)}
        />
      </label>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={text}
          onChange={(ev) => setText(ev.target.value)}
          rows={6}
          className="w-full font-mono text-xs rounded-xl border border-slate-200 p-3"
          placeholder="یا خطوط JSON را اینجا بچسبانید..."
        />
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="px-5 py-2 rounded-xl bg-slate-700 text-white text-sm font-black disabled:opacity-50"
        >
          {saving ? 'در حال آپلود...' : 'ارسال به سرور'}
        </button>
      </form>
      {error ? <p className="text-rose-600 text-sm font-bold">{error}</p> : null}
      {message ? <p className="text-emerald-700 text-sm font-bold">{message}</p> : null}
      {uploads.length > 0 ? (
        <ul className="text-xs space-y-1 font-bold text-slate-600">
          {uploads.map((u) => (
            <li key={u.id}>
              {new Date(u.receivedAt).toLocaleString('fa-IR')} — {u.lineCount} خط —{' '}
              <span className="font-mono">{u.id.slice(0, 8)}…</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}