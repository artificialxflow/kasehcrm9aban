import CatalogManager from '@/components/pilot/CatalogManager';
import PilotBranchSettings from '@/components/pilot/PilotBranchSettings';
import PilotNav from '@/components/pilot/PilotNav';

export const metadata = {
  title: 'کatalog پایلوت | کاسه CRM',
};

export default function PilotCatalogPage() {
  return (
    <div>
      <PilotNav />
      <h2 className="text-2xl font-black text-slate-800 mb-2">مدیریت کالاها — پایلوت شریعتی</h2>
      <p className="text-sm text-slate-500 font-bold mb-6">
        تعریف کد فروش و فی برای ترازو؛ مواد خام برای ثبت خرید. قیمت‌ها در پنل به تومان هستند.
      </p>
      <div className="mb-8">
        <PilotBranchSettings />
      </div>
      <CatalogManager />
    </div>
  );
}
