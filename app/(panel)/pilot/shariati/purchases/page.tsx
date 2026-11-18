'use client';

import { useState } from 'react';
import PilotNav from '@/components/pilot/PilotNav';
import { PurchaseInvoiceList } from '@/components/pilot/InvoiceLists';
import PurchaseForm from '@/components/pilot/PurchaseForm';
import PilotFeatureBanner from '@/components/pilot/PilotFeatureBanner';

export default function PilotPurchasesPage() {
  const [key, setKey] = useState(0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">خرید وزنی — پایلوت شریعتی</h2>
      <PilotNav />
      <PilotFeatureBanner />
      <PurchaseForm key={key} onSuccess={() => setKey((k) => k + 1)} />
      <PurchaseInvoiceList refreshKey={key} />
    </div>
  );
}
