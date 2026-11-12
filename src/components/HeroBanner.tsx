import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowRight, Sparkles, Shield, Zap, CreditCard } from 'lucide-react';
import { CategorySlug } from '../types';
import heroElectronics from '../assets/images/hero_electronics_showcase_1794477527090.jpg';
import heroAppliances from '../assets/images/hero_appliances_home_1794477528247.jpg';
import showcaseSolar from '../assets/images/showcase_solar_power_1794477529448.jpg';
import showcaseSmartphones from '../assets/images/showcase_smartphones_1794477530243.jpg';

interface Slide {
  id: number;
  tagline: string;
  headline: string;
  subtext: string;
  ctaText: string;
  categoryTarget: CategorySlug;
  image: string;
  badge: string;
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tagline: 'C-LEO PSS EXCLUSIVE',
    headline: 'Pay Small Small, Own It Today',
    subtext: 'Get 4K Smart TVs, laptops and luxury electronics from only ₦1,000 daily with zero stress.',
    ctaText: 'Shop Electronics',
    categoryTarget: 'televisions',
    image: heroElectronics,
    badge: 'PSS from ₦1,000/day',
    accentColor: 'from-blue-900/90 via-blue-950/70',
  },
  {
    id: 2,
    tagline: 'PREMIUM HOME LIVING',
    headline: 'Quality Appliances at Affordable Prices',
    subtext: 'Hisense washing machines, LG inverter freezers & digital air fryers with nationwide warranty.',
    ctaText: 'Explore Appliances',
    categoryTarget: 'home-appliances',
    image: heroAppliances,
    badge: 'Up to 20% Off',
    accentColor: 'from-slate-900/90 via-slate-950/70',
  },
  {
    id: 3,
    tagline: 'CLEAN ENERGY SOLUTION',
    headline: 'Buy Now, Pay Later On Solar Systems',
    subtext: 'Felicity hybrid inverters, Sun King lighting and lithium storage for 24/7 uninterrupted power.',
    ctaText: 'View Solar Systems',
    categoryTarget: 'power-solar',
    image: showcaseSolar,
    badge: 'Financing Available',
    accentColor: 'from-amber-950/90 via-slate-950/70',
  },
  {
    id: 4,
    tagline: 'NEXT-GEN MOBILE TECH',
    headline: 'Get Your Favourite Smartphones Today',
    subtext: 'TECNO Camon 50 Pro, Infinix Note 40 and Samsung flagships with fast doorstep delivery.',
    ctaText: 'Shop Smartphones',
    categoryTarget: 'smartphones',
    image: showcaseSmartphones,
    badge: '100% Genuine Tech',
    accentColor: 'from-blue-950/90 via-slate-950/70',
  },
];

export const HeroBanner: React.FC = () => {
  const { openCategory } = useNavigation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatic slideshow changing every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeSlide = SLIDES[currentSlideIndex];

  return (
    <div
      className="relative max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Compact Hero Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-md min-h-[220px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] flex items-center">
        {/* Background Image with Fallback */}
        <img
          src={activeSlide.image}
          alt={activeSlide.headline}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
        />

        {/* Gradient Contrast Scrim */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${activeSlide.accentColor} to-transparent md:w-3/4`}
        />

        {/* Hero Content */}
        <div className="relative z-10 p-5 sm:p-8 md:p-10 max-w-xl text-white">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>{activeSlide.badge}</span>
          </div>

          <p className="text-[11px] sm:text-xs font-semibold text-blue-200 tracking-wider uppercase mb-1">
            {activeSlide.tagline}
          </p>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-2 sm:mb-3">
            {activeSlide.headline}
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 sm:line-clamp-none max-w-md mb-4 sm:mb-5 leading-relaxed">
            {activeSlide.subtext}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openCategory(activeSlide.categoryTarget)}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#0B4FD8] hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-6 bg-amber-400'
                  : 'w-2 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Highlights Strip below Hero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-3">
        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B4FD8] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">Pay Small Small</p>
            <p className="text-[10px] text-slate-500">From ₦1,000 daily plans</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">Buy Now Pay Later</p>
            <p className="text-[10px] text-slate-500">Fast 3-12 mos financing</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">100% Genuine</p>
            <p className="text-[10px] text-slate-500">Direct factory warranty</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">Secure Payments</p>
            <p className="text-[10px] text-slate-500">Convenient payment options</p>
          </div>
        </div>
      </div>
    </div>
  );
};
