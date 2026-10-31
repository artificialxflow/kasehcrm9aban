'use client';

import { useState } from 'react';
import PilotNav from '@/components/pilot/PilotNav';
import SaleForm from '@/components/pilot/SaleForm';

export default function PilotSalesPage() {
  const [key, setKey] = useState(0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">فروش ترازو — پایلوت شریعتی</h2>
      <PilotNav />
      <SaleForm key={key} onSuccess={() => setKey((k) => k + 1)} />
    </div>
  );
}
