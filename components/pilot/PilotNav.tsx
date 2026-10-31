'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/pilot/shariati', label: 'خلاصه پایلوت' },
  { href: '/pilot/shariati/purchases', label: 'خرید وزنی' },
  { href: '/pilot/shariati/sales', label: 'فروش ترازو' },
  { href: '/pilot/shariati/report', label: 'گزارش روزانه' },
];

export default function PilotNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-6">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${
              active ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-200'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
