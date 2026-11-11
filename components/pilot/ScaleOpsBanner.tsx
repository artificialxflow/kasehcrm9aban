'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type Heartbeat = {
  hostname: string;
  lastSeenAt: string;
  payload?: { comPort?: string; lastSerialDataAt?: string; livePostEnabled?: boolean };
};

type LastEvent = {
  createdAt: string;
  status: string;
  eventType: string;
};

export default function ScaleOpsBanner() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [hb, setHb] = useState<Heartbeat | null>(null);
  const [count24h, setCount24h] = useState<number | null>(null);
  const [lastEvent, setLastEvent] = useState<LastEvent | null>(null);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    const load = () => {
      setNowMs(Date.now());
      fetch(`${base}/scale-agent/status?all=1`)
        .then((r) => r.json())
        .then((data) => {
          const list = (data.heartbeats ?? []) as Heartbeat[];
          const fm1 = list.find((h) => h.hostname === 'FM1');
          setHb(fm1 ?? list[0] ?? null);
        })
        .catch(() => setHb(null));

      fetch(`${base}/scale-events?stats24h=1`)
        .then((r) => r.json())
        .then((data) => {
          setCount24h(data.stats?.count24h ?? null);
          const ev = data.events?.[0];
          if (ev) {
            setLastEvent({
              createdAt: ev.createdAt,
              status: ev.status,
              eventType: ev.eventType,
            });
          }
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, [base]);

  const stale =
    hb && nowMs > 0 && nowMs - new Date(hb.lastSeenAt).getTime() > 60 * 60 * 1000;

  return (
    <div className="rounded-2xl border-2 border-orange-100 bg-orange-50/80 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-800">کنسول عملیات ترازو</h3>
          <p className="text-xs font-bold text-slate-600 mt-1 max-w-2xl">
            اتصال فیزیکی روی PC شعبه است (Bridge). این صفحه وضعیت سرور و رویدادها را نشان می‌دهد — نه وزن زنده از COM.
          </p>
        </div>
        <Link
          href="/pilot/shariati/scale-guide"
          className="text-xs font-black text-orange-700 underline"
        >
          راهنمای اپراتور
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-xs font-black text-slate-500">Agent / Bridge</p>
          <p className="font-black text-slate-800 mt-1">
            {!hb
              ? 'heartbeat ندارد — Bridge خاموش یا کلید API؟'
              : stale
                ? `${hb.hostname}: بیش از ۱ ساعت سکوت`
                : `${hb.hostname}: آنلاین اخیر`}
          </p>
          {hb?.payload?.comPort ? (
            <p className="text-xs text-slate-500 mt-1">{hb.payload.comPort}</p>
          ) : null}
          {hb?.payload?.lastSerialDataAt ? (
            <p className="text-xs text-slate-500">
              آخرین داده سریال:{' '}
              {new Date(hb.payload.lastSerialDataAt).toLocaleString('fa-IR')}
            </p>
          ) : null}
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-xs font-black text-slate-500">رویداد ۲۴ ساعت</p>
          <p className="font-black text-slate-800 mt-1">{count24h ?? '—'}</p>
          {lastEvent ? (
            <p className="text-xs text-slate-500 mt-1">
              آخرین: {lastEvent.status} · {lastEvent.eventType}
            </p>
          ) : null}
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-xs font-black text-slate-500">لینک سریع</p>
          <Link href="/pilot/shariati/catalog" className="text-xs font-black text-emerald-700 block mt-1">
            کالاها و PLU
          </Link>
          <Link href="/pilot/shariati/devices" className="text-xs font-black text-slate-700 block mt-1">
            دستگاه‌های ترازو
          </Link>
          <p className="text-xs text-slate-500 mt-2">
            خطای 401؟ فایل <span className="font-mono">docs/ops-scale-api-key.md</span> در repo
          </p>
        </div>
      </div>

      <details className="text-xs font-bold text-slate-700 bg-white rounded-xl p-3 border border-slate-100">
        <summary className="cursor-pointer font-black">سه سناریوی رایج</summary>
        <ul className="list-disc pr-5 mt-2 space-y-1 leading-relaxed">
          <li>
            <strong>Bridge OK:</strong> Agent آنلاین + ردیف جدید «فروش» و وضعیت موفق.
          </li>
          <li>
            <strong>قطع Bridge/ترازو:</strong> ثبت manual همین صفحه یا فروش دستی در تب فروش ترازو.
          </li>
          <li>
            <strong>failed:</strong> PLU در کatalog نیست — کالاها و PLU را اصلاح کنید.
          </li>
        </ul>
      </details>
    </div>
  );
}
