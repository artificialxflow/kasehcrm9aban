'use client';

import { useCallback, useEffect, useState } from 'react';
import PilotNav from '@/components/pilot/PilotNav';
import StockTable from '@/components/pilot/StockTable';
import { pilotApiBase, PILOT_BRANCH_LEGACY_ID } from '@/lib/pilot/constants';

type StockRow = Parameters<typeof StockTable>[0]['stock'];

export default function PilotHome() {
  const base = pilotApiBase(PILOT_BRANCH_LEGACY_ID);
  const [stock, setStock] = useState<StockRow>([]);
  const [branchName, setBranchName] = useState('');

  const load = useCallback(() => {
    fetch(`${base}/stock`)
      .then((r) => r.json())
      .then((data) => {
        setStock(data.stock ?? []);
        setBranchName(data.branch?.name ?? '');
      })
      .catch(() => setStock([]));
  }, [base]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">پایلوت انبار وزنی — شریعتی</h2>
        <p className="text-slate-500 font-bold mt-1">
          {branchName || 'سوخاری بابل (شریعتی)'} · ترازو RADIN · فاز ۱: ثبت دستی/بارکد
        </p>
      </div>
      <PilotNav />
      <StockTable stock={stock} />
    </div>
  );
}
