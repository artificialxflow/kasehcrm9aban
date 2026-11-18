import PilotNav from '@/components/pilot/PilotNav';
import ScaleDeviceManager from '@/components/pilot/ScaleDeviceManager';

export const metadata = { title: 'دستگاه ترازو | پایلوت شریعتی' };

export default function PilotDevicesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">دستگاه‌های ترازو</h2>
      <p className="text-sm font-bold text-slate-500">
        برای فاکتور دستی و گزارش؛ اتصال فیزیکی همچنان از پل ترازو روی رایانهٔ شعبه است.
      </p>
      <PilotNav />
      <ScaleDeviceManager />
    </div>
  );
}
