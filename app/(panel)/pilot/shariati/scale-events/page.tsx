import PilotNav from '@/components/pilot/PilotNav';
import ScaleAgentStatusWidget from '@/components/pilot/ScaleAgentStatusWidget';
import ScaleEventList from '@/components/pilot/ScaleEventList';

export const metadata = {
  title: 'رویداد ترازو | پایلوت شریعتی',
};

export default function PilotScaleEventsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">رویداد ترازو — پایلوت شریعتی</h2>
        <p className="text-slate-500 font-bold mt-1">
          مانیتoring POST از KasehScaleBridge · وضعیت parse و فاکتور فروش
        </p>
      </div>
      <PilotNav />
      <ScaleAgentStatusWidget />
      <ScaleEventList pollMs={10000} />
    </div>
  );
}
