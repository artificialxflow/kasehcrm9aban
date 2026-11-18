'use client';

import { useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type SimulateResponse = {
  ok?: boolean;
  id?: string;
  error?: string;
  duplicate?: boolean;
  saleId?: string;
  fields?: Record<string, string>;
};

export default function ScaleSimulateForm({ onSaved }: { onSaved?: () => void }) {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [weightGrams, setWeightGrams] = useState('225');
  const [eventType, setEventType] = useState<'sale' | 'test'>('test');
  const [pluCode, setPluCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastResponse, setLastResponse] = useState<{
    status: number;
    body: SimulateResponse;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setLastResponse(null);
    const weight = parseInt(weightGrams, 10);
    if (!Number.isFinite(weight) || weight <= 0) {
      setError('وزن (گرم) معتبر وارد کنید.');
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`${base}/scale-events/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightGrams: weight,
          eventType,
          ...(pluCode.trim() ? { pluCode: pluCode.trim() } : {}),
        }),
      });
      const data = (await res.json()) as SimulateResponse;
      setLastResponse({ status: res.status, body: data });
      if (!data.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      onSaved?.();
    } catch {
      setError('خطای شبکه');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-4"
    >
      <h3 className="text-lg font-black text-slate-800">شبیه‌سازی ترازو از پنل (SIM-CRM)</h3>
      <p className="text-xs font-bold text-slate-600">
        همان قرارداد Bridge بدون افشای <code className="font-mono">SCALE_API_KEY</code> — مسیر shariati §9 ماتریس #4
      </p>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-black text-slate-500">وزن (گرم)</span>
          <input
            type="number"
            min={1}
            value={weightGrams}
            onChange={(ev) => setWeightGrams(ev.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold w-32"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-black text-slate-500">نوع رویداد</span>
          <select
            value={eventType}
            onChange={(ev) => setEventType(ev.target.value as 'sale' | 'test')}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
          >
            <option value="test">test (ذخیره sale)</option>
            <option value="sale">sale</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 min-w-[160px]">
          <span className="text-xs font-black text-slate-500">PLU (اختیاری — pipe)</span>
          <input
            value={pluCode}
            onChange={(ev) => setPluCode(ev.target.value)}
            placeholder="مثلاً 1001"
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-sm font-black disabled:opacity-50"
      >
        {saving ? 'در حال ارسال...' : 'ارسال SIM-CRM → CRM'}
      </button>
      {error ? <p className="text-rose-600 text-sm font-bold">{error}</p> : null}
      {lastResponse ? (
        <pre className="text-xs font-mono bg-white rounded-xl p-3 border border-slate-100 overflow-x-auto">
          {`HTTP ${lastResponse.status}\n${JSON.stringify(lastResponse.body, null, 2)}`}
        </pre>
      ) : null}
    </form>
  );
}