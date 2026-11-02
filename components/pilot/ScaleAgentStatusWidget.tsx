'use client';

import { useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type Heartbeat = {
  hostname: string;
  lastSeenAt: string;
  payload: {
    agentVersion?: string;
    comPort?: string;
    livePostEnabled?: boolean;
    mode?: string;
  };
};

export default function ScaleAgentStatusWidget() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [hb, setHb] = useState<Heartbeat | null>(null);
  const [error, setError] = useState('');
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    const load = () => {
      fetch(`${base}/scale-agent/status?hostname=FM1`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error && data.ok === false) throw new Error(data.error);
          setHb(data.heartbeat ?? null);
          setError('');
          setNowMs(Date.now());
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'خطا'));
    };
    load();
    const t = setInterval(() => {
      setNowMs(Date.now());
      load();
    }, 30_000);
    return () => clearInterval(t);
  }, [base]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
        وضعیت agent: {error}
      </div>
    );
  }

  if (!hb) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-900">
        هنوز heartbeat از agent (مثلاً FM1) دریافت نشده.
      </div>
    );
  }

  const staleMs = nowMs - new Date(hb.lastSeenAt).getTime();
  const stale = staleMs > 60 * 60 * 1000;

  return (
    <div
      className={`rounded-2xl border p-4 text-sm ${
        stale ? 'border-amber-200 bg-amber-50' : 'border-emerald-100 bg-emerald-50'
      }`}
    >
      <p className="font-black text-slate-800">
        Agent {hb.hostname}
        {stale ? ' · بیش از ۱ ساعت سکوت' : ' · آنلاین اخیر'}
      </p>
      <p className="text-xs font-bold text-slate-600 mt-1">
        آخرین سیگنال: {new Date(hb.lastSeenAt).toLocaleString('fa-IR')}
        {hb.payload?.comPort ? ` · ${hb.payload.comPort}` : ''}
        {hb.payload?.agentVersion ? ` · v${hb.payload.agentVersion}` : ''}
        {hb.payload?.livePostEnabled ? ' · live POST فعال' : ''}
      </p>
    </div>
  );
}
