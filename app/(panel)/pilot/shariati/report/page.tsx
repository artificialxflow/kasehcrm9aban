import PilotNav from '@/components/pilot/PilotNav';
import PilotFeatureBanner from '@/components/pilot/PilotFeatureBanner';
import DailyReport from '@/components/pilot/DailyReport';
import PurchaseBatchReport from '@/components/pilot/PurchaseBatchReport';

export const metadata = {
  title: 'گزارش پایلوت | کاسه CRM',
};

export default function PilotReportPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">گزارش روزانه و بار خرید — شعبه شریعتی</h2>
      <p className="text-sm font-bold text-slate-500 -mt-4">خلاصه امروز و پیگیری هر بار خرید با پیش‌بینی فروش قابل ویرایش</p>
      <PilotNav />
      <PilotFeatureBanner />
      <DailyReport />
      <PurchaseBatchReport />
    </div>
  );
}
