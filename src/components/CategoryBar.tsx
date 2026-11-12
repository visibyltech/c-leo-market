import React from 'react';
import {
  Smartphone,
  Laptop,
  Tv,
  Refrigerator,
  Microwave,
  Cpu,
  SunMedium,
  Speaker,
  Armchair,
  ShieldCheck,
  Gamepad2,
  Watch,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useNavigation } from '../context/NavigationContext';
import { CategorySlug } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Smartphone,
  Laptop,
  Tv,
  Refrigerator,
  Microwave,
  Cpu,
  SunMedium,
  Speaker,
  Armchair,
  ShieldCheck,
  Gamepad2,
  Watch,
  Layers,
};

export const CategoryBar: React.FC = () => {
  const { openCategory, selectedCategory } = useNavigation();

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Explore Departments</span>
            <span className="text-xs font-semibold text-blue-600">({CATEGORIES.length})</span>
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Browse genuine products by category with Pay Small Small plans
          </p>
        </div>
      </div>

      {/* Horizontal scrolling strip on mobile / wrap on desktop */}
      <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1.5 pt-0.5">
        {CATEGORIES.map((cat) => {
          const IconComp = ICON_MAP[cat.iconName] || Layers;
          const isSelected = selectedCategory === cat.slug;

          return (
            <button
              key={cat.slug}
              onClick={() => openCategory(cat.slug)}
              className={`shrink-0 flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer min-w-[84px] sm:min-w-[100px] group ${
                isSelected
                  ? 'bg-blue-50 border-[#0B4FD8] text-[#0B4FD8] shadow-xs'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-blue-400 hover:shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                  isSelected
                    ? 'bg-[#0B4FD8] text-white'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-[#0B4FD8]'
                }`}
              >
                <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2 max-w-[80px]">
                {cat.name}
              </span>
              {cat.badge && (
                <span className="mt-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full">
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
