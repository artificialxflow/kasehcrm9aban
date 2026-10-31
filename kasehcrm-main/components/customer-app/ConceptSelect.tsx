import React from 'react';
import { Link } from 'react-router-dom';
import { CONCEPTS } from '../../constants';

const ConceptSelect: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-slate-800 text-center">انتخاب برند کاسه</h1>
      <p className="text-slate-500 font-bold text-center">یکی از برندهای مجموعه را انتخاب کنید و سفارش خود را ثبت کنید.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CONCEPTS.map((c) => (
          <Link
            key={c.id}
            to={`/app/${c.id}`}
            className={`p-8 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center ${c.softBgClass}`}
          >
            <span className={`inline-block px-4 py-2 rounded-xl text-sm font-black mb-4 ${c.badgeClass}`}>
              {c.name}
            </span>
            <p className="text-sm font-bold text-slate-600 mt-2">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ConceptSelect;
