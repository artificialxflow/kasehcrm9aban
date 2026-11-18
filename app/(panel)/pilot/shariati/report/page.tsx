import PilotNav from '@/components/pilot/PilotNav';
import DailyReport from '@/components/pilot/DailyReport';
import PurchaseBatchReport from '@/components/pilot/PurchaseBatchReport';

export const metadata = {
  title: 'گزارش پایلوت | کاسه CRM',
};

export default function PilotReportPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">گزارش روزانه و بار خرید — پایلوت شریعتی</h2>
      <PilotNav />
      <DailyReport />
      <PurchaseBatchReport />
    </div>
  );
}
