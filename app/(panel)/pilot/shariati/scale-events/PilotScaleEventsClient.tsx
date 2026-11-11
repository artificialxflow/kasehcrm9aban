'use client';

import { useState } from 'react';
import PilotNav from '@/components/pilot/PilotNav';
import ScaleAgentStatusWidget from '@/components/pilot/ScaleAgentStatusWidget';
import ScaleAgentMonitor from '@/components/pilot/ScaleAgentMonitor';
import ScaleEventList from '@/components/pilot/ScaleEventList';
import ScaleManualEntryForm from '@/components/pilot/ScaleManualEntryForm';
import ScaleOpsBanner from '@/components/pilot/ScaleOpsBanner';

export default function PilotScaleEventsClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">رویداد ترازو — پایلوت شریعتی</h2>
        <p className="text-slate-500 font-bold mt-1">
          فقط رویدادهای تجاری از KasehScaleBridge · استریم خام وزن به سرور ارسال نمی‌شود
        </p>
      </div>
      <PilotNav />
      <ScaleOpsBanner />
      <ScaleAgentStatusWidget />
      <ScaleAgentMonitor />
      <ScaleManualEntryForm onSaved={() => setRefreshKey((k) => k + 1)} />
      <ScaleEventList
        pollMs={10000}
        refreshKey={refreshKey}
        onManualSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
