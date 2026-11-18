'use client';

import { useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type Hb = {
  hostname: string;
  lastSeenAt: string;
  payload: {
    comPort?: string;
    agentVersion?: string;
    livePostEnabled?: boolean;
    lastSerialDataAt?: string;
  };
};

export default function ScaleAgentMonitor() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [rows, setRows] = useState<Hb[]>([]);

  useEffect(() => {
    const load = () => {
      fetch(`${base}/scale-agent/status?all=1`)
        .then((r) => r.json())
        .then((data) => setRows(data.heartbeats ?? []))
        .catch(() => setRows([]));
    };
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [base]);

  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-sm font-black text-slate-700 mb-2">ترازوها / نماینده‌های شعبه</p>
      <ul className="space-y-2 text-xs font-bold text-slate-600">
        {rows.map((hb) => (
          <li key={hb.hostname} className="flex flex-wrap gap-2 items-center">
            <span className="font-black text-slate-800">{hb.hostname}</span>
            <span>{new Date(hb.lastSeenAt).toLocaleString('fa-IR')}</span>
            {hb.payload?.comPort ? <span>· {hb.payload.comPort}</span> : null}
            {hb.payload?.agentVersion ? <span>· v{hb.payload.agentVersion}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
