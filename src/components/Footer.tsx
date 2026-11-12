import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { CATEGORIES } from '../data/categories';

export const Footer: React.FC = () => {
  const { navigateTo, openCategory } = useNavigation();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 pb-20 md:pb-8">
      {/* PSS Value Proposition Banner */}
      <div className="bg-[#002B7F] text-white py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/IMG-20261112-WA0029_e503f796.jpg"
              alt="C-LEO PSS Official Logo"
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-xs"
            />
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                C-LEO MARKET SERVICE (PSS)
              </h3>
              <p className="text-xs text-blue-200">
                Own electronics and home appliances with Pay Small Small starting from ₦1,000/day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://shop.cleomarkets.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <span>Visit PSS Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => navigateTo('contact')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Contact */}
        <div className="space-y-3 col-span-2 md:col-span-1">
          <h4 className="text-white font-bold text-sm tracking-tight">C-LEO PSS Marketplace</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            The trusted Nigerian destination for genuine smartphones, computers, televisions, solar power, and home appliances.
          </p>
          <div className="space-y-1.5 pt-1 text-slate-400 text-xs">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>0800-CLEO-PSS (0800-2536-777)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>support@cleomarkets.com</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Lekki Phase 1, Lagos & CBD, Abuja</span>
            </p>
          </div>
        </div>

        {/* Col 2: Top Departments */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Top Departments</h4>
          <ul className="space-y-1.5 text-slate-400">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => openCategory(c.slug)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Services */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <button onClick={() => navigateTo('account')} className="hover:text-white transition-colors cursor-pointer">
                Track Your Order
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('policy', { policyType: 'refund' })} className="hover:text-white transition-colors cursor-pointer">
                Returns & Warranty
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors cursor-pointer">
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('policy', { policyType: 'privacy' })} className="hover:text-white transition-colors cursor-pointer">
                Buyer Protection
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('admin')} className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer">
                Admin Management Portal
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Payments & Security */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Payment & Trust</h4>
          <p className="text-slate-400 text-xs">
            Secured payments powered by Paystack. Supports Mastercard, Visa, Verve, Bank Transfer and USSD.
          </p>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>PCI-DSS Level 1 Verified</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Zero card numbers stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
        <p>© 2026 C-LEO MARKET SERVICE (PSS). All rights reserved.</p>
        <p>Built for Nigeria with nationwide courier delivery.</p>
      </div>
    </footer>
  );
};
