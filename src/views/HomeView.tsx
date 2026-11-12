import React, { useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryBar } from '../components/CategoryBar';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { Sparkles, Flame, Award, Clock, ArrowRight, Zap, Shield, SunMedium } from 'lucide-react';
import { formatNaira } from '../services/store';

export const HomeView: React.FC = () => {
  const { products } = useShop();
  const { openCategory, navigateTo } = useNavigation();

  // Curated Collections
  const pssOffers = products.filter((p) => p.paySmallSmallDaily <= 1500).slice(0, 4);
  const trendingProducts = products.filter((p) => p.isTrending).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival || p.isFeatured).slice(0, 4);
  const solarEnergy = products.filter((p) => p.category === 'power-solar').slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-12">
      {/* 1. Hero Promotional Slideshow */}
      <HeroBanner />

      {/* 2. 13 Shopping Categories with Horizontal Scroll on Mobile */}
      <CategoryBar />

      {/* 3. Section: Pay Small Small Daily Offers (From ₦1,000/day) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-gradient-to-r from-blue-900 via-[#0B4FD8] to-blue-800 rounded-2xl p-4 sm:p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                PSS
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Pay Small Small Offers</span>
                  <span className="text-xs font-bold text-amber-300 bg-black/20 px-2 py-0.5 rounded-full">
                    From ₦1,000 / day
                  </span>
                </h2>
                <p className="text-xs text-blue-100">
                  Own high-grade electronics and appliances with zero lump-sum stress
                </p>
              </div>
            </div>

            <a
              href="https://shop.cleomarkets.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors self-start sm:self-auto"
            >
              <span>Explore All PSS Plans on shop.cleomarkets.com</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Strict 2-column on mobile as mandated! */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {pssOffers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section: Trending Electronics */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Trending in Nigeria
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Most popular smartphones, 4K TVs and sound systems this week
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('category')}
            className="text-xs font-bold text-[#0B4FD8] hover:text-[#002B7F] flex items-center gap-1 cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Mobile Grid! */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Section: Clean Solar & Hybrid Power Systems */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <SunMedium className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Power & Solar Systems (24/7 Electricity)
                </h2>
                <p className="text-[11px] text-slate-600">
                  Felicity inverters, Sun King home kits and high-capacity lithium storage
                </p>
              </div>
            </div>

            <button
              onClick={() => openCategory('power-solar')}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View Solar Inverters ({solarEnergy.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2-Column Mobile Grid! */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {solarEnergy.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Section: Best Sellers */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Top Best Sellers
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Customer favorites backed by official manufacturer warranties
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('category')}
            className="text-xs font-bold text-[#0B4FD8] hover:text-[#002B7F] flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Mobile Grid! */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Section: New Arrivals */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                New Arrivals
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Latest smartphones, AI glasses, Starlink kits and consoles
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('category')}
            className="text-xs font-bold text-[#0B4FD8] hover:text-[#002B7F] flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Mobile Grid! */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. Promotional Value Callout */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 md:col-span-2">
            <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
              Flexible Nigerian E-Commerce
            </span>
            <h3 className="text-lg sm:text-2xl font-black tracking-tight">
              Why Shop With C-LEO MARKET SERVICE (PSS)?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              We eliminate high upfront barriers to electronics ownership with flexible daily micro-payments, verified credit terms, and rapid nationwide delivery. Every product is 100% genuine with factory warranty.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => navigateTo('category')}
              className="w-full py-3 px-5 bg-[#0B4FD8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Browse All Products Now
            </button>
            <a
              href="https://shop.cleomarkets.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all block text-center"
            >
              Open PSS Portal ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
