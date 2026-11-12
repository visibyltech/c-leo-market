import React from 'react';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const PolicyView: React.FC = () => {
  const { policyType, goBack, navigateTo } = useNavigation();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12">
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => navigateTo('about')}
          className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0B4FD8] whitespace-nowrap"
        >
          About C-LEO PSS
        </button>
        <button
          onClick={() => navigateTo('contact')}
          className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0B4FD8] whitespace-nowrap"
        >
          Customer Support
        </button>
        <button
          onClick={() => navigateTo('faq')}
          className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0B4FD8] whitespace-nowrap"
        >
          FAQ
        </button>
        <button
          onClick={() => navigateTo('policy', { policyType: 'refund' })}
          className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0B4FD8] whitespace-nowrap"
        >
          Returns & Warranty
        </button>
        <button
          onClick={() => navigateTo('policy', { policyType: 'terms' })}
          className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0B4FD8] whitespace-nowrap"
        >
          Terms of Service
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-8 space-y-6 text-xs text-slate-600 leading-relaxed">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <img
            src="/assets/aistudio/IMG-20261112-WA0029_e503f796.jpg"
            alt="C-LEO PSS Logo"
            className="w-12 h-12 rounded-full object-cover shadow-xs border border-blue-600/20"
          />
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">C-LEO MARKET SERVICE (PSS)</h1>
            <p className="text-[11px] text-[#0B4FD8] font-bold uppercase tracking-wider">
              Buy Now Pay Later · Pay Small Small · Quality Electronics
            </p>
          </div>
        </div>

        {/* Section: About Us */}
        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            About C-LEO MARKET SERVICE (PSS)
          </h2>
          <p>
            C-LEO MARKET SERVICE (PSS) is Nigeria's premier consumer electronics, home appliance and clean energy marketplace. We believe every hardworking individual and family deserves access to high-quality electronics, smartphones, inverters and appliances without financial strain.
          </p>
          <p>
            Through our innovative <strong>Pay Small Small (PSS)</strong> daily micro-installment system and verified <strong>Buy Now, Pay Later (BNPL)</strong> financing partnerships, customers can acquire flagship electronics starting from as low as ₦1,000 per day.
          </p>
        </section>

        {/* Section: Contact & Support */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            Contact & Storefront Locations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-[#0B4FD8]" />
                <span>Business Address</span>
              </div>
              <p className="text-[11px] text-slate-500">41 Church Street, Oshodi, Lagos, Nigeria</p>
              <p className="text-[11px] text-slate-600">C-LEO Market Service (PSS)</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Customer Care Hotline</span>
              </div>
              <p className="text-[11px] text-slate-500">0800-CLEO-PSS (0800-2536-777)</p>
              <p className="text-[11px] text-slate-600">WhatsApp: +234 803 000 0000</p>
            </div>
          </div>
        </section>

        {/* Section: Frequently Asked Questions */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 rounded-xl">
              <h3 className="font-bold text-slate-900 text-xs mb-1">
                How does Pay Small Small (PSS) work?
              </h3>
              <p className="text-slate-600 text-[11px]">
                Pay Small Small allows you to reserve a product and contribute small daily or weekly amounts (starting from ₦1,000/day). Your money is safely held, and once your required threshold or total is completed, your item is delivered brand new with full warranty.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <h3 className="font-bold text-slate-900 text-xs mb-1">
                How do I get approved for Buy Now, Pay Later (BNPL)?
              </h3>
              <p className="text-slate-600 text-[11px]">
                Simply choose "Buy Now, Pay Later" on any eligible product card. Choose your down deposit (20%-50%) and repayment duration (3-12 months). Submit your BVN/NIN and employment details. Our risk assessment team verifies applications within 2-4 hours.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <h3 className="font-bold text-slate-900 text-xs mb-1">
                Are payments secured on this platform?
              </h3>
              <p className="text-slate-600 text-[11px]">
                Customers pay by bank transfer using the account details shown at checkout. Uploading a receipt does not confirm payment; our team checks the transfer and updates the order after verification.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Returns & Warranty */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            Warranty & Returns Policy
          </h2>
          <p>
            Every device sold on C-LEO Market Service is 100% genuine and comes with authorized manufacturer warranty (from 12 months up to 10 years for inverter compressors).
          </p>
          <p>
            We offer a 7-day hassle-free replacement window if any product arrives defective or does not match specifications.
          </p>
        </section>
      </div>
    </div>
  );
};
