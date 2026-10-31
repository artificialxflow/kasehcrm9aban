import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CONCEPTS } from '../../constants';
import { useCart } from './CartContext';

const MOCK_MENU_ITEMS: { id: string; name: string; price: number; concept: string }[] = [
  { id: 'm1', name: 'بال سوخاری اسپایسی', price: 120000, concept: 'fried' },
  { id: 'm2', name: 'فیله سوخاری', price: 180000, concept: 'fried' },
  { id: 'm3', name: 'مکیان برگر دوبل', price: 150000, concept: 'burger' },
  { id: 'm4', name: 'سیب‌زمینی مخصوص', price: 45000, concept: 'burger' },
  { id: 'm5', name: 'آش رشته مخصوص', price: 95000, concept: 'ash' },
  { id: 'm6', name: 'حلیم گندم', price: 85000, concept: 'ash' },
  { id: 'm7', name: 'لاته کاراملی', price: 75000, concept: 'cafe' },
];

const MenuPage: React.FC = () => {
  const { concept } = useParams<{ concept: string }>();
  const { addToCart } = useCart();
  const conceptDef = CONCEPTS.find((c) => c.id === concept);
  const items = MOCK_MENU_ITEMS.filter((m) => m.concept === concept);

  if (!conceptDef) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-600">کانسپت یافت نشد.</p>
        <Link to="/app" className="text-orange-500 font-bold mt-2 inline-block">بازگشت به انتخاب برند</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{conceptDef.name}</h1>
          <p className="text-slate-500 font-bold mt-1">{conceptDef.description}</p>
        </div>
        <Link to="/app/cart" className="px-4 py-2 rounded-2xl bg-slate-800 text-white text-sm font-black">
          سبد خرید
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-slate-800">{item.name}</p>
              <p className="text-sm font-bold text-orange-600">{item.price.toLocaleString()} تومان</p>
            </div>
            <button
              type="button"
              onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
              className={`px-4 py-2 rounded-xl text-sm font-black ${conceptDef.badgeClass}`}
            >
              افزودن به سبد
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-center text-slate-500 font-bold">فعلاً آیتمی برای این برند تعریف نشده است.</p>
      )}
    </div>
  );
};

export default MenuPage;
