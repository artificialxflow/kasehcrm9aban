'use client';

import { useCallback, useEffect, useState } from 'react';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type Device = {
  id: string;
  label: string;
  model: string;
  connection: string;
  isActive: boolean;
};

const CONN: Record<string, string> = {
  RS232: 'RS-232',
  USB: 'USB',
  PS2: 'PS/2',
  BARCODE_ONLY: 'فقط بارکد',
};

export default function ScaleDeviceManager() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [devices, setDevices] = useState<Device[]>([]);
  const [label, setLabel] = useState('FM1');
  const [connection, setConnection] = useState('RS232');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`${base}/scale-devices?all=1`);
    const data = await res.json();
    setDevices(data.devices ?? []);
  }, [base]);

  useEffect(() => {
    void load().catch(() => {
      setMessage('بارگذاری دستگاه‌ها ناموفق');
    });
  }, [load]);

  async function createDevice(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const res = await fetch(`${base}/scale-devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, connection }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? 'خطا');
      return;
    }
    setMessage('دستگاه اضافه شد.');
    await load();
  }

  async function toggleActive(d: Device) {
    await fetch(`${base}/scale-devices/${d.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !d.isActive }),
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createDevice} className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 max-w-md">
        <h3 className="font-black text-slate-800">افزودن ترازو / میز</h3>
        <input
          required
          className="w-full px-3 py-2 rounded-xl border font-bold"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="مثلاً FM1"
        />
        <select
          className="w-full px-3 py-2 rounded-xl border font-bold"
          value={connection}
          onChange={(e) => setConnection(e.target.value)}
        >
          <option value="RS232">RS-232</option>
          <option value="USB">USB</option>
          <option value="BARCODE_ONLY">فقط بارکد</option>
        </select>
        <button type="submit" className="w-full py-2 rounded-xl bg-slate-800 text-white font-black text-sm">
          ثبت
        </button>
        {message ? <p className="text-sm font-bold text-slate-600">{message}</p> : null}
      </form>
      <table className="w-full text-sm bg-white rounded-2xl border border-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 font-black text-right">نام</th>
            <th className="px-4 py-2 font-black text-right">اتصال</th>
            <th className="px-4 py-2 font-black text-right">وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="px-4 py-2 font-bold">{d.label}</td>
              <td className="px-4 py-2">{CONN[d.connection] ?? d.connection}</td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  onClick={() => toggleActive(d)}
                  className={`text-xs font-black px-2 py-1 rounded-lg ${d.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}
                >
                  {d.isActive ? 'فعال' : 'غیرفعال'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
